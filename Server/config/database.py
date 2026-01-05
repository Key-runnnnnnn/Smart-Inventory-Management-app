from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os

# Initialize MongoDB client and database
client = None
db = None


def init_db(app):
    """Initialize database connection"""
    global client, db
    try:
        print('🔌 Attempting to connect to MongoDB...')

        # Create MongoDB client with timeouts
        client = MongoClient(
            app.config['MONGODB_URI'],
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=5000,
            socketTimeoutMS=5000
        )

        # Get database name from URI or use default
        db = client.get_database()

        # Test the connection
        client.admin.command('ping')
        print(f'✅ MongoDB Connected successfully!')
        print(f'📦 Database: {db.name}')
        return db
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f'❌ Error connecting to MongoDB: {str(e)}')
        print('⚠️  Server will continue running but database operations will fail.')
        print('   Please check:')
        print('   1. Your MongoDB Atlas cluster is running')
        print('   2. Your IP address is whitelisted in Atlas')
        print('   3. Your internet connection is working')
        print('   4. The connection string is correct')
        return None
    except Exception as e:
        print(f'❌ Unexpected error: {str(e)}')
        return None


def get_db():
    """Get database instance"""
    return db


def close_db():
    """Close database connection"""
    global client
    if client:
        client.close()
        print('🔌 MongoDB connection closed')
