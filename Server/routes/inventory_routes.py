from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from datetime import datetime
import re

from models.inventory_item import InventoryItem
from models.stock_transaction import StockTransaction

bp = Blueprint('inventory', __name__)


@bp.route('', methods=['GET'])
def get_all_items():
    """Get all inventory items with filtering and pagination"""
    try:
        # Get query parameters
        category = request.args.get('category')
        status = request.args.get('status')
        stock_status = request.args.get('stockStatus')
        search = request.args.get('search')
        sort_by = request.args.get('sortBy', 'createdAt')
        order = request.args.get('order', 'desc')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))

        # Build filter
        filter_dict = {}

        if category:
            filter_dict['category'] = category
        if status:
            filter_dict['status'] = status
        if search:
            # MongoDB text search or regex
            filter_dict['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'sku': {'$regex': search, '$options': 'i'}},
                {'description': {'$regex': search, '$options': 'i'}}
            ]

        # Stock status filtering
        if stock_status:
            if stock_status == 'out-of-stock':
                filter_dict['quantity'] = 0
            elif stock_status == 'low-stock':
                filter_dict['$expr'] = {'$lte': ['$quantity', '$reorderLevel']}
                filter_dict['quantity'] = {'$gt': 0}
            elif stock_status == 'in-stock':
                filter_dict['$expr'] = {'$gt': ['$quantity', '$reorderLevel']}

        # Pagination
        skip = (page - 1) * limit
        sort_order = -1 if order == 'desc' else 1

        # Get items
        items, total = InventoryItem.find_all(
            filter_dict, skip, limit, sort_by, sort_order)

        # Convert to dict with virtuals
        items_list = [InventoryItem.to_dict(item) for item in items]

        return jsonify({
            'success': True,
            'count': len(items_list),
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit,
            'data': items_list
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching inventory items',
            'error': str(e)
        }), 500


@bp.route('/<item_id>', methods=['GET'])
def get_item_by_id(item_id):
    """Get single inventory item by ID"""
    try:
        item = InventoryItem.find_by_id(item_id)

        if not item:
            return jsonify({
                'success': False,
                'message': 'Item not found'
            }), 404

        return jsonify({
            'success': True,
            'data': InventoryItem.to_dict(item)
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching item',
            'error': str(e)
        }), 500


@bp.route('', methods=['POST'])
def create_item():
    """Create new inventory item"""
    try:
        data = request.get_json()

        # Check if SKU already exists
        if 'sku' in data:
            existing = InventoryItem.find_by_sku(data['sku'])
            if existing:
                return jsonify({
                    'success': False,
                    'message': 'SKU already exists'
                }), 400

        # Transform supplier data if provided
        if 'supplierName' in data or 'supplierContact' in data:
            data['supplier'] = {
                'name': data.pop('supplierName', ''),
                'phone': data.pop('supplierContact', ''),
                'contactPerson': data.pop('supplierContactPerson', ''),
                'email': data.pop('supplierEmail', '')
            }

        # Handle dates
        if 'expiryDate' in data and data['expiryDate']:
            data['expiryDate'] = datetime.fromisoformat(
                data['expiryDate'].replace('Z', '+00:00'))
        elif 'expiryDate' in data:
            del data['expiryDate']

        if 'manufacturingDate' in data and data['manufacturingDate']:
            data['manufacturingDate'] = datetime.fromisoformat(
                data['manufacturingDate'].replace('Z', '+00:00'))
        elif 'manufacturingDate' in data:
            del data['manufacturingDate']

        # Ensure SKU is uppercase
        if 'sku' in data:
            data['sku'] = data['sku'].upper()

        # Create item
        item = InventoryItem.create(data)

        return jsonify({
            'success': True,
            'message': 'Item created successfully',
            'data': InventoryItem.to_dict(item)
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error creating item',
            'error': str(e)
        }), 400


