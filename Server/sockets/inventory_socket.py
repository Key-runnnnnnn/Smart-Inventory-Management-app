from flask import request
from flask_socketio import emit, join_room
from datetime import datetime
from services.alert_service import AlertService


def init_socket(socketio):
    """Initialize Socket.io for real-time inventory updates"""

    @socketio.on('connect')
    def handle_connect():
        print('✅ Client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('❌ Client disconnected')

    @socketio.on('join:inventory')
    def handle_join_inventory():
        join_room('inventory-updates')
        print('📦 Client joined inventory updates room')
        emit('joined', {'room': 'inventory-updates'})

    @socketio.on('join:alerts')
    def handle_join_alerts():
        join_room('alerts')
        print('🔔 Client joined alerts room')
        emit('joined', {'room': 'alerts'})

    @socketio.on('join:item')
    def handle_join_item(item_id):
        join_room(f'item:{item_id}')
        print(f'📊 Client joined item {item_id} updates')
        emit('joined', {'room': f'item:{item_id}'})

    @socketio.on('request:alerts')
    def handle_request_alerts():
        try:
            alerts = AlertService.get_all_alerts()
            emit('alerts:update', alerts)
        except Exception as e:
            emit('error', {'message': 'Failed to fetch alerts'})

    return socketio


def emit_inventory_update(socketio, item, action):
    """Emit inventory update event"""
    try:
        socketio.emit('inventory:update', {
            'action': action,  # 'created', 'updated', 'deleted'
            'item': {
                'id': str(item['_id']),
                'name': item.get('name'),
                'sku': item.get('sku'),
                'quantity': item.get('quantity'),
                'stockStatus': get_stock_status(item),
                'stockValue': item.get('stockValue')
            },
            'timestamp': datetime.utcnow().isoformat()
        }, room='inventory-updates')

        # Also emit to specific item room
        socketio.emit('item:update', {
            'action': action,
            'item': item,
            'timestamp': datetime.utcnow().isoformat()
        }, room=f"item:{item['_id']}")
    except Exception as e:
        print(f'Error emitting inventory update: {str(e)}')


def emit_stock_transaction(socketio, transaction, item):
    """Emit stock transaction event"""
    try:
        socketio.emit('transaction:new', {
            'transaction': {
                'id': str(transaction['_id']),
                'type': transaction.get('type'),
                'quantity': transaction.get('quantity'),
                'previousQuantity': transaction.get('previousQuantity'),
                'newQuantity': transaction.get('newQuantity'),
                'reason': transaction.get('reason')
            },
            'item': {
                'id': str(item['_id']),
                'name': item.get('name'),
                'sku': item.get('sku'),
                'currentQuantity': item.get('quantity')
            },
            'timestamp': datetime.utcnow().isoformat()
        }, room='inventory-updates')

        # Emit to specific item room
        socketio.emit('transaction:new', {
            'transaction': transaction,
            'item': item,
            'timestamp': datetime.utcnow().isoformat()
        }, room=f"item:{item['_id']}")
    except Exception as e:
        print(f'Error emitting stock transaction: {str(e)}')


def emit_alert(socketio, alert):
    """Emit alert event"""
    try:
        socketio.emit('alert:new', {
            'alert': alert,
            'timestamp': datetime.utcnow().isoformat()
        }, room='alerts')
    except Exception as e:
        print(f'Error emitting alert: {str(e)}')


def emit_low_stock_alert(socketio, item):
    """Emit low stock alert"""
    try:
        alert = {
            'type': 'low-stock',
            'severity': 'critical' if item['quantity'] == 0 else 'warning',
            'item': {
                'id': str(item['_id']),
                'name': item.get('name'),
                'sku': item.get('sku'),
                'quantity': item.get('quantity'),
                'reorderLevel': item.get('reorderLevel')
            },
            'message': f"{item.get('name')} is {'out of stock' if item['quantity'] == 0 else 'running low'}"
        }

        socketio.emit('alert:low-stock', alert, room='alerts')
        emit_alert(socketio, alert)
    except Exception as e:
        print(f'Error emitting low stock alert: {str(e)}')


def broadcast_alert_summary(socketio):
    """Broadcast alert summary update"""
    try:
        summary = AlertService.get_alert_summary()
        socketio.emit('alerts:summary', {
            'summary': summary,
            'timestamp': datetime.utcnow().isoformat()
        }, room='alerts')
    except Exception as e:
        print(f'Error broadcasting alert summary: {str(e)}')


def get_stock_status(item):
    """Get stock status for an item"""
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
