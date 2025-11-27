from flask import Blueprint, request, jsonify, current_app
from bson.objectid import ObjectId
from datetime import datetime

from models.inventory_item import InventoryItem
from models.stock_transaction import StockTransaction

bp = Blueprint('transactions', __name__)


@bp.route('', methods=['GET'])
def get_all_transactions():
    """Get all transactions with filtering and pagination"""
    try:
        # Get query parameters
        item_id = request.args.get('itemId')
        trans_type = request.args.get('type')
        reason = request.args.get('reason')
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))

        # Build filter
        filter_dict = {}

        if item_id:
            filter_dict['itemId'] = ObjectId(item_id)
        if trans_type:
            filter_dict['type'] = trans_type
        if reason:
            filter_dict['reason'] = reason

        if start_date or end_date:
            filter_dict['transactionDate'] = {}
            if start_date:
                filter_dict['transactionDate']['$gte'] = datetime.fromisoformat(
                    start_date.replace('Z', '+00:00'))
            if end_date:
                filter_dict['transactionDate']['$lte'] = datetime.fromisoformat(
                    end_date.replace('Z', '+00:00'))

        # Pagination
        skip = (page - 1) * limit

        # Get transactions
        transactions, total = StockTransaction.find_all(
            filter_dict, skip, limit)

        # Populate item details
        collection = InventoryItem.get_collection()
        for trans in transactions:
            if 'itemId' in trans:
                item = collection.find_one({'_id': trans['itemId']})
                if item:
                    trans['itemId'] = {
                        '_id': str(item['_id']),
                        'name': item.get('name'),
                        'sku': item.get('sku'),
                        'category': item.get('category')
                    }

        # Convert to dict
        trans_list = [StockTransaction.to_dict(t) for t in transactions]

        return jsonify({
            'success': True,
            'count': len(trans_list),
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit,
            'data': trans_list
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching transactions',
            'error': str(e)
        }), 500


@bp.route('/item/<item_id>', methods=['GET'])
def get_item_transactions(item_id):
    """Get transactions for a specific item"""
    try:
        transactions = StockTransaction.find_by_item(item_id)
        trans_list = [StockTransaction.to_dict(t) for t in transactions]

        return jsonify({
            'success': True,
            'count': len(trans_list),
            'data': trans_list
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching item transactions',
            'error': str(e)
        }), 500


@bp.route('/stock-in', methods=['POST'])
def stock_in():
    """Add stock to inventory"""
    try:
        data = request.get_json()
        item_id = data.get('itemId')
        quantity = int(data.get('quantity', 0))
        reason = data.get('reason')

        # Validate item exists
        item = InventoryItem.find_by_id(item_id)
        if not item:
            return jsonify({
                'success': False,
                'message': 'Item not found'
            }), 404

        # Record previous quantity
        previous_quantity = item.get('quantity', 0)
        new_quantity = previous_quantity + quantity

        # Update item quantity
        update_data = {
            'quantity': new_quantity,
            'lastRestocked': datetime.utcnow()
        }

        # Recalculate stock value
        update_data['stockValue'] = new_quantity * item.get('costPrice', 0)

        updated_item = InventoryItem.update(item_id, update_data)

        # Create transaction record
        trans_data = {
            'itemId': ObjectId(item_id),
            'type': 'in',
            'quantity': quantity,
            'previousQuantity': previous_quantity,
            'newQuantity': new_quantity,
            'reason': reason,
            **{k: v for k, v in data.items() if k not in ['itemId', 'quantity', 'reason']}
        }

        transaction = StockTransaction.create(trans_data)

        # Emit WebSocket event
        if hasattr(current_app, 'socketio'):
            from sockets.inventory_socket import emit_stock_transaction, emit_inventory_update
            emit_stock_transaction(current_app.socketio,  # type: ignore
                                   transaction, updated_item)
            emit_inventory_update(current_app.socketio,  # type: ignore
                                  updated_item, 'updated')

        return jsonify({
            'success': True,
            'message': 'Stock added successfully',
            'data': {
                'transaction': StockTransaction.to_dict(transaction),
                'updatedItem': InventoryItem.to_dict(updated_item)
            }
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error adding stock',
            'error': str(e)
        }), 400


