"""
Система аутентификации с регистрацией, авторизацией и управлением сессиями.
Обрабатывает: регистрацию новых пользователей (100 энергии), вход, выход, проверку токенов.
"""
import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def cors_headers() -> Dict[str, str]:
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
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
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', '')
        
        if action == 'register':
            return register_user(body_data)
        elif action == 'login':
            return login_user(body_data)
        elif action == 'logout':
            return logout_user(body_data)
        elif action == 'verify':
            return verify_token(body_data)
        elif action == 'update_password':
            return update_password(body_data)
        else:
            return {
                'statusCode': 400,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def register_user(data: Dict[str, Any]) -> Dict[str, Any]:
    email = data.get('email', '').strip().lower()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not email or not username or not password:
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Email, username and password are required'}),
            'isBase64Encoded': False
        }
    
    if len(password) < 6:
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Password must be at least 6 characters'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id FROM users WHERE email = %s OR username = %s",
                (email, username)
            )
            if cur.fetchone():
                return {
                    'statusCode': 409,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'Email or username already exists'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            cur.execute(
                """INSERT INTO users (email, username, password_hash, energy, is_infinite_energy, is_admin)
                   VALUES (%s, %s, %s, 100, FALSE, FALSE)
                   RETURNING id, email, username, energy, is_infinite_energy, is_admin""",
                (email, username, password_hash)
            )
            user = cur.fetchone()
            conn.commit()
            
            token = generate_token()
            expires_at = datetime.now() + timedelta(days=30)
            cur.execute(
                "INSERT INTO sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s)",
                (user['id'], token, expires_at)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'username': user['username'],
                        'energy': user['energy'],
                        'isInfiniteEnergy': user['is_infinite_energy'],
                        'isAdmin': user['is_admin']
                    }
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def login_user(data: Dict[str, Any]) -> Dict[str, Any]:
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Email and password are required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            password_hash = hash_password(password)
            cur.execute(
                """SELECT id, email, username, energy, is_infinite_energy, is_admin
                   FROM users WHERE email = %s AND password_hash = %s""",
                (email, password_hash)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'Invalid email or password'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s", (user['id'],))
            conn.commit()
            
            token = generate_token()
            expires_at = datetime.now() + timedelta(days=30)
            cur.execute(
                "INSERT INTO sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s)",
                (user['id'], token, expires_at)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'username': user['username'],
                        'energy': user['energy'],
                        'isInfiniteEnergy': user['is_infinite_energy'],
                        'isAdmin': user['is_admin']
                    }
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def logout_user(data: Dict[str, Any]) -> Dict[str, Any]:
    token = data.get('token', '')
    
    if not token:
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Token is required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE sessions SET expires_at = CURRENT_TIMESTAMP WHERE session_token = %s", (token,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def verify_token(data: Dict[str, Any]) -> Dict[str, Any]:
    token = data.get('token', '')
    
    if not token:
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Token is required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT u.id, u.email, u.username, u.energy, u.is_infinite_energy, u.is_admin
                   FROM sessions s
                   JOIN users u ON s.user_id = u.id
                   WHERE s.session_token = %s AND s.expires_at > CURRENT_TIMESTAMP""",
                (token,)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'Invalid or expired token'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'username': user['username'],
                        'energy': user['energy'],
                        'isInfiniteEnergy': user['is_infinite_energy'],
                        'isAdmin': user['is_admin']
                    }
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def update_password(data: Dict[str, Any]) -> Dict[str, Any]:
    email = data.get('email', '').strip().lower()
    old_password = data.get('oldPassword', '')
    new_password = data.get('newPassword', '')
    
    if not email or not old_password or not new_password:
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Email, old password and new password are required'}),
            'isBase64Encoded': False
        }
    
    if len(new_password) < 6:
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'New password must be at least 6 characters'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            old_hash = hash_password(old_password)
            cur.execute("SELECT id FROM users WHERE email = %s AND password_hash = %s", (email, old_hash))
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'Invalid email or password'}),
                    'isBase64Encoded': False
                }
            
            new_hash = hash_password(new_password)
            cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash, user['id']))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()
