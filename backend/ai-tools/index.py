"""
Business: Unified AI tools - auto-learning, CRM, documents, OCR in one function
Args: event - dict with httpMethod, body for different AI operations
Returns: HTTP response based on action type
"""

import json
import os
from typing import Dict, Any, List, Optional
import base64
import urllib.request
import urllib.parse


def get_db_connection_params(db_url: str) -> Dict[str, Any]:
    """Parse DATABASE_URL"""
    if db_url.startswith('postgresql://'):
        db_url = db_url.replace('postgresql://', '')
    
    parts = db_url.split('@')
    user_pass = parts[0].split(':')
    host_db = parts[1].split('/')
    host_port = host_db[0].split(':')
    
    return {
        'user': user_pass[0],
        'password': user_pass[1] if len(user_pass) > 1 else '',
        'host': host_port[0],
        'port': int(host_port[1]) if len(host_port) > 1 else 5432,
        'database': host_db[1].split('?')[0] if len(host_db) > 1 else 'postgres'
    }


def execute_query(db_url: str, query: str, params: tuple = ()) -> List[Dict]:
    """Execute SQL query"""
    conn_params = get_db_connection_params(db_url)
    
    formatted_query = query
    if params:
        formatted_params = []
        for param in params:
            if param is None:
                formatted_params.append('NULL')
            elif isinstance(param, str):
                formatted_params.append(f"'{param.replace(chr(39), chr(39)+chr(39))}'")
            elif isinstance(param, bool):
                formatted_params.append('TRUE' if param else 'FALSE')
            else:
                formatted_params.append(str(param))
        
        formatted_query = query.replace('%s', '{}')
        for formatted_param in formatted_params:
            formatted_query = formatted_query.replace('{}', formatted_param, 1)
    
    proxy_url = f"http://goauth-proxy:5432/{conn_params['database']}"
    
    data = json.dumps({'query': formatted_query}).encode('utf-8')
    
    req = urllib.request.Request(
        proxy_url,
        data=data,
        headers={
            'Content-Type': 'application/json',
            'X-DB-User': conn_params['user'],
            'X-DB-Password': conn_params['password'],
            'X-DB-Host': conn_params['host'],
            'X-DB-Port': str(conn_params['port'])
        }
    )
    
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get('rows', [])
    except Exception:
        return []


def auto_learn(bot_id: int, db_url: str) -> Dict:
    """Auto-learning from conversations"""
    messages = execute_query(
        db_url,
        """
        SELECT m.message_text, m.response_text, COUNT(*) as frequency
        FROM messages m
        WHERE m.bot_id = %s 
        AND m.response_text IS NOT NULL
        AND m.created_at > NOW() - INTERVAL '7 days'
        GROUP BY m.message_text, m.response_text
        HAVING COUNT(*) >= 2
        ORDER BY frequency DESC
        LIMIT 20
        """,
        (bot_id,)
    )
    
    learned_count = 0
    for msg in messages:
        question = msg.get('message_text', '')
        answer = msg.get('response_text', '')
        
        if question and answer and len(question) > 3 and len(answer) > 3:
            existing = execute_query(
                db_url,
                "SELECT id FROM bot_training_data WHERE bot_id = %s AND question = %s LIMIT 1",
                (bot_id, question)
            )
            
            if not existing:
                execute_query(
                    db_url,
                    "INSERT INTO bot_training_data (bot_id, question, answer, category) VALUES (%s, %s, %s, %s)",
                    (bot_id, question, answer, 'auto_learned')
                )
                learned_count += 1
    
    return {'learned': learned_count}


def sync_crm_amocrm(api_key: str, subdomain: str, contact: Dict) -> Dict:
    """AmoCRM integration"""
    url = f'https://{subdomain}.amocrm.ru/api/v4/contacts'
    
    payload = [{
        'name': contact.get('name', ''),
        'custom_fields_values': [
            {'field_code': 'PHONE', 'values': [{'value': contact.get('phone', '')}]},
            {'field_code': 'EMAIL', 'values': [{'value': contact.get('email', '')}]}
        ]
    }]
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return {'error': str(e)}


def ocr_image(image_url: str) -> str:
    """OCR using OCR.space free API"""
    try:
        api_url = 'https://api.ocr.space/parse/imageurl'
        
        data = urllib.parse.urlencode({
            'url': image_url,
            'language': 'rus',
            'isOverlayRequired': 'false'
        }).encode('utf-8')
        
        req = urllib.request.Request(
            api_url,
            data=data,
            headers={'apikey': 'K87899142388957'}
        )
        
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            parsed_results = result.get('ParsedResults', [])
            if parsed_results:
                return parsed_results[0].get('ParsedText', '')
    except Exception:
        pass
    
    return ""


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        action: str = body_data.get('action', '')
        
        db_url = os.environ.get('DATABASE_URL')
        
        if action == 'auto_learn':
            bot_id: int = body_data.get('bot_id')
            if not db_url:
                return {
                    'statusCode': 500,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'DATABASE_URL not configured'})
                }
            
            result = auto_learn(bot_id, db_url)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'result': result})
            }
        
        elif action == 'crm_sync':
            api_key = body_data.get('api_key', '')
            subdomain = body_data.get('subdomain', '')
            contact = body_data.get('contact', {})
            
            result = sync_crm_amocrm(api_key, subdomain, contact)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'result': result})
            }
        
        elif action == 'ocr':
            image_url = body_data.get('image_url', '')
            text = ocr_image(image_url)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'text': text})
            }
        
        elif action == 'knowledge_update':
            bot_id: int = body_data.get('bot_id')
            entries: List[Dict] = body_data.get('entries', [])
            
            if not db_url:
                return {
                    'statusCode': 500,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'DATABASE_URL not configured'})
                }
            
            added = 0
            for entry in entries:
                question = entry.get('question', '')
                answer = entry.get('answer', '')
                category = entry.get('category', 'manual')
                
                if question and answer:
                    execute_query(
                        db_url,
                        "INSERT INTO bot_training_data (bot_id, question, answer, category) VALUES (%s, %s, %s, %s)",
                        (bot_id, question, answer, category)
                    )
                    added += 1
            
            execute_query(
                db_url,
                "INSERT INTO knowledge_updates (bot_id, update_type, source, entries_added) VALUES (%s, %s, %s, %s)",
                (bot_id, 'bulk_update', 'api', added)
            )
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'added': added})
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
