from datetime import datetime
from bson.objectid import ObjectId
from config.database import get_db


class InventoryItem:
    """Inventory Item Model"""

    CATEGORIES = [
        'Electronics', 'Furniture', 'Clothing', 'Food & Beverage',
        'Raw Materials', 'Finished Goods', 'Office Supplies',
        'Medical', 'Automotive', 'Other'
    ]

    UNITS = ['pcs', 'kg', 'ltr', 'box', 'pack',
             'dozen', 'meter', 'carton', 'bag', 'roll']

    STATUSES = ['active', 'inactive', 'discontinued']

    @staticmethod
    def get_collection():
        """Get inventory items collection"""
        db = get_db()
        return db.inventoryitems  # type: ignore

    @staticmethod
    def create(data):
        """Create a new inventory item"""
        collection = InventoryItem.get_collection()

        # Calculate stock value
        data['stockValue'] = data.get('quantity', 0) * data.get('costPrice', 0)
        data['createdAt'] = datetime.utcnow()
        data['updatedAt'] = datetime.utcnow()

        # Set defaults
        if 'status' not in data:
            data['status'] = 'active'
        if 'unit' not in data:
            data['unit'] = 'pcs'
        if 'lastRestocked' not in data and data.get('quantity', 0) > 0:
            data['lastRestocked'] = datetime.utcnow()

        result = collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @staticmethod
    def find_all(filter_dict=None, skip=0, limit=10, sort_by='createdAt', sort_order=-1):
        """Find all inventory items with pagination"""
        collection = InventoryItem.get_collection()
        filter_dict = filter_dict or {}

        cursor = collection.find(filter_dict).sort(
            sort_by, sort_order).skip(skip).limit(limit)
        items = list(cursor)
        total = collection.count_documents(filter_dict)

        return items, total

    @staticmethod
    def find_by_id(item_id):
        """Find inventory item by ID"""
        collection = InventoryItem.get_collection()
        return collection.find_one({'_id': ObjectId(item_id)})

    @staticmethod
    def find_by_sku(sku):
        """Find inventory item by SKU"""
        collection = InventoryItem.get_collection()
        return collection.find_one({'sku': sku.upper()})

    @staticmethod
    def update(item_id, data):
        """Update inventory item"""
        collection = InventoryItem.get_collection()

        # Recalculate stock value if quantity or cost price changed
        if 'quantity' in data or 'costPrice' in data:
            item = InventoryItem.find_by_id(item_id)
            if item:
                quantity = data.get('quantity', item.get('quantity', 0))
                cost_price = data.get('costPrice', item.get('costPrice', 0))
                data['stockValue'] = quantity * cost_price

        data['updatedAt'] = datetime.utcnow()

        result = collection.update_one(
            {'_id': ObjectId(item_id)},
            {'$set': data}
        )

        if result.modified_count > 0:
            return InventoryItem.find_by_id(item_id)
        return None

    @staticmethod
    def delete(item_id):
        """Delete inventory item"""
        collection = InventoryItem.get_collection()
        result = collection.delete_one({'_id': ObjectId(item_id)})
        return result.deleted_count > 0

    @staticmethod
    def get_stock_status(item):
        """Calculate stock status for an item"""
        quantity = item.get('quantity', 0)
        reorder_level = item.get('reorderLevel', 0)
        max_stock_level = item.get('maxStockLevel')

        if quantity == 0:
            return 'out-of-stock'
        elif quantity <= reorder_level:
            return 'low-stock'
        elif max_stock_level and quantity >= max_stock_level:
            return 'overstock'
        else:
            return 'in-stock'

    @staticmethod
    def get_expiry_status(item):
        """Calculate expiry status for an item"""
        expiry_date = item.get('expiryDate')
        if not expiry_date:
            return None

        today = datetime.utcnow()
        if isinstance(expiry_date, str):
            expiry_date = datetime.fromisoformat(
                expiry_date.replace('Z', '+00:00'))

        days_until_expiry = (expiry_date - today).days

        if days_until_expiry < 0:
            return 'expired'
        elif days_until_expiry <= 7:
            return 'expiring-soon'
        elif days_until_expiry <= 30:
            return 'expiring-this-month'
        else:
            return 'valid'

    @staticmethod
    def to_dict(item):
        """Convert MongoDB document to dictionary with virtuals"""
        if not item:
            return None

        # Convert ObjectId to string
        item['id'] = str(item['_id'])
        del item['_id']  # Remove the original ObjectId field

        # Convert dates to ISO format strings
        if 'createdAt' in item and isinstance(item['createdAt'], datetime):
            item['createdAt'] = item['createdAt'].isoformat()
        if 'updatedAt' in item and isinstance(item['updatedAt'], datetime):
            item['updatedAt'] = item['updatedAt'].isoformat()
        if 'expiryDate' in item and isinstance(item['expiryDate'], datetime):
            item['expiryDate'] = item['expiryDate'].isoformat()
        if 'manufacturingDate' in item and isinstance(item['manufacturingDate'], datetime):
            item['manufacturingDate'] = item['manufacturingDate'].isoformat()
        if 'lastRestocked' in item and isinstance(item['lastRestocked'], datetime):
            item['lastRestocked'] = item['lastRestocked'].isoformat()

        item['stockStatus'] = InventoryItem.get_stock_status(item)
        item['expiryStatus'] = InventoryItem.get_expiry_status(item)

        return item

    @staticmethod
    def create_indexes():
        """Create database indexes"""
        collection = InventoryItem.get_collection()

        # Create indexes for better performance
        collection.create_index('sku', unique=True)
        collection.create_index([('category', 1), ('status', 1)])
        collection.create_index([('name', 'text'), ('description', 'text')])

        print('✅ Inventory item indexes created')