@bp.route('/stock-out', methods=['POST'])
def stock_out():
    """Remove stock from inventory"""
    try:
        data = request.get_json()
        item_id = data.get('itemId')
        quantity = int(data.get('quantity', 0))
        reason = data.get('reason')

        # Validate item exists
        item = InventoryItem.find_by_id(item_id)
        if not item:
            return jsonify({
                'success': False,
                'message': 'Item not found'
            }), 404

        # Check if sufficient stock available
        previous_quantity = item.get('quantity', 0)
        if previous_quantity < quantity:
            return jsonify({
                'success': False,
                'message': f'Insufficient stock. Available: {previous_quantity}, Requested: {quantity}'
            }), 400

        new_quantity = previous_quantity - quantity

        # Update item quantity
        update_data = {
            'quantity': new_quantity,
            'stockValue': new_quantity * item.get('costPrice', 0)
        }

        updated_item = InventoryItem.update(item_id, update_data)

        # Create transaction record
        trans_data = {
            'itemId': ObjectId(item_id),
            'type': 'out',
            'quantity': quantity,
            'previousQuantity': previous_quantity,
            'newQuantity': new_quantity,
            'reason': reason,
            **{k: v for k, v in data.items() if k not in ['itemId', 'quantity', 'reason']}
        }

        transaction = StockTransaction.create(trans_data)

        # Emit WebSocket events
        if hasattr(current_app, 'socketio'):
            from sockets.inventory_socket import emit_stock_transaction, emit_inventory_update, emit_low_stock_alert
            emit_stock_transaction(current_app.socketio,  # type: ignore
                                   transaction, updated_item)
            emit_inventory_update(current_app.socketio,  # type: ignore
                                  updated_item, 'updated')

            # Check for low stock and emit alert
            if new_quantity <= item.get('reorderLevel', 0):
                emit_low_stock_alert(current_app.socketio,  # type: ignore
                                     updated_item)

        return jsonify({
            'success': True,
            'message': 'Stock removed successfully',
            'data': {
                'transaction': StockTransaction.to_dict(transaction),
                'updatedItem': InventoryItem.to_dict(updated_item)
            }
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error removing stock',
            'error': str(e)
        }), 400


@bp.route('/adjustment', methods=['POST'])
def stock_adjustment():
    """Adjust stock quantity"""
    try:
        data = request.get_json()
        item_id = data.get('itemId')
        new_quantity = int(data.get('newQuantity', 0))
        reason = data.get('reason', 'adjustment')

        # Validate item exists
        item = InventoryItem.find_by_id(item_id)
        if not item:
            return jsonify({
                'success': False,
                'message': 'Item not found'
            }), 404

        previous_quantity = item.get('quantity', 0)
        quantity_difference = abs(new_quantity - previous_quantity)

        # Update item quantity
        update_data = {
            'quantity': new_quantity,
            'stockValue': new_quantity * item.get('costPrice', 0)
        }

        updated_item = InventoryItem.update(item_id, update_data)

        # Create transaction record
        trans_data = {
            'itemId': ObjectId(item_id),
            'type': 'adjustment',
            'quantity': quantity_difference,
            'previousQuantity': previous_quantity,
            'newQuantity': new_quantity,
            'reason': reason,
            **{k: v for k, v in data.items() if k not in ['itemId', 'newQuantity', 'reason']}
        }

        transaction = StockTransaction.create(trans_data)

        return jsonify({
            'success': True,
            'message': 'Stock adjusted successfully',
            'data': {
                'transaction': StockTransaction.to_dict(transaction),
                'updatedItem': InventoryItem.to_dict(updated_item)
            }
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error adjusting stock',
            'error': str(e)
        }), 400


@bp.route('/stats/summary', methods=['GET'])
def get_transaction_stats():
    """Get transaction statistics"""
    try:
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')

        date_filter = {}
        if start_date or end_date:
            date_filter['transactionDate'] = {}
            if start_date:
                date_filter['transactionDate']['$gte'] = datetime.fromisoformat(
                    start_date.replace('Z', '+00:00'))
            if end_date:
                date_filter['transactionDate']['$lte'] = datetime.fromisoformat(
                    end_date.replace('Z', '+00:00'))

        # Get aggregated stats by type
        collection = StockTransaction.get_collection()

        pipeline = [
            {'$match': date_filter} if date_filter else {'$match': {}},
            {
                '$group': {
                    '_id': '$type',
                    'count': {'$sum': 1},
                    'totalQuantity': {'$sum': '$quantity'},
                    'totalAmount': {'$sum': '$totalAmount'}
                }
            }
        ]

        stats_aggregation = list(collection.aggregate(pipeline))

        # Transform stats
        stats_map = {stat['_id']: stat for stat in stats_aggregation}

        total_in = stats_map.get('in', {}).get('count', 0)
        total_out = stats_map.get('out', {}).get('count', 0)
        total_adjustments = stats_map.get('adjustment', {}).get('count', 0)

        total_value = sum(stat.get('totalAmount', 0)
                          for stat in stats_aggregation)

        # Get recent transactions
        recent_transactions, _ = StockTransaction.find_all(date_filter, 0, 10)

        # Populate item details
        item_collection = InventoryItem.get_collection()
        for trans in recent_transactions:
            if 'itemId' in trans:
                item = item_collection.find_one({'_id': trans['itemId']})
                if item:
                    trans['itemId'] = {
                        '_id': str(item['_id']),
                        'name': item.get('name'),
                        'sku': item.get('sku')
                    }

        recent_list = [StockTransaction.to_dict(
            t) for t in recent_transactions]

        return jsonify({
            'success': True,
            'data': {
                'totalIn': total_in,
                'totalOut': total_out,
                'totalAdjustments': total_adjustments,
                'totalValue': total_value,
                'byType': stats_aggregation,
                'recentTransactions': recent_list
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching transaction stats',
            'error': str(e)
        }), 500
