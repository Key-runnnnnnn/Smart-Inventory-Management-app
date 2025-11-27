from flask import Blueprint, request, jsonify
from services.forecast_service import ForecastService

bp = Blueprint('forecast', __name__)


@bp.route('/item/<item_id>', methods=['GET'])
def forecast_item_demand(item_id):
    """Forecast demand for a specific item using Gemini AI"""
    try:
        days = int(request.args.get('days', 30))
        forecast = ForecastService.forecast_demand_with_gemini(item_id, days)

        return jsonify({
            'success': True,
            'data': forecast
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error forecasting item demand',
            'error': str(e)
        }), 500


@bp.route('/restock-suggestions', methods=['POST'])
def get_ai_restock_suggestions():
    """Get AI-powered restock suggestions using natural language"""
    try:
        data = request.get_json()
        query = data.get('query')

        if not query:
            return jsonify({
                'success': False,
                'message': 'Query is required'
            }), 400

        suggestions = ForecastService.get_restock_suggestions(query)

        return jsonify({
            'success': True,
            'data': suggestions
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating restock suggestions',
            'error': str(e)
        }), 500


@bp.route('/batch', methods=['GET'])
def get_batch_forecast():
    """Batch forecast for multiple items"""
    try:
        category = request.args.get('category')
        limit = int(request.args.get('limit', 10))

        forecasts = ForecastService.batch_forecast(category, limit)

        return jsonify({
            'success': True,
            'data': forecasts
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating batch forecast',
            'error': str(e)
        }), 500


@bp.route('/history/<item_id>', methods=['GET'])
def get_historical_data(item_id):
    """Get historical sales data for an item"""
    try:
        days = int(request.args.get('days', 90))
        data = ForecastService.get_historical_sales_data(item_id, days)

        return jsonify({
            'success': True,
            'count': len(data),
            'data': data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching historical data',
            'error': str(e)
        }), 500
