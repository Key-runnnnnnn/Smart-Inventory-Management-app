import csv
import io
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from bson.objectid import ObjectId

from models.inventory_item import InventoryItem
from models.stock_transaction import StockTransaction


class ReportService:
    """Report Service - Handles report generation"""

    @staticmethod
    def generate_inventory_csv(filter_dict=None):
        """Generate CSV report for inventory items"""
        try:
            filter_dict = filter_dict or {}
            filter_dict['status'] = 'active'

            collection = InventoryItem.get_collection()
            items = list(collection.find(filter_dict))

            # Create CSV in memory
            output = io.StringIO()
            writer = csv.writer(output)

            # Write header
            writer.writerow([
                'SKU', 'Name', 'Category', 'Sub Category', 'Quantity', 'Unit',
                'Reorder Level', 'Cost Price', 'Selling Price', 'Stock Value',
                'Supplier Name', 'Warehouse Location', 'Rack Number', 'Status'
            ])

            # Write data
            for item in items:
                writer.writerow([
                    item.get('sku', ''),
                    item.get('name', ''),
                    item.get('category', ''),
                    item.get('subCategory', ''),
                    item.get('quantity', 0),
                    item.get('unit', 'pcs'),
                    item.get('reorderLevel', 0),
                    item.get('costPrice', 0),
                    item.get('sellingPrice', 0),
                    item.get('stockValue', 0),
                    item.get('supplier', {}).get('name', ''),
                    item.get('warehouseLocation', ''),
                    item.get('rackNumber', ''),
                    item.get('status', '')
                ])

            return output.getvalue()
        except Exception as e:
            raise Exception(f'Error generating inventory CSV: {str(e)}')

    @staticmethod
    def generate_transactions_csv(filter_dict=None):
        """Generate CSV report for transactions"""
        try:
            filter_dict = filter_dict or {}

            trans_collection = StockTransaction.get_collection()
            item_collection = InventoryItem.get_collection()

            transactions = list(trans_collection.find(filter_dict))

            # Create CSV in memory
            output = io.StringIO()
            writer = csv.writer(output)

            # Write header
            writer.writerow([
                'Date', 'Item Name', 'SKU', 'Type', 'Quantity', 'Previous Quantity',
                'New Quantity', 'Reason', 'Unit Price', 'Total Amount', 'Party Name',
                'Performed By', 'Invoice Number'
            ])

            # Write data
            for trans in transactions:
                item = item_collection.find_one({'_id': trans.get('itemId')})

                writer.writerow([
                    trans.get('transactionDate', '').isoformat(
                    ) if trans.get('transactionDate') else '',
                    item.get('name', 'N/A') if item else 'N/A',
                    item.get('sku', 'N/A') if item else 'N/A',
                    trans.get('type', ''),
                    trans.get('quantity', 0),
                    trans.get('previousQuantity', 0),
                    trans.get('newQuantity', 0),
                    trans.get('reason', ''),
                    trans.get('unitPrice', 0),
                    trans.get('totalAmount', 0),
                    trans.get('party', {}).get('name', ''),
                    trans.get('performedBy', ''),
                    trans.get('invoiceNumber', '')
                ])

            return output.getvalue()
        except Exception as e:
            raise Exception(f'Error generating transactions CSV: {str(e)}')

    @staticmethod
    def generate_inventory_pdf(filter_dict=None):
        """Generate PDF report for inventory"""
        try:
            filter_dict = filter_dict or {}
            filter_dict['status'] = 'active'

            collection = InventoryItem.get_collection()
            items = list(collection.find(filter_dict))

            # Create PDF in memory
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []

            # Styles
            styles = getSampleStyleSheet()
            title_style = styles['Heading1']
            normal_style = styles['Normal']

            # Title
            title = Paragraph('Inventory Report', title_style)
            elements.append(title)
            elements.append(Spacer(1, 0.2 * inch))

            # Date
            date_text = Paragraph(
                f'Generated on: {datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")}', normal_style)
            elements.append(date_text)
            elements.append(Spacer(1, 0.3 * inch))

            # Summary
            total_value = sum(item.get('stockValue', 0) for item in items)
            total_items = len(items)

            summary = Paragraph(
                f'<b>Summary</b><br/>Total Items: {total_items}<br/>Total Stock Value: ₹{total_value:,.2f}', normal_style)
            elements.append(summary)
            elements.append(Spacer(1, 0.3 * inch))

            # Table
            data = [['SKU', 'Name', 'Category', 'Qty', 'Unit', 'Value']]

            for item in items[:50]:  # Limit to 50 items for PDF
                data.append([
                    item.get('sku', '')[:15],
                    item.get('name', '')[:25],
                    item.get('category', '')[:15],
                    str(item.get('quantity', 0)),
                    item.get('unit', 'pcs'),
                    f"₹{item.get('stockValue', 0):,.0f}"
                ])

            table = Table(data, colWidths=[
                          1*inch, 2*inch, 1.2*inch, 0.7*inch, 0.7*inch, 1*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
            ]))

            elements.append(table)

            # Build PDF
            doc.build(elements)

            return buffer.getvalue()
        except Exception as e:
            raise Exception(f'Error generating inventory PDF: {str(e)}')

    @staticmethod
    def generate_monthly_report(year, month):
        """Generate monthly performance report"""
        try:
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1) - timedelta(seconds=1)
            else:
                end_date = datetime(year, month + 1, 1) - timedelta(seconds=1)

            trans_collection = StockTransaction.get_collection()
            item_collection = InventoryItem.get_collection()

            # Get transactions for the month
            transactions = list(trans_collection.find({
                'transactionDate': {'$gte': start_date, '$lte': end_date}
            }))

            # Sales data
            sales = [t for t in transactions if t['type']
                     == 'out' and t['reason'] == 'sale']
            total_sales = sum(t.get('totalAmount', 0) for t in sales)
            total_items_sold = sum(t['quantity'] for t in sales)

            # Purchases data
            purchases = [t for t in transactions if t['type']
                         == 'in' and t['reason'] == 'purchase']
            total_purchases = sum(t.get('totalAmount', 0) for t in purchases)
            total_items_purchased = sum(t['quantity'] for t in purchases)

            # Top selling items
            item_sales_map = {}
            for sale in sales:
                item_id = str(sale['itemId'])
                if item_id not in item_sales_map:
                    item = item_collection.find_one({'_id': sale['itemId']})
                    if item:
                        item_sales_map[item_id] = {
                            'name': item['name'],
                            'sku': item['sku'],
                            'quantity': 0,
                            'revenue': 0
                        }

                if item_id in item_sales_map:
                    item_sales_map[item_id]['quantity'] += sale['quantity']
                    item_sales_map[item_id]['revenue'] += sale.get(
                        'totalAmount', 0)

            top_items = sorted(item_sales_map.values(),
                               key=lambda x: x['revenue'], reverse=True)[:5]

            # Current inventory value
            pipeline = [
                {'$match': {'status': 'active'}},
                {'$group': {'_id': None, 'total': {'$sum': '$stockValue'}}}
            ]
            current_inventory_result = list(
                item_collection.aggregate(pipeline))
            current_inventory_value = current_inventory_result[
                0]['total'] if current_inventory_result else 0

            # Month name
            month_names = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December']
            month_name = month_names[month - 1]

            gross_profit = total_sales - total_purchases
            margin = f'{round((gross_profit / total_sales * 100), 2)}%' if total_sales > 0 else '0%'

            return {
                'period': {
                    'year': year,
                    'month': month,
                    'startDate': start_date,
                    'endDate': end_date,
                    'monthName': month_name
                },
                'sales': {
                    'totalRevenue': total_sales,
                    'totalItemsSold': total_items_sold,
                    'transactionCount': len(sales)
                },
                'purchases': {
                    'totalCost': total_purchases,
                    'totalItemsPurchased': total_items_purchased,
                    'transactionCount': len(purchases)
                },
                'profitability': {
                    'grossProfit': gross_profit,
                    'margin': margin
                },
                'topSellingItems': top_items,
                'currentInventoryValue': current_inventory_value,
                'totalTransactions': len(transactions)
            }
        except Exception as e:
            raise Exception(f'Error generating monthly report: {str(e)}')
