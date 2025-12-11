"""
Админ-панель для управления пользователями и энергией.
Только для администраторов: выдача/списание энергии, просмотр статистики, управление пользователями.
"""
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def cors_headers() -> Dict[str, str]:
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400'
    }

def verify_admin(token: str) -> Dict[str, Any]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT u.id, u.is_admin
                   FROM sessions s
                   JOIN users u ON s.user_id = u.id
                   WHERE s.session_token = %s AND s.expires_at > CURRENT_TIMESTAMP""",
                (token,)
            )
            user = cur.fetchone()
            
            if not user or not user['is_admin']:
                return None
            return user
    finally:
        conn.close()

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
        headers = event.get('headers', {})
        token = headers.get('x-auth-token', headers.get('X-Auth-Token', ''))
        
        if not token:
            return {
                'statusCode': 401,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Authentication required'}),
                'isBase64Encoded': False
            }
        
        admin = verify_admin(token)
        if not admin:
            return {
                'statusCode': 403,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Admin access required'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', '')
        
        if action == 'get_stats':
            return get_statistics()
        elif action == 'get_users':
            return get_all_users()
        elif action == 'update_energy':
            return update_user_energy(body_data)
        elif action == 'toggle_infinite_energy':
            return toggle_infinite_energy(body_data)
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

def get_statistics() -> Dict[str, Any]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT COUNT(*) as total_users FROM users")
            total_users = cur.fetchone()['total_users']
            
            cur.execute("SELECT COUNT(*) as active_sessions FROM sessions WHERE expires_at > CURRENT_TIMESTAMP")
            active_sessions = cur.fetchone()['active_sessions']
            
            cur.execute("SELECT SUM(energy) as total_energy FROM users WHERE is_infinite_energy = FALSE")
            total_energy = cur.fetchone()['total_energy'] or 0
            
            cur.execute("SELECT AVG(energy) as avg_energy FROM users WHERE is_infinite_energy = FALSE")
            avg_energy = cur.fetchone()['avg_energy'] or 0
            
            cur.execute("""
                SELECT transaction_type, COUNT(*) as count, SUM(amount) as total
                FROM energy_transactions
                GROUP BY transaction_type
            """)
            transactions = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({
                    'totalUsers': total_users,
                    'activeSessions': active_sessions,
                    'totalEnergy': int(total_energy),
                    'avgEnergy': round(float(avg_energy), 2),
                    'transactions': [dict(t) for t in transactions]
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def get_all_users() -> Dict[str, Any]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, email, username, energy, is_infinite_energy, is_admin, 
                       created_at, last_login
                FROM users
                ORDER BY created_at DESC
            """)
            users = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({
                    'users': [{
                        'id': u['id'],
                        'email': u['email'],
                        'username': u['username'],
                        'energy': u['energy'],
                        'isInfiniteEnergy': u['is_infinite_energy'],
                        'isAdmin': u['is_admin'],
                        'createdAt': u['created_at'].isoformat() if u['created_at'] else None,
                        'lastLogin': u['last_login'].isoformat() if u['last_login'] else None
                    } for u in users]
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def update_user_energy(data: Dict[str, Any]) -> Dict[str, Any]:
    user_id = data.get('userId')
    amount = data.get('amount')
    transaction_type = data.get('type', 'admin_adjustment')
    
    if not user_id or amount is None:
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'User ID and amount are required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT energy, is_infinite_energy FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            if user['is_infinite_energy']:
                return {
                    'statusCode': 400,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'User has infinite energy'}),
                    'isBase64Encoded': False
                }
            
            new_energy = max(0, user['energy'] + amount)
            cur.execute("UPDATE users SET energy = %s WHERE id = %s", (new_energy, user_id))
            
            cur.execute(
                """INSERT INTO energy_transactions (user_id, amount, transaction_type, description)
                   VALUES (%s, %s, %s, %s)""",
                (user_id, amount, transaction_type, f'Admin adjustment: {amount}')
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({'success': True, 'newEnergy': new_energy}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def toggle_infinite_energy(data: Dict[str, Any]) -> Dict[str, Any]:
    user_id = data.get('userId')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'User ID is required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT is_infinite_energy FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            new_value = not user['is_infinite_energy']
            cur.execute("UPDATE users SET is_infinite_energy = %s WHERE id = %s", (new_value, user_id))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({'success': True, 'isInfiniteEnergy': new_value}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()
