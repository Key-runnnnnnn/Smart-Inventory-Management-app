from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from datetime import datetime, timedelta

from models.inventory_item import InventoryItem
from models.stock_transaction import StockTransaction

bp = Blueprint('analytics', __name__)


@bp.route('/dashboard', methods=['GET'])
def get_dashboard_analytics():
    """Get dashboard analytics"""
    try:
        collection = InventoryItem.get_collection()
        trans_collection = StockTransaction.get_collection()

        # Total stock value
        pipeline = [
            {'$match': {'status': 'active'}},
            {
                '$group': {
                    '_id': None,
                    'totalValue': {'$sum': '$stockValue'},
                    'totalItems': {'$sum': 1},
                    'totalQuantity': {'$sum': '$quantity'}
                }
            }
        ]
        stock_value_data = list(collection.aggregate(pipeline))
        stock_value = stock_value_data[0] if stock_value_data else {
            'totalValue': 0,
            'totalItems': 0,
            'totalQuantity': 0
        }

        # Low stock count
        low_stock_count = collection.count_documents({
            '$expr': {'$lte': ['$quantity', '$reorderLevel']},
            'status': 'active'
        })

        # Out of stock count
        out_of_stock_count = collection.count_documents({
            'quantity': 0,
            'status': 'active'
        })

        # Overstock count
        overstock_count = collection.count_documents({
            '$expr': {'$gte': ['$quantity', '$maxStockLevel']},
            'maxStockLevel': {'$exists': True, '$ne': None},
            'status': 'active'
        })

        # Category-wise distribution
        category_pipeline = [
            {'$match': {'status': 'active'}},
            {
                '$group': {
                    '_id': '$category',
                    'count': {'$sum': 1},
                    'totalValue': {'$sum': '$stockValue'},
                    'totalQuantity': {'$sum': '$quantity'}
                }
            },
            {'$sort': {'totalValue': -1}},
            {
                '$project': {
                    '_id': 1,
                    'category': '$_id',
                    'count': 1,
                    'totalValue': 1,
                    'totalQuantity': 1
                }
            }
        ]
        category_distribution = list(collection.aggregate(category_pipeline))

        # Convert _id to id for category distribution
        for cat in category_distribution:
            cat['id'] = cat['_id']
            del cat['_id']

        # Recent transactions (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)

        recent_activity_pipeline = [
            {'$match': {'transactionDate': {'$gte': seven_days_ago}}},
            {
                '$group': {
                    '_id': '$type',
                    'count': {'$sum': 1},
                    'totalQuantity': {'$sum': '$quantity'}
                }
            }
        ]
        recent_activity = list(
            trans_collection.aggregate(recent_activity_pipeline))

        return jsonify({
            'success': True,
            'data': {
                'overview': {
                    'totalStockValue': stock_value['totalValue'],
                    'totalItems': stock_value['totalItems'],
                    'totalQuantity': stock_value['totalQuantity'],
                    'lowStockCount': low_stock_count,
                    'outOfStockCount': out_of_stock_count,
                    'overstockCount': overstock_count
                },
                'categoryDistribution': category_distribution,
                'recentActivity': recent_activity
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching dashboard analytics',
            'error': str(e)
        }), 500


@bp.route('/top-items', methods=['GET'])
def get_top_performing_items():
    """Get top performing items"""
    try:
        limit = int(request.args.get('limit', 5))
        metric = request.args.get('metric', 'sales')
        days = int(request.args.get('days', 30))

        date_filter = datetime.utcnow() - timedelta(days=days)
        trans_collection = StockTransaction.get_collection()

        # Top items by quantity sold
        quantity_pipeline = [
            {
                '$match': {
                    'type': 'out',
                    'reason': 'sale',
                    'transactionDate': {'$gte': date_filter}
                }
            },
            {
                '$group': {
                    '_id': '$itemId',
                    'totalQuantitySold': {'$sum': '$quantity'},
                    'totalRevenue': {'$sum': '$totalAmount'},
                    'transactionCount': {'$sum': 1}
                }
            },
            {'$sort': {'totalQuantitySold': -1}},
            {'$limit': limit},
            {
                '$lookup': {
                    'from': 'inventoryitems',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'itemDetails'
                }
            },
            {'$unwind': '$itemDetails'},
            {
                '$project': {
                    '_id': 1,
                    'itemId': '$_id',
                    'name': '$itemDetails.name',
                    'sku': '$itemDetails.sku',
                    'category': '$itemDetails.category',
                    'quantity': '$itemDetails.quantity',
                    'unit': '$itemDetails.unit',
                    'stockValue': '$itemDetails.stockValue',
                    'totalQuantitySold': 1,
                    'totalRevenue': 1,
                    'transactionCount': 1,
                    'imageUrl': '$itemDetails.imageUrl'
                }
            }
        ]
        top_by_quantity = list(trans_collection.aggregate(quantity_pipeline))

        # Top items by revenue
        revenue_pipeline = [
            {
                '$match': {
                    'type': 'out',
                    'reason': 'sale',
                    'transactionDate': {'$gte': date_filter}
                }
            },
            {
                '$group': {
                    '_id': '$itemId',
                    'totalQuantitySold': {'$sum': '$quantity'},
                    'totalRevenue': {'$sum': '$totalAmount'},
                    'transactionCount': {'$sum': 1}
                }
            },
            {'$sort': {'totalRevenue': -1}},
            {'$limit': limit},
            {
                '$lookup': {
                    'from': 'inventoryitems',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'itemDetails'
                }
            },
            {'$unwind': '$itemDetails'},
            {
                '$project': {
                    '_id': 1,
                    'itemId': '$_id',
                    'name': '$itemDetails.name',
                    'sku': '$itemDetails.sku',
                    'category': '$itemDetails.category',
                    'quantity': '$itemDetails.quantity',
                    'unit': '$itemDetails.unit',
                    'stockValue': '$itemDetails.stockValue',
                    'totalQuantitySold': 1,
                    'totalRevenue': 1,
                    'transactionCount': 1,
                    'imageUrl': '$itemDetails.imageUrl'
                }
            }
        ]
        top_by_revenue = list(trans_collection.aggregate(revenue_pipeline))

        # Convert ObjectIds to strings and _id to id
        for item in top_by_quantity:
            item['id'] = str(item['_id'])
            del item['_id']
            item['itemId'] = str(item['itemId'])

        for item in top_by_revenue:
            item['id'] = str(item['_id'])
            del item['_id']
            item['itemId'] = str(item['itemId'])

        return jsonify({
            'success': True,
            'data': {
                'items': top_by_quantity,
                'topByQuantity': top_by_quantity,
                'topByRevenue': top_by_revenue,
                'period': f'Last {days} days'
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching top performing items',
            'error': str(e)
        }), 500


@bp.route('/slow-moving', methods=['GET'])
def get_slow_moving_items():
    """Get slow moving items"""
    try:
        days = int(request.args.get('days', 60))
        limit = int(request.args.get('limit', 10))

        date_filter = datetime.utcnow() - timedelta(days=days)

        collection = InventoryItem.get_collection()
        trans_collection = StockTransaction.get_collection()

        # Get all active items
        all_items = list(collection.find({'status': 'active'}))

        # Get items with transactions in the specified period
        items_pipeline = [
            {
                '$match': {
                    'type': 'out',
                    'transactionDate': {'$gte': date_filter}
                }
            },
            {
                '$group': {
                    '_id': '$itemId',
                    'totalQuantitySold': {'$sum': '$quantity'},
                    'lastSaleDate': {'$max': '$transactionDate'},
                    'transactionCount': {'$sum': 1}
                }
            }
        ]
        items_with_transactions = list(
            trans_collection.aggregate(items_pipeline))

        # Create sales map
        sales_map = {
            str(item['_id']): item for item in items_with_transactions}

        # Identify slow-moving items
        slow_moving = []
        for item in all_items:
            item_id = str(item['_id'])
            sales_data = sales_map.get(item_id)

            days_since_last_sale = None
            if sales_data:
                last_sale = sales_data['lastSaleDate']
                days_since_last_sale = (datetime.utcnow() - last_sale).days

            days_since_added = (datetime.utcnow() - item['createdAt']).days

            total_sold = sales_data['totalQuantitySold'] if sales_data else 0
            transaction_count = sales_data['transactionCount'] if sales_data else 0

            # Item is slow-moving if:
            # 1. No sales at all, OR
            # 2. Very low sales (< 10 units AND < 3 transactions), OR
            # 3. Low turnover (< 10% of current stock)
            has_no_sales = total_sold == 0
            has_very_low_sales = total_sold > 0 and total_sold < 10 and transaction_count < 3
            has_low_turnover = item['quantity'] > 0 and total_sold < item['quantity'] * 0.1

            if has_no_sales or has_very_low_sales or has_low_turnover:
                slow_moving.append({
                    'id': item_id,
                    'itemId': item_id,
                    'name': item['name'],
                    'sku': item['sku'],
                    'category': item['category'],
                    'quantity': item['quantity'],
                    'unit': item.get('unit', 'pcs'),
                    'stockValue': item.get('stockValue', 0),
                    'totalQuantitySold': total_sold,
                    'transactionCount': transaction_count,
                    'lastSaleDate': sales_data['lastSaleDate'] if sales_data else None,
                    'daysSinceLastSale': days_since_last_sale,
                    'daysSinceLastTransaction': days_since_last_sale,
                    'daysSinceAdded': days_since_added,
                    'imageUrl': item.get('imageUrl')
                })

        # Sort: no sales first, then by lowest transaction count, then by highest stock value
        slow_moving.sort(key=lambda x: (
            0 if x['totalQuantitySold'] == 0 else 1,
            x['transactionCount'],
            -x['stockValue']
        ))

        slow_moving = slow_moving[:limit]

        return jsonify({
            'success': True,
            'count': len(slow_moving),
            'data': slow_moving,
            'period': f'Last {days} days'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching slow-moving items',
            'error': str(e)
        }), 500


@bp.route('/turnover', methods=['GET'])
def get_inventory_turnover():
    """Get inventory turnover metrics"""
    try:
        days = int(request.args.get('days', 30))
        date_filter = datetime.utcnow() - timedelta(days=days)

        collection = InventoryItem.get_collection()
        trans_collection = StockTransaction.get_collection()

        # Calculate average inventory value
        avg_pipeline = [
            {'$match': {'status': 'active'}},
            {
                '$group': {
                    '_id': None,
                    'avgValue': {'$avg': '$stockValue'},
                    'totalValue': {'$sum': '$stockValue'}
                }
            }
        ]
        avg_result = list(collection.aggregate(avg_pipeline))
        avg_inv_value = avg_result[0] if avg_result else {
            'avgValue': 0, 'totalValue': 0}

        # Calculate COGS
        cogs_pipeline = [
            {
                '$match': {
                    'type': 'out',
                    'reason': 'sale',
                    'transactionDate': {'$gte': date_filter}
                }
            },
            {
                '$lookup': {
                    'from': 'inventoryitems',
                    'localField': 'itemId',
                    'foreignField': '_id',
                    'as': 'item'
                }
            },
            {'$unwind': '$item'},
            {
                '$group': {
                    '_id': None,
                    'totalCOGS': {'$sum': {'$multiply': ['$quantity', '$item.costPrice']}},
                    'totalRevenue': {'$sum': '$totalAmount'},
                    'totalQuantitySold': {'$sum': '$quantity'}
                }
            }
        ]
        cogs_result = list(trans_collection.aggregate(cogs_pipeline))
        cogs = cogs_result[0] if cogs_result else {
            'totalCOGS': 0,
            'totalRevenue': 0,
            'totalQuantitySold': 0
        }

        # Calculate metrics
        turnover_ratio = cogs['totalCOGS'] / \
            avg_inv_value['avgValue'] if avg_inv_value['avgValue'] > 0 else 0
        days_of_inventory = (
            avg_inv_value['totalValue'] / cogs['totalCOGS'] * days) if cogs['totalCOGS'] > 0 else 0
        gross_profit = cogs['totalRevenue'] - cogs['totalCOGS']
        gross_profit_margin = (
            gross_profit / cogs['totalRevenue'] * 100) if cogs['totalRevenue'] > 0 else 0

        return jsonify({
            'success': True,
            'data': {
                'period': f'Last {days} days',
                'turnoverRatio': round(turnover_ratio, 2),
                'daysOfInventory': round(days_of_inventory),
                'averageInventoryValue': avg_inv_value['totalValue'],
                'totalCOGS': cogs['totalCOGS'],
                'totalRevenue': cogs['totalRevenue'],
                'grossProfit': gross_profit,
                'grossProfitMargin': f'{round(gross_profit_margin, 2)}%'
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error calculating inventory turnover',
            'error': str(e)
        }), 500


@bp.route('/sales-trends', methods=['GET'])
def get_sales_trends():
    """Get sales trends"""
    try:
        days = int(request.args.get('days', 30))
        group_by = request.args.get('groupBy', 'day')

        date_filter = datetime.utcnow() - timedelta(days=days)
        trans_collection = StockTransaction.get_collection()

        # Define date grouping
        if group_by == 'hour':
            date_format = {
                'year': {'$year': '$transactionDate'},
                'month': {'$month': '$transactionDate'},
                'day': {'$dayOfMonth': '$transactionDate'},
                'hour': {'$hour': '$transactionDate'}
            }
        elif group_by == 'week':
            date_format = {
                'year': {'$year': '$transactionDate'},
                'week': {'$week': '$transactionDate'}
            }
        elif group_by == 'month':
            date_format = {
                'year': {'$year': '$transactionDate'},
                'month': {'$month': '$transactionDate'}
            }
        else:  # day
            date_format = {
                'year': {'$year': '$transactionDate'},
                'month': {'$month': '$transactionDate'},
                'day': {'$dayOfMonth': '$transactionDate'}
            }

        pipeline = [
            {
                '$match': {
                    'type': 'out',
                    'reason': 'sale',
                    'transactionDate': {'$gte': date_filter}
                }
            },
            {
                '$group': {
                    '_id': date_format,
                    'totalSales': {'$sum': '$totalAmount'},
                    'totalQuantity': {'$sum': '$quantity'},
                    'transactionCount': {'$sum': 1},
                    'date': {'$first': '$transactionDate'}
                }
            },
            {'$sort': {'date': 1}}
        ]

        sales_trends = list(trans_collection.aggregate(pipeline))

        # Format labels
        for trend in sales_trends:
            if group_by == 'hour':
                label = f"{trend['_id']['month']}/{trend['_id']['day']} {trend['_id']['hour']}:00"
            elif group_by == 'week':
                label = f"Week {trend['_id']['week']}, {trend['_id']['year']}"
            elif group_by == 'month':
                label = f"{trend['_id']['month']}/{trend['_id']['year']}"
            else:
                label = f"{trend['_id']['month']}/{trend['_id']['day']}"

            trend['_id'] = label
            trend['quantity'] = trend.pop('totalQuantity')
            trend['sales'] = trend.pop('totalSales')

        return jsonify({
            'success': True,
            'data': {
                'trends': sales_trends,
                'period': f'Last {days} days',
                'groupedBy': group_by
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching sales trends',
            'error': str(e)
        }), 500


@bp.route('/value-trends', methods=['GET'])
def get_inventory_value_trends():
    """Get inventory value trends"""
    try:
        collection = InventoryItem.get_collection()

        # Current value by category
        category_pipeline = [
            {'$match': {'status': 'active'}},
            {
                '$group': {
                    '_id': '$category',
                    'totalValue': {'$sum': '$stockValue'},
                    'itemCount': {'$sum': 1},
                    'totalQuantity': {'$sum': '$quantity'}
                }
            },
            {'$sort': {'totalValue': -1}}
        ]
        current_value = list(collection.aggregate(category_pipeline))

        # Stock status distribution
        status_pipeline = [
            {'$match': {'status': 'active'}},
            {
                '$project': {
                    'stockStatus': {
                        '$cond': {
                            'if': {'$eq': ['$quantity', 0]},
                            'then': 'out-of-stock',
                            'else': {
                                '$cond': {
                                    'if': {'$lte': ['$quantity', '$reorderLevel']},
                                    'then': 'low-stock',
                                    'else': {
                                        '$cond': {
                                            'if': {'$gte': ['$quantity', '$maxStockLevel']},
                                            'then': 'overstock',
                                            'else': 'in-stock'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    'stockValue': 1
                }
            },
            {
                '$group': {
                    '_id': '$stockStatus',
                    'count': {'$sum': 1},
                    'totalValue': {'$sum': '$stockValue'}
                }
            }
        ]
        status_distribution = list(collection.aggregate(status_pipeline))

        # Format trends
        trends = [{
            '_id': cat['_id'],
            'category': cat['_id'],
            'totalValue': cat['totalValue'],
            'itemCount': cat['itemCount'],
            'totalQuantity': cat['totalQuantity']
        } for cat in current_value]

        return jsonify({
            'success': True,
            'data': {
                'trends': trends,
                'valueByCategory': current_value,
                'stockStatusDistribution': status_distribution
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching inventory value trends',
            'error': str(e)
        }), 500
