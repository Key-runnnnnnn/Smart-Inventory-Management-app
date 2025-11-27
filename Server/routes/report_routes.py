from flask import Blueprint, request, jsonify, make_response
from datetime import datetime
from services.report_service import ReportService

bp = Blueprint('reports', __name__)


@bp.route('/export/inventory/csv', methods=['GET'])
def export_inventory_csv():
    """Export inventory as CSV"""
    try:
        category = request.args.get('category')
        status = request.args.get('status')

        filter_dict = {}
        if category:
            filter_dict['category'] = category
        if status:
            filter_dict['status'] = status

        csv_data = ReportService.generate_inventory_csv(filter_dict)

        response = make_response(csv_data)
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = 'attachment; filename=inventory-report.csv'

        return response
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error exporting inventory CSV',
            'error': str(e)
        }), 500


@bp.route('/export/inventory/pdf', methods=['GET'])
def export_inventory_pdf():
    """Export inventory as PDF"""
    try:
        category = request.args.get('category')
        status = request.args.get('status')

        filter_dict = {}
        if category:
            filter_dict['category'] = category
        if status:
            filter_dict['status'] = status

        pdf_data = ReportService.generate_inventory_pdf(filter_dict)

        response = make_response(pdf_data)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = 'attachment; filename=inventory-report.pdf'

        return response
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error exporting inventory PDF',
            'error': str(e)
        }), 500


@bp.route('/export/transactions/csv', methods=['GET'])
def export_transactions_csv():
    """Export transactions as CSV"""
    try:
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        trans_type = request.args.get('type')
        reason = request.args.get('reason')

        filter_dict = {}

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

        csv_data = ReportService.generate_transactions_csv(filter_dict)

        response = make_response(csv_data)
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = 'attachment; filename=transactions-report.csv'

        return response
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error exporting transactions CSV',
            'error': str(e)
        }), 500


@bp.route('/monthly', methods=['GET'])
def get_monthly_report():
    """Get monthly performance report"""
    try:
        year = request.args.get('year')
        month = request.args.get('month')

        if not year or not month:
            return jsonify({
                'success': False,
                'message': 'Year and month are required'
            }), 400

        report = ReportService.generate_monthly_report(int(year), int(month))

        return jsonify({
            'success': True,
            'data': report
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating monthly report',
            'error': str(e)
        }), 500
