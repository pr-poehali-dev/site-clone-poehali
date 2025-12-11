"""
Утилита для первичной настройки администратора и генерации хешей паролей.
"""
import json
import os
import hashlib
from typing import Dict, Any
import psycopg2

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def cors_headers() -> Dict[str, str]:
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        try:
            body_data = json.loads(event.get('body', '{}'))
            password = body_data.get('password', 'woy228228')
            email = body_data.get('email', 'den.nazarenko.02@internet.ru')
            
            password_hash = hash_password(password)
            
            conn = get_db_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE users SET password_hash = %s WHERE email = %s",
                        (password_hash, email)
                    )
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': cors_headers(),
                        'body': json.dumps({
                            'success': True,
                            'email': email,
                            'hash': password_hash,
                            'message': 'Password updated successfully'
                        }),
                        'isBase64Encoded': False
                    }
            finally:
                conn.close()
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': cors_headers(),
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps({
            'message': 'Admin setup utility',
            'usage': 'POST with {"password": "yourpassword", "email": "user@example.com"}'
        }),
        'isBase64Encoded': False
    }