@bp.route('/<item_id>', methods=['PUT'])
def update_item(item_id):
    """Update inventory item"""
    try:
        data = request.get_json()

        # Update item
        item = InventoryItem.update(item_id, data)

        if not item:
            return jsonify({
                'success': False,
                'message': 'Item not found'
            }), 404

        return jsonify({
            'success': True,
            'message': 'Item updated successfully',
            'data': InventoryItem.to_dict(item)
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error updating item',
            'error': str(e)
        }), 400


@bp.route('/<item_id>', methods=['DELETE'])
def delete_item(item_id):
    """Delete inventory item"""
    try:
        # Check if item exists
        item = InventoryItem.find_by_id(item_id)
        if not item:
            return jsonify({
                'success': False,
                'message': 'Item not found'
            }), 404

        # Delete item
        success = InventoryItem.delete(item_id)

        if success:
            return jsonify({
                'success': True,
                'message': 'Item deleted successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to delete item'
            }), 500

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error deleting item',
            'error': str(e)
        }), 500


@bp.route('/alerts/low-stock', methods=['GET'])
def get_low_stock_items():
    """Get low stock items"""
    try:
        collection = InventoryItem.get_collection()

        items = list(collection.find({
            '$expr': {'$lte': ['$quantity', '$reorderLevel']},
            'status': 'active'
        }).sort('quantity', 1))

        items_list = [InventoryItem.to_dict(item) for item in items]

        return jsonify({
            'success': True,
            'count': len(items_list),
            'data': items_list
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching low stock items',
            'error': str(e)
        }), 500


@bp.route('/alerts/expiring', methods=['GET'])
def get_expiring_items():
    """Get expiring items"""
    try:
        days_threshold = int(request.args.get('days', 30))
        today = datetime.utcnow()
        future_date = datetime.utcnow()
        future_date = future_date.replace(day=today.day + days_threshold)

        collection = InventoryItem.get_collection()

        items = list(collection.find({
            'expiryDate': {
                '$gte': today,
                '$lte': future_date
            },
            'status': 'active'
        }).sort('expiryDate', 1))

        items_list = [InventoryItem.to_dict(item) for item in items]

        return jsonify({
            'success': True,
            'count': len(items_list),
            'data': items_list
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching expiring items',
            'error': str(e)
        }), 500


@bp.route('/stats/summary', methods=['GET'])
def get_inventory_stats():
    """Get inventory summary/stats"""
    try:
        collection = InventoryItem.get_collection()

        # Total active items
        total = collection.count_documents({'status': 'active'})

        # Total stock value
        pipeline = [
            {'$match': {'status': 'active'}},
            {'$group': {'_id': None, 'total': {'$sum': '$stockValue'}}}
        ]
        stock_value_result = list(collection.aggregate(pipeline))
        total_stock_value = stock_value_result[0]['total'] if stock_value_result else 0

        # Low stock count
        low_stock = collection.count_documents({
            '$expr': {'$lte': ['$quantity', '$reorderLevel']},
            'status': 'active',
            'quantity': {'$gt': 0}
        })

        # Out of stock count
        out_of_stock = collection.count_documents({
            'quantity': 0,
            'status': 'active'
        })

        # In stock count
        in_stock = collection.count_documents({
            '$expr': {'$gt': ['$quantity', '$reorderLevel']},
            'status': 'active'
        })

        # Category distribution
        category_pipeline = [
            {'$match': {'status': 'active'}},
            {
                '$group': {
                    '_id': '$category',
                    'count': {'$sum': 1},
                    'totalValue': {'$sum': '$stockValue'}
                }
            },
            {'$sort': {'count': -1}}
        ]
        category_distribution = list(collection.aggregate(category_pipeline))

        return jsonify({
            'success': True,
            'data': {
                'total': total,
                'inStock': in_stock,
                'lowStock': low_stock,
                'outOfStock': out_of_stock,
                'totalStockValue': total_stock_value,
                'categoryDistribution': category_distribution
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching inventory stats',
            'error': str(e)
        }), 500
