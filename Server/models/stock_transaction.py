from datetime import datetime
from bson.objectid import ObjectId
from config.database import get_db


class StockTransaction:
    """Stock Transaction Model"""

    TYPES = ['in', 'out', 'adjustment']

    REASONS = [
        'purchase', 'sale', 'return', 'damage', 'expired',
        'theft', 'adjustment', 'transfer', 'production',
        'sample', 'other'
    ]

    PARTY_TYPES = ['supplier', 'customer', 'other']

    @staticmethod
    def get_collection():
        """Get stock transactions collection"""
        db = get_db()
        return db.stocktransactions  # type: ignore

    @staticmethod
    def create(data):
        """Create a new stock transaction"""
        collection = StockTransaction.get_collection()

        # Calculate total amount if not provided
        if 'unitPrice' in data and 'quantity' in data and 'totalAmount' not in data:
            data['totalAmount'] = data['unitPrice'] * data['quantity']

        # Set defaults
        if 'performedBy' not in data:
            data['performedBy'] = 'System'
        if 'transactionDate' not in data:
            data['transactionDate'] = datetime.utcnow()

        data['createdAt'] = datetime.utcnow()
        data['updatedAt'] = datetime.utcnow()

        result = collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @staticmethod
    def find_all(filter_dict=None, skip=0, limit=20, sort_by='transactionDate', sort_order=-1):
        """Find all transactions with pagination"""
        collection = StockTransaction.get_collection()
        filter_dict = filter_dict or {}

        cursor = collection.find(filter_dict).sort(
            sort_by, sort_order).skip(skip).limit(limit)
        transactions = list(cursor)
        total = collection.count_documents(filter_dict)

        return transactions, total

    @staticmethod
    def find_by_item(item_id, limit=50):
        """Find transactions for a specific item"""
        collection = StockTransaction.get_collection()

        cursor = collection.find({
            'itemId': ObjectId(item_id)
        }).sort('transactionDate', -1).limit(limit)

        return list(cursor)

    @staticmethod
    def aggregate(pipeline):
        """Execute aggregation pipeline"""
        collection = StockTransaction.get_collection()
        return list(collection.aggregate(pipeline))

    @staticmethod
    def to_dict(transaction):
        """Convert MongoDB document to dictionary"""
        if not transaction:
            return None

        # Convert ObjectId to string
        transaction['id'] = str(transaction['_id'])
        del transaction['_id']  # Remove the original ObjectId field

        if 'itemId' in transaction and isinstance(transaction['itemId'], ObjectId):
            transaction['itemId'] = str(transaction['itemId'])

        # Convert dates to ISO format strings
        if 'transactionDate' in transaction and isinstance(transaction['transactionDate'], datetime):
            transaction['transactionDate'] = transaction['transactionDate'].isoformat()
        if 'createdAt' in transaction and isinstance(transaction['createdAt'], datetime):
            transaction['createdAt'] = transaction['createdAt'].isoformat()
        if 'updatedAt' in transaction and isinstance(transaction['updatedAt'], datetime):
            transaction['updatedAt'] = transaction['updatedAt'].isoformat()

        return transaction

    @staticmethod
    def create_indexes():
        """Create database indexes"""
        collection = StockTransaction.get_collection()

        # Create indexes for better performance
        collection.create_index([('itemId', 1), ('transactionDate', -1)])
        collection.create_index('type')
        collection.create_index([('transactionDate', -1)])

        print('✅ Stock transaction indexes created')
