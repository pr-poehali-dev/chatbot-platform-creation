import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API for managing bots - create, update, list, get bot details
    Args: event - dict with httpMethod, body, queryStringParameters, pathParams
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
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
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'isBase64Encoded': False,
                        'body': json.dumps({'bot': bot_dict})
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
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
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'bots': bots_list})
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data.get('name')
            description = body_data.get('description', '')
            telegram_token = body_data.get('telegram_token')
            ai_model = body_data.get('ai_model', 'deepseek')
            ai_prompt = body_data.get('ai_prompt', 'Ты вежливый помощник. Отвечай кратко и по делу.')
            
            if not name or not telegram_token:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'name and telegram_token are required'})
                }
            
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
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'bot': bot_dict})
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            bot_id = body_data.get('id')
            
            if not bot_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'id is required'})
                }
            
            update_fields = []
            update_values = []
            
            if 'name' in body_data:
                update_fields.append('name = %s')
                update_values.append(body_data['name'])
            if 'description' in body_data:
                update_fields.append('description = %s')
                update_values.append(body_data['description'])
            if 'is_active' in body_data:
                update_fields.append('is_active = %s')
                update_values.append(body_data['is_active'])
            if 'ai_model' in body_data:
                update_fields.append('ai_model = %s')
                update_values.append(body_data['ai_model'])
            if 'ai_prompt' in body_data:
                update_fields.append('ai_prompt = %s')
                update_values.append(body_data['ai_prompt'])
            
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
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'bot': bot_dict})
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Bot not found'})
                }
        
        cur.close()
        conn.close()
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }