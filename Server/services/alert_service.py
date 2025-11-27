from datetime import datetime, timedelta
from models.inventory_item import InventoryItem


class AlertService:
    """Alert Service - Handles various inventory alerts"""

    @staticmethod
    def get_low_stock_alerts():
        """Get low stock alerts"""
        try:
            collection = InventoryItem.get_collection()
            items = list(collection.find({
                '$expr': {'$lte': ['$quantity', '$reorderLevel']},
                'status': 'active'
            }).sort('quantity', 1))

            alerts = []
            for item in items:
                severity = 'critical' if item['quantity'] == 0 else 'warning'
                stock_difference = item['reorderLevel'] - item['quantity']

                alerts.append({
                    'id': str(item['_id']),
                    'type': 'low-stock',
                    'severity': severity,
                    'item': {
                        'id': str(item['_id']),
                        'name': item['name'],
                        'sku': item['sku'],
                        'category': item['category'],
                        'currentQuantity': item['quantity'],
                        'reorderLevel': item['reorderLevel'],
                        'unit': item.get('unit', 'pcs'),
                        'imageUrl': item.get('imageUrl')
                    },
                    'message': f"{item['name']} is {'out of stock' if item['quantity'] == 0 else 'running low'}. Current: {item['quantity']} {item.get('unit', 'pcs')}, Reorder level: {item['reorderLevel']} {item.get('unit', 'pcs')}",
                    'stockDifference': stock_difference,
                    'createdAt': datetime.utcnow()
                })

            return alerts
        except Exception as e:
            raise Exception(f'Error fetching low stock alerts: {str(e)}')

    @staticmethod
    def get_near_expiry_alerts(days_threshold=30):
        """Get near expiry alerts"""
        try:
            today = datetime.utcnow()
            future_date = today + timedelta(days=days_threshold)

            collection = InventoryItem.get_collection()
            items = list(collection.find({
                'expiryDate': {
                    '$gte': today,
                    '$lte': future_date
                },
                'status': 'active',
                'quantity': {'$gt': 0}
            }).sort('expiryDate', 1))

            alerts = []
            for item in items:
                expiry_date = item['expiryDate']
                days_until_expiry = (expiry_date - today).days

                if days_until_expiry <= 7:
                    severity = 'critical'
                elif days_until_expiry <= 14:
                    severity = 'warning'
                else:
                    severity = 'info'

                alerts.append({
                    'id': str(item['_id']),
                    'type': 'near-expiry',
                    'severity': severity,
                    'item': {
                        'id': str(item['_id']),
                        'name': item['name'],
                        'sku': item['sku'],
                        'category': item['category'],
                        'currentQuantity': item['quantity'],
                        'unit': item.get('unit', 'pcs'),
                        'expiryDate': expiry_date,
                        'batchNumber': item.get('batchNumber'),
                        'imageUrl': item.get('imageUrl')
                    },
                    'message': f"{item['name']} (Batch: {item.get('batchNumber', 'N/A')}) will expire in {days_until_expiry} days. Stock: {item['quantity']} {item.get('unit', 'pcs')}",
                    'daysUntilExpiry': days_until_expiry,
                    'expiryDate': expiry_date,
                    'createdAt': datetime.utcnow()
                })

            return alerts
        except Exception as e:
            raise Exception(f'Error fetching near expiry alerts: {str(e)}')

    @staticmethod
    def get_expired_items_alerts():
        """Get expired items alerts"""
        try:
            today = datetime.utcnow()

            collection = InventoryItem.get_collection()
            items = list(collection.find({
                'expiryDate': {'$lt': today},
                'status': 'active',
                'quantity': {'$gt': 0}
            }).sort('expiryDate', 1))

            alerts = []
            for item in items:
                expiry_date = item['expiryDate']
                days_expired = (today - expiry_date).days

                alerts.append({
                    'id': str(item['_id']),
                    'type': 'expired',
                    'severity': 'critical',
                    'item': {
                        'id': str(item['_id']),
                        'name': item['name'],
                        'sku': item['sku'],
                        'category': item['category'],
                        'currentQuantity': item['quantity'],
                        'unit': item.get('unit', 'pcs'),
                        'expiryDate': expiry_date,
                        'batchNumber': item.get('batchNumber'),
                        'imageUrl': item.get('imageUrl')
                    },
                    'message': f"{item['name']} (Batch: {item.get('batchNumber', 'N/A')}) has expired {days_expired} days ago. Quantity: {item['quantity']} {item.get('unit', 'pcs')}",
                    'daysExpired': days_expired,
                    'expiryDate': expiry_date,
                    'createdAt': datetime.utcnow()
                })

            return alerts
        except Exception as e:
            raise Exception(f'Error fetching expired items alerts: {str(e)}')

    @staticmethod
    def get_overstock_alerts():
        """Get overstock alerts"""
        try:
            collection = InventoryItem.get_collection()
            items = list(collection.find({
                '$expr': {'$gte': ['$quantity', '$maxStockLevel']},
                'maxStockLevel': {'$exists': True, '$ne': None},
                'status': 'active'
            }).sort('quantity', -1))

            alerts = []
            for item in items:
                overstock = item['quantity'] - item['maxStockLevel']
                overstock_percentage = round(
                    (overstock / item['maxStockLevel']) * 100, 1)

                alerts.append({
                    'id': str(item['_id']),
                    'type': 'overstock',
                    'severity': 'info',
                    'item': {
                        'id': str(item['_id']),
                        'name': item['name'],
                        'sku': item['sku'],
                        'category': item['category'],
                        'currentQuantity': item['quantity'],
                        'maxStockLevel': item['maxStockLevel'],
                        'unit': item.get('unit', 'pcs'),
                        'stockValue': item.get('stockValue', 0),
                        'imageUrl': item.get('imageUrl')
                    },
                    'message': f"{item['name']} is overstocked by {overstock} {item.get('unit', 'pcs')} ({overstock_percentage}% over limit)",
                    'overstockQuantity': overstock,
                    'overstockPercentage': overstock_percentage,
                    'createdAt': datetime.utcnow()
                })

            return alerts
        except Exception as e:
            raise Exception(f'Error fetching overstock alerts: {str(e)}')

    @staticmethod
    def get_all_alerts():
        """Get all alerts"""
        try:
            low_stock = AlertService.get_low_stock_alerts()
            near_expiry = AlertService.get_near_expiry_alerts()
            expired = AlertService.get_expired_items_alerts()
            overstock = AlertService.get_overstock_alerts()

            all_alerts = low_stock + near_expiry + expired + overstock

            # Sort by severity
            severity_order = {'critical': 0, 'warning': 1, 'info': 2}
            all_alerts.sort(key=lambda x: severity_order[x['severity']])

            return {
                'total': len(all_alerts),
                'critical': len([a for a in all_alerts if a['severity'] == 'critical']),
                'warning': len([a for a in all_alerts if a['severity'] == 'warning']),
                'info': len([a for a in all_alerts if a['severity'] == 'info']),
                'alerts': all_alerts,
                'summary': {
                    'lowStock': len(low_stock),
                    'nearExpiry': len(near_expiry),
                    'expired': len(expired),
                    'overstock': len(overstock)
                }
            }
        except Exception as e:
            raise Exception(f'Error fetching all alerts: {str(e)}')

    @staticmethod
    def get_alert_summary():
        """Get alert summary (counts only)"""
        try:
            collection = InventoryItem.get_collection()

            low_stock_count = collection.count_documents({
                '$expr': {'$lte': ['$quantity', '$reorderLevel']},
                'status': 'active'
            })

            today = datetime.utcnow()
            future_date = today + timedelta(days=30)

            near_expiry_count = collection.count_documents({
                'expiryDate': {
                    '$gte': today,
                    '$lte': future_date
                },
                'status': 'active',
                'quantity': {'$gt': 0}
            })

            expired_count = collection.count_documents({
                'expiryDate': {'$lt': today},
                'status': 'active',
                'quantity': {'$gt': 0}
            })

            overstock_count = collection.count_documents({
                '$expr': {'$gte': ['$quantity', '$maxStockLevel']},
                'maxStockLevel': {'$exists': True, '$ne': None},
                'status': 'active'
            })

            total = low_stock_count + near_expiry_count + expired_count + overstock_count

            return {
                'total': total,
                'lowStock': low_stock_count,
                'nearExpiry': near_expiry_count,
                'expired': expired_count,
                'overstock': overstock_count
            }
        except Exception as e:
            raise Exception(f'Error fetching alert summary: {str(e)}')
