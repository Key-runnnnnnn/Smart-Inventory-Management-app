from flask import Blueprint, request, jsonify
from services.alert_service import AlertService

bp = Blueprint('alerts', __name__)


@bp.route('', methods=['GET'])
def get_all_alerts():
    """Get all alerts"""
    try:
        alerts = AlertService.get_all_alerts()
        return jsonify({
            'success': True,
            'data': alerts
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching alerts',
            'error': str(e)
        }), 500


@bp.route('/summary', methods=['GET'])
def get_alert_summary():
    """Get alert summary"""
    try:
        summary = AlertService.get_alert_summary()
        return jsonify({
            'success': True,
            'data': summary
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching alert summary',
            'error': str(e)
        }), 500


@bp.route('/low-stock', methods=['GET'])
def get_low_stock_alerts():
    """Get low stock alerts"""
    try:
        alerts = AlertService.get_low_stock_alerts()
        return jsonify({
            'success': True,
            'count': len(alerts),
            'data': alerts
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching low stock alerts',
            'error': str(e)
        }), 500


@bp.route('/near-expiry', methods=['GET'])
def get_near_expiry_alerts():
    """Get near expiry alerts"""
    try:
        days = int(request.args.get('days', 30))
        alerts = AlertService.get_near_expiry_alerts(days)
        return jsonify({
            'success': True,
            'count': len(alerts),
            'data': alerts
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching near expiry alerts',
            'error': str(e)
        }), 500


@bp.route('/expired', methods=['GET'])
def get_expired_items_alerts():
    """Get expired items alerts"""
    try:
        alerts = AlertService.get_expired_items_alerts()
        return jsonify({
            'success': True,
            'count': len(alerts),
            'data': alerts
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching expired items alerts',
            'error': str(e)
        }), 500


@bp.route('/overstock', methods=['GET'])
def get_overstock_alerts():
    """Get overstock alerts"""
    try:
        alerts = AlertService.get_overstock_alerts()
        return jsonify({
            'success': True,
            'count': len(alerts),
            'data': alerts
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching overstock alerts',
            'error': str(e)
        }), 500
