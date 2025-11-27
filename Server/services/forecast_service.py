import os
import json
from datetime import datetime, timedelta
from bson.objectid import ObjectId
import google.generativeai as genai

from models.inventory_item import InventoryItem
from models.stock_transaction import StockTransaction

# Initialize Gemini AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))


class ForecastService:
    """Forecast Service - Handles demand forecasting with Gemini AI"""

    @staticmethod
    def get_historical_sales_data(item_id, days=90):
        """Get historical sales data for an item"""
        try:
            date_filter = datetime.utcnow() - timedelta(days=days)

            trans_collection = StockTransaction.get_collection()
            transactions = list(trans_collection.find({
                'itemId': ObjectId(item_id),
                'type': 'out',
                'reason': 'sale',
                'transactionDate': {'$gte': date_filter}
            }).sort('transactionDate', 1))

            # Group by day
            sales_by_day = {}
            for trans in transactions:
                date = trans['transactionDate'].strftime('%Y-%m-%d')
                if date not in sales_by_day:
                    sales_by_day[date] = 0
                sales_by_day[date] += trans['quantity']

            return [{'date': date, 'quantity': qty} for date, qty in sales_by_day.items()]
        except Exception as e:
            raise Exception(f'Error fetching historical data: {str(e)}')

    @staticmethod
    def calculate_simple_moving_average(data, period=7):
        """Calculate simple moving average"""
        if len(data) < period:
            return sum(item['quantity'] for item in data) / len(data) if data else 0

        recent_data = data[-period:]
        return sum(item['quantity'] for item in recent_data) / period

    @staticmethod
    def forecast_demand_with_gemini(item_id, forecast_days=30):
        """Forecast demand using Gemini AI"""
        try:
            # Check if API key is configured
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key or api_key == 'your_gemini_api_key_here':
                raise Exception(
                    'Gemini API key not configured. Please set GEMINI_API_KEY in .env file')

            # Get item details
            item = InventoryItem.find_by_id(item_id)
            if not item:
                raise Exception('Item not found')

            # Get historical data
            historical_data = ForecastService.get_historical_sales_data(
                item_id, 90)

            if not historical_data:
                return {
                    'itemId': str(item['_id']),
                    'itemName': item['name'],
                    'sku': item['sku'],
                    'forecastMethod': 'no-data',
                    'message': 'No historical sales data available for forecasting',
                    'predictedDemand': 0,
                    'recommendedReorder': 0,
                    'confidence': 'low'
                }

            # Calculate statistics
            total_sales = sum(d['quantity'] for d in historical_data)
            avg_daily_sales = total_sales / len(historical_data)
            sma7 = ForecastService.calculate_simple_moving_average(
                historical_data, 7)
            sma30 = ForecastService.calculate_simple_moving_average(
                historical_data, 30)

            # Prepare data for Gemini
            recent_sales = historical_data[-30:]  # Last 30 days

            prompt = f"""You are an inventory forecasting expert. Analyze the following sales data and provide a demand forecast.

Item Details:
- Name: {item['name']}
- SKU: {item['sku']}
- Category: {item['category']}
- Current Stock: {item['quantity']} {item.get('unit', 'pcs')}
- Reorder Level: {item['reorderLevel']} {item.get('unit', 'pcs')}

Historical Sales Data (Last {len(historical_data)} days):
{json.dumps(recent_sales, indent=2)}

Statistics:
- Total Sales ({len(historical_data)} days): {total_sales} {item.get('unit', 'pcs')}
- Average Daily Sales: {avg_daily_sales:.2f} {item.get('unit', 'pcs')}
- 7-Day Moving Average: {sma7:.2f} {item.get('unit', 'pcs')}
- 30-Day Moving Average: {sma30:.2f} {item.get('unit', 'pcs')}

Based on this data, provide a forecast for the next {forecast_days} days. Return ONLY a valid JSON object with the following structure (no markdown, no code blocks):
{{
  "predictedDemand": <number - predicted total demand for next {forecast_days} days>,
  "dailyAverageForecast": <number - predicted average daily demand>,
  "confidence": "<low|medium|high>",
  "trend": "<increasing|stable|decreasing>",
  "seasonalityDetected": <boolean>,
  "recommendedReorderQuantity": <number - suggested reorder quantity>,
  "recommendedReorderPoint": <number - when to reorder (stock level)>,
  "insights": "<brief explanation of the forecast>",
  "risks": "<potential risks or considerations>"
}}"""

            # Call Gemini API
            model = genai.GenerativeModel('gemini-2.0-flash')
            result = model.generate_content(prompt)
            text = result.text

            # Parse JSON response
            try:
                # Remove markdown code blocks if present
                cleaned_text = text.replace(
                    '```json', '').replace('```', '').strip()
                forecast = json.loads(cleaned_text)
            except json.JSONDecodeError:
                # Fallback to simple forecast
                forecast = {
                    'predictedDemand': round(avg_daily_sales * forecast_days),
                    'dailyAverageForecast': avg_daily_sales,
                    'confidence': 'medium',
                    'trend': 'stable',
                    'seasonalityDetected': False,
                    'recommendedReorderQuantity': max(item['reorderLevel'], round(avg_daily_sales * 14)),
                    'recommendedReorderPoint': item['reorderLevel'],
                    'insights': 'Forecast based on historical average due to AI response parsing issue.',
                    'risks': 'Limited historical data may affect accuracy.'
                }

            return {
                'itemId': str(item['_id']),
                'itemName': item['name'],
                'sku': item['sku'],
                'category': item['category'],
                'currentStock': item['quantity'],
                'reorderLevel': item['reorderLevel'],
                'unit': item.get('unit', 'pcs'),
                'forecastPeriod': f'{forecast_days} days',
                'forecastMethod': 'gemini-ai',
                'historicalDataPoints': len(historical_data),
                'statistics': {
                    'totalSales': total_sales,
                    'avgDailySales': f'{avg_daily_sales:.2f}',
                    'sma7': f'{sma7:.2f}',
                    'sma30': f'{sma30:.2f}'
                },
                'forecast': forecast,
                'generatedAt': datetime.utcnow().isoformat()
            }
        except Exception as e:
            # If Gemini API fails, return basic forecast
            error_str = str(e)
            if 'API_KEY_INVALID' in error_str or 'API Key not found' in error_str or 'Gemini API key not configured' in error_str:
                return ForecastService._get_basic_item_forecast(item_id, forecast_days)
            raise Exception(f'Error forecasting with Gemini: {error_str}')

    @staticmethod
    def get_restock_suggestions(natural_language_query):
        """Get AI-powered restock suggestions"""
        try:
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key or api_key == 'your_gemini_api_key_here':
                return ForecastService._get_basic_restock_suggestions(natural_language_query)

            # Get current inventory status
            collection = InventoryItem.get_collection()
            low_stock_items = list(collection.find({
                '$expr': {'$lte': ['$quantity', '$reorderLevel']},
                'status': 'active'
            }).limit(20))

            all_items = list(collection.find({'status': 'active'}).limit(50))

            # Get recent sales trends
            trans_collection = StockTransaction.get_collection()
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)

            pipeline = [
                {
                    '$match': {
                        'type': 'out',
                        'reason': 'sale',
                        'transactionDate': {'$gte': thirty_days_ago}
                    }
                },
                {
                    '$group': {
                        '_id': '$itemId',
                        'totalSold': {'$sum': '$quantity'},
                        'avgDailyRate': {'$avg': '$quantity'}
                    }
                },
                {
                    '$lookup': {
                        'from': 'inventoryitems',
                        'localField': '_id',
                        'foreignField': '_id',
                        'as': 'item'
                    }
                },
                {'$unwind': '$item'},
                {'$sort': {'totalSold': -1}},
                {'$limit': 10}
            ]
            recent_sales = list(trans_collection.aggregate(pipeline))

            # Build prompt
            low_stock_text = '\n'.join([
                f"- {item['name']} ({item['sku']}): {item['quantity']}/{item['reorderLevel']} {item.get('unit', 'pcs')}, Value: ₹{item.get('stockValue', 0)}"
                for item in low_stock_items
            ])

            sales_text = '\n'.join([
                f"- {s['item']['name']} ({s['item']['sku']}): Sold {s['totalSold']} {s['item'].get('unit', 'pcs')}, Current Stock: {s['item']['quantity']}"
                for s in recent_sales
            ])

            prompt = f"""You are an inventory management AI assistant. A user has asked: "{natural_language_query}"

Current Inventory Status:
Low Stock Items ({len(low_stock_items)}):
{low_stock_text}

Top Selling Items (Last 30 days):
{sales_text}

Total Active Items: {len(all_items)}

Provide a helpful, actionable response to the user's query.

**FORMAT YOUR RESPONSE AS FOLLOWS:**

1. Use numbered lists (1. 2. 3.) for sequential items or recommendations
2. Use bullet points (-) for non-sequential information
3. Use **bold text** for important terms, item names, or key metrics
4. Use clear section headers followed by colon (:) for organizing different topics
5. Keep paragraphs short and concise (2-3 sentences max)

Include in your response:
- Direct answer to their question
- Specific item recommendations with quantities
- Priority levels (🔴 High / 🟡 Medium / 🟢 Low)
- Estimated costs if relevant
- Any risks or considerations

Make the response clear, actionable, and well-structured."""

            model = genai.GenerativeModel('gemini-2.0-flash')
            result = model.generate_content(prompt)
            suggestion = result.text

            return {
                'query': natural_language_query,
                'response': suggestion,
                'context': {
                    'lowStockCount': len(low_stock_items),
                    'topSellingItemsAnalyzed': len(recent_sales),
                    'totalActiveItems': len(all_items)
                },
                'generatedAt': datetime.utcnow().isoformat()
            }
        except Exception as e:
            # If Gemini API fails, fallback to basic suggestions
            if 'API_KEY_INVALID' in str(e) or 'API Key not found' in str(e):
                return ForecastService._get_basic_restock_suggestions(natural_language_query)
            raise Exception(f'Error generating restock suggestions: {str(e)}')

    @staticmethod
    def batch_forecast(category=None, limit=10):
        """Batch forecast for multiple items"""
        try:
            filter_dict = {'status': 'active'}
            if category:
                filter_dict['category'] = category

            trans_collection = StockTransaction.get_collection()
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)

            # Get items with recent sales
            pipeline = [
                {
                    '$match': {
                        'type': 'out',
                        'reason': 'sale',
                        'transactionDate': {'$gte': thirty_days_ago}
                    }
                },
                {
                    '$group': {
                        '_id': '$itemId',
                        'totalSold': {'$sum': '$quantity'}
                    }
                },
                {'$sort': {'totalSold': -1}},
                {'$limit': limit}
            ]
            recent_sales = list(trans_collection.aggregate(pipeline))

            item_ids = [s['_id'] for s in recent_sales]
            collection = InventoryItem.get_collection()
            items = list(collection.find({'_id': {'$in': item_ids}}))

            # Simple forecasts for batch
            forecasts = []
            for item in items:
                historical_data = ForecastService.get_historical_sales_data(
                    str(item['_id']), 30)
                total_sales = sum(d['quantity'] for d in historical_data)
                avg_daily_sales = total_sales / \
                    len(historical_data) if historical_data else 0
                predicted_demand = round(avg_daily_sales * 30)
                recommended_reorder = max(
                    item['reorderLevel'], round(avg_daily_sales * 14))

                forecasts.append({
                    'itemId': str(item['_id']),
                    'itemName': item['name'],
                    'sku': item['sku'],
                    'category': item['category'],
                    'currentStock': item['quantity'],
                    'reorderLevel': item['reorderLevel'],
                    'predictedDemand30Days': predicted_demand,
                    'recommendedReorderQuantity': recommended_reorder,
                    'avgDailySales': f'{avg_daily_sales:.2f}',
                    'needsRestock': item['quantity'] <= item['reorderLevel']
                })

            return {
                'totalItems': len(forecasts),
                'category': category or 'all',
                'forecasts': forecasts,
                'generatedAt': datetime.utcnow().isoformat()
            }
        except Exception as e:
            raise Exception(f'Error in batch forecast: {str(e)}')

    @staticmethod
    def _get_basic_restock_suggestions(natural_language_query):
        """Fallback method when Gemini API is not available"""
        try:
            collection = InventoryItem.get_collection()

            # Get low stock items
            low_stock_items = list(collection.find({
                '$expr': {'$lte': ['$quantity', '$reorderLevel']},
                'status': 'active'
            }).sort('quantity', 1).limit(10))

            # Get out of stock items
            out_of_stock = list(collection.find({
                'quantity': 0,
                'status': 'active'
            }).limit(5))

            # Build response
            response = f"## Restock Recommendations\n\n"
            response += f"_Note: AI-powered suggestions are currently unavailable. Using basic inventory analysis._\n\n"

            if out_of_stock:
                response += f"### 🔴 Critical - Out of Stock ({len(out_of_stock)} items)\n\n"
                for item in out_of_stock:
                    reorder_qty = item.get('reorderLevel', 10) * 2
                    response += f"- **{item['name']}** ({item['sku']})\n"
                    response += f"  - Current: 0 {item.get('unit', 'pcs')}\n"
                    response += f"  - Recommended reorder: {reorder_qty} {item.get('unit', 'pcs')}\n\n"

            if low_stock_items:
                response += f"\n### 🟡 Low Stock Alert ({len(low_stock_items)} items)\n\n"
                for item in low_stock_items[:5]:
                    reorder_qty = item.get('reorderLevel', 10) * 2
                    response += f"- **{item['name']}** ({item['sku']})\n"
                    response += f"  - Current: {item['quantity']} {item.get('unit', 'pcs')}\n"
                    response += f"  - Reorder Level: {item['reorderLevel']} {item.get('unit', 'pcs')}\n"
                    response += f"  - Recommended reorder: {reorder_qty} {item.get('unit', 'pcs')}\n\n"

            if not out_of_stock and not low_stock_items:
                response += "### 🟢 Good News!\n\n"
                response += "All items are currently above their reorder levels. No immediate restocking needed.\n\n"

            response += "\n### 💡 Tip\n\n"
            response += "To get AI-powered insights and predictions, please configure a valid Gemini API key in your `.env` file.\n"
            response += "Get your free API key at: https://makersuite.google.com/app/apikey"

            return {
                'query': natural_language_query,
                'response': response,
                'context': {
                    'lowStockCount': len(low_stock_items),
                    'outOfStockCount': len(out_of_stock),
                    'usingFallback': True
                },
                'generatedAt': datetime.utcnow().isoformat()
            }
        except Exception as e:
            raise Exception(f'Error generating basic suggestions: {str(e)}')

    @staticmethod
    def _get_basic_item_forecast(item_id, forecast_days=30):
        """Fallback forecast method when Gemini API is not available"""
        try:
            # Get item details
            item = InventoryItem.find_by_id(item_id)
            if not item:
                raise Exception('Item not found')

            # Get historical data
            historical_data = ForecastService.get_historical_sales_data(
                item_id, 90)

            if not historical_data:
                return {
                    'itemId': str(item['_id']),
                    'itemName': item['name'],
                    'sku': item['sku'],
                    'category': item['category'],
                    'currentStock': item['quantity'],
                    'reorderLevel': item['reorderLevel'],
                    'unit': item.get('unit', 'pcs'),
                    'forecastMethod': 'no-data',
                    'message': 'No historical sales data available for forecasting',
                    'predictedDemand': 0,
                    'recommendedReorder': 0,
                    'confidence': 'low',
                    'generatedAt': datetime.utcnow().isoformat(),
                    'aiNote': 'AI-powered forecasting is currently unavailable. Please configure a valid Gemini API key.'
                }

            # Calculate basic statistics
            total_sales = sum(d['quantity'] for d in historical_data)
            avg_daily_sales = total_sales / len(historical_data)
            sma7 = ForecastService.calculate_simple_moving_average(
                historical_data, 7)
            sma30 = ForecastService.calculate_simple_moving_average(
                historical_data, 30)

            # Simple forecast based on moving averages
            predicted_demand = round(avg_daily_sales * forecast_days)
            recommended_reorder = max(
                item['reorderLevel'], round(avg_daily_sales * 14))

            # Determine trend
            trend = 'stable'
            if sma7 > sma30 * 1.1:
                trend = 'increasing'
            elif sma7 < sma30 * 0.9:
                trend = 'decreasing'

            # Determine confidence based on data consistency
            confidence = 'medium'
            if len(historical_data) < 30:
                confidence = 'low'
            elif len(historical_data) >= 60:
                confidence = 'high'

            forecast = {
                'predictedDemand': predicted_demand,
                'dailyAverageForecast': round(avg_daily_sales, 2),
                'confidence': confidence,
                'trend': trend,
                'seasonalityDetected': False,
                'recommendedReorderQuantity': recommended_reorder,
                'recommendedReorderPoint': item['reorderLevel'],
                'insights': f'Based on {len(historical_data)} days of sales data, average daily demand is {avg_daily_sales:.1f} {item.get("unit", "pcs")}. Forecast uses simple moving average method.',
                'risks': 'This is a basic forecast without AI analysis. For more accurate predictions, configure a valid Gemini API key.'
            }

            return {
                'itemId': str(item['_id']),
                'itemName': item['name'],
                'sku': item['sku'],
                'category': item['category'],
                'currentStock': item['quantity'],
                'reorderLevel': item['reorderLevel'],
                'unit': item.get('unit', 'pcs'),
                'forecastPeriod': f'{forecast_days} days',
                'forecastMethod': 'simple-moving-average',
                'historicalDataPoints': len(historical_data),
                'statistics': {
                    'totalSales': total_sales,
                    'avgDailySales': f'{avg_daily_sales:.2f}',
                    'sma7': f'{sma7:.2f}',
                    'sma30': f'{sma30:.2f}'
                },
                'forecast': forecast,
                'generatedAt': datetime.utcnow().isoformat(),
                'aiNote': 'Using basic statistical forecast. For AI-powered insights, configure a valid Gemini API key at https://makersuite.google.com/app/apikey'
            }
        except Exception as e:
            raise Exception(f'Error generating basic forecast: {str(e)}')
