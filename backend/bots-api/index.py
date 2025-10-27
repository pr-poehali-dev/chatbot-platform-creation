import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import html
import re
import time
from collections import defaultdict

request_counts = defaultdict(list)

def get_cors_headers(event):
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }

def check_rate_limit(ip, limit=60, window=60):
    now = time.time()
    request_counts[ip] = [t for t in request_counts[ip] if now - t < window]
    if len(request_counts[ip]) >= limit:
        return False
    request_counts[ip].append(now)
    return True

def sanitize_input(text, max_len=1000):
    if not text:
        return ''
    text = str(text)[:max_len]
    text = re.sub(r'<[^>]*>', '', text)
    text = html.escape(text)
    return text.strip()

def validate_input(data, schema):
    errors = []
    for field, rules in schema.items():
        value = data.get(field)
        if rules.get('required') and not value:
            errors.append(f'{field} is required')
            continue
        if value is not None:
            if rules.get('type') and not isinstance(value, rules['type']):
                errors.append(f'{field} must be {rules["type"].__name__}')
                continue
            if isinstance(value, str):
                if 'max_len' in rules and len(value) > rules['max_len']:
                    errors.append(f'{field} exceeds max length')
                if 'min_len' in rules and len(value) < rules['min_len']:
                    errors.append(f'{field} is too short')
            if isinstance(value, int):
                if 'min' in rules and value < rules['min']:
                    errors.append(f'{field} too small')
    return errors

def validate_telegram_token(token):
    pattern = r'^\d{8,10}:[A-Za-z0-9_-]{35}$'
    return bool(re.match(pattern, token))

def extract_ip(event):
    return event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')

def safe_error_response(error, context):
    return {
        'statusCode': 500,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Internal server error'})
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API for managing bots - create, update, list, get bot details
    Args: event - dict with httpMethod, body, queryStringParameters, pathParams
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    cors_headers = get_cors_headers(event)
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    
    ip_address = extract_ip(event)
    if not check_rate_limit(ip_address, limit=60, window=60):
        return {
            'statusCode': 429,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Too many requests'})
        }
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            bot_id = params.get('id')
            
            if bot_id:
                cur.execute(
                    "SELECT * FROM bots WHERE id = %s",
                    (bot_id,)
                )
                bot = cur.fetchone()
                
                if bot:
                    bot_dict = dict(bot)
                    bot_dict['created_at'] = bot_dict['created_at'].isoformat() if bot_dict.get('created_at') else None
                    bot_dict['updated_at'] = bot_dict['updated_at'].isoformat() if bot_dict.get('updated_at') else None
                    
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'isBase64Encoded': False,
                        'body': json.dumps({'bot': bot_dict})
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': cors_headers,
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Bot not found'})
                    }
            else:
                cur.execute("SELECT * FROM bots ORDER BY created_at DESC")
                bots = cur.fetchall()
                
                bots_list = []
                for bot in bots:
                    bot_dict = dict(bot)
                    bot_dict['created_at'] = bot_dict['created_at'].isoformat() if bot_dict.get('created_at') else None
                    bot_dict['updated_at'] = bot_dict['updated_at'].isoformat() if bot_dict.get('updated_at') else None
                    bots_list.append(bot_dict)
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'bots': bots_list})
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            errors = validate_input(body_data, {
                'name': {'type': str, 'required': True, 'min_len': 1, 'max_len': 200},
                'telegram_token': {'type': str, 'required': True, 'min_len': 40, 'max_len': 100},
                'description': {'type': str, 'max_len': 1000},
                'ai_model': {'type': str, 'max_len': 50},
                'ai_prompt': {'type': str, 'max_len': 5000}
            })
            if errors:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'errors': errors})
                }
            
            telegram_token = body_data.get('telegram_token')
            if not validate_telegram_token(telegram_token):
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Invalid Telegram token format'})
                }
            
            name = sanitize_input(body_data.get('name'), 200)
            description = sanitize_input(body_data.get('description', ''), 1000)
            ai_model = sanitize_input(body_data.get('ai_model', 'deepseek'), 50)
            ai_prompt = sanitize_input(body_data.get('ai_prompt', 'Ты вежливый помощник. Отвечай кратко и по делу.'), 5000)
            
            cur.execute(
                """
                INSERT INTO bots (name, description, telegram_token, ai_model, ai_prompt, is_active)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (name, description, telegram_token, ai_model, ai_prompt, True)
            )
            
            new_bot = cur.fetchone()
            conn.commit()
            
            bot_dict = dict(new_bot)
            bot_dict['created_at'] = bot_dict['created_at'].isoformat() if bot_dict.get('created_at') else None
            bot_dict['updated_at'] = bot_dict['updated_at'].isoformat() if bot_dict.get('updated_at') else None
            
            return {
                'statusCode': 201,
                'headers': cors_headers,
                'isBase64Encoded': False,
                'body': json.dumps({'bot': bot_dict})
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            errors = validate_input(body_data, {
                'id': {'type': int, 'required': True, 'min': 1}
            })
            if errors:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'errors': errors})
                }
            
            bot_id = body_data.get('id')
            
            ALLOWED_FIELDS = {'name', 'description', 'is_active', 'ai_model', 'ai_prompt'}
            update_fields = []
            update_values = []
            
            for field in body_data:
                if field in ALLOWED_FIELDS:
                    if field == 'name':
                        value = sanitize_input(body_data[field], 200)
                    elif field == 'description':
                        value = sanitize_input(body_data[field], 1000)
                    elif field == 'ai_model':
                        value = sanitize_input(body_data[field], 50)
                    elif field == 'ai_prompt':
                        value = sanitize_input(body_data[field], 5000)
                    else:
                        value = body_data[field]
                    
                    update_fields.append(f'{field} = %s')
                    update_values.append(value)
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'No valid fields to update'})
                }
            
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            update_values.append(bot_id)
            
            cur.execute(
                f"UPDATE bots SET {', '.join(update_fields)} WHERE id = %s RETURNING *",
                tuple(update_values)
            )
            
            updated_bot = cur.fetchone()
            conn.commit()
            
            if updated_bot:
                bot_dict = dict(updated_bot)
                bot_dict['created_at'] = bot_dict['created_at'].isoformat() if bot_dict.get('created_at') else None
                bot_dict['updated_at'] = bot_dict['updated_at'].isoformat() if bot_dict.get('updated_at') else None
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'bot': bot_dict})
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Bot not found'})
                }
        
        cur.close()
        conn.close()
        
    except Exception as e:
        return safe_error_response(e, context)
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }