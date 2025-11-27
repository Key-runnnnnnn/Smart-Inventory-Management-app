from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
import os

from config.database import db, init_db
from sockets.inventory_socket import init_socket
from routes import (
    inventory_routes,
    transaction_routes,
    analytics_routes,
    alert_routes,
    report_routes,
    forecast_routes
)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['MONGODB_URI'] = os.getenv(
    'MONGODB_URI', 'mongodb://localhost:27017/inventory_management')

# Initialize CORS
CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv('CLIENT_URL', 'http://localhost:3000'),
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins=os.getenv(
    'CLIENT_URL', 'http://localhost:3000'))

# Initialize database
init_db(app)

# Initialize socket handlers
init_socket(socketio)

# Store socketio instance in app context (ignore type warning - Flask is extensible)
app.socketio = socketio  # type: ignore

# Root route


@app.route('/')
def index():
    return jsonify({'message': '🚀 Inventory Management API is running!'})


# Register blueprints
app.register_blueprint(inventory_routes.bp, url_prefix='/api/inventory')
app.register_blueprint(transaction_routes.bp, url_prefix='/api/transactions')
app.register_blueprint(analytics_routes.bp, url_prefix='/api/analytics')
app.register_blueprint(alert_routes.bp, url_prefix='/api/alerts')
app.register_blueprint(report_routes.bp, url_prefix='/api/reports')
app.register_blueprint(forecast_routes.bp, url_prefix='/api/forecast')

# Error handlers


@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'message': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Something went wrong!',
        'error': str(error) if app.debug else None
    }), 500


if __name__ == '__main__':
    PORT = int(os.getenv('PORT', 5000))
    print(f'🚀 Server is running on port {PORT}')
    print(f'🔌 WebSocket server is ready')
    socketio.run(app, host='0.0.0.0', port=PORT, debug=True)
