import json
import os
from typing import Dict, Any
import urllib.request
import psycopg2
from psycopg2.extras import RealDictCursor

def send_telegram_message(bot_token: str, chat_id: str, text: str) -> bool:
    telegram_url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    data = json.dumps({
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }).encode('utf-8')
    
    req = urllib.request.Request(
        telegram_url,
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            return True
    except Exception:
        return False

def get_bot_response(message_text: str, bot_scenarios: list) -> str:
    message_lower = message_text.lower().strip()
    
    if message_lower in ['привет', 'здравствуйте', 'hi', 'hello', '/start']:
        return 'Привет! Я бот-помощник. Чем могу помочь?'
    
    if message_lower in ['помощь', 'help', '/help']:
        return 'Я могу помочь вам с:\n• Информацией о продуктах\n• Ответами на вопросы\n• Поддержкой клиентов\n\nПросто напишите свой вопрос!'
    
    if any(word in message_lower for word in ['цена', 'стоимость', 'сколько']):
        return 'Наши цены начинаются от 2000₽/месяц. Для подробной информации напишите "тарифы".'
    
    if 'тариф' in message_lower:
        return '📋 Наши тарифы:\n\n💎 Базовый - 2000₽/мес\n⭐ Профессиональный - 5000₽/мес\n🚀 Корпоративный - 15000₽/мес\n\nНапишите номер тарифа для подробностей!'
    
    if any(word in message_lower for word in ['контакт', 'связь', 'телефон', 'email']):
        return 'Связаться с нами:\n📧 Email: support@botplatform.ru\n📱 Telegram: @botplatform_support\n🌐 Сайт: botplatform.ru'
    
    if any(word in message_lower for word in ['спасибо', 'thanks', 'благодарю']):
        return 'Всегда пожалуйста! Обращайтесь, если возникнут вопросы. 😊'
    
    return 'Я вас понял. Ваш запрос передан специалисту. Мы свяжемся с вами в ближайшее время!'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Telegram webhook handler - receives messages and sends auto-replies
    Args: event - dict with httpMethod, body (Telegram update)
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'isBase64Encoded': False,
            'body': json.dumps({'ok': True})
        }
    
    try:
        update = json.loads(event.get('body', '{}'))
        
        if 'message' not in update:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'isBase64Encoded': False,
                'body': json.dumps({'ok': True})
            }
        
        message = update['message']
        chat_id = str(message['chat']['id'])
        message_text = message.get('text', '')
        user_id = str(message['from']['id'])
        
        db_url = os.environ.get('DATABASE_URL')
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        
        if not bot_token:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'isBase64Encoded': False,
                'body': json.dumps({'ok': True})
            }
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            "SELECT * FROM bots WHERE telegram_token = %s AND status = %s LIMIT 1",
            (bot_token, 'active')
        )
        bot = cur.fetchone()
        
        if not bot:
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'isBase64Encoded': False,
                'body': json.dumps({'ok': True})
            }
        
        cur.execute(
            "INSERT INTO bot_messages (bot_id, user_id, message_text, direction, platform) VALUES (%s, %s, %s, %s, %s)",
            (bot['id'], user_id, message_text, 'in', 'telegram')
        )
        
        cur.execute(
            "INSERT INTO bot_stats (bot_id, date, total_messages, total_users, active_users) VALUES (%s, CURRENT_DATE, 1, 1, 1) ON CONFLICT (bot_id, date) DO UPDATE SET total_messages = bot_stats.total_messages + 1",
            (bot['id'],)
        )
        
        conn.commit()
        
        bot_scenarios = bot.get('scenarios') or []
        response_text = get_bot_response(message_text, bot_scenarios)
        
        send_success = send_telegram_message(bot_token, chat_id, response_text)
        
        if send_success:
            cur.execute(
                "INSERT INTO bot_messages (bot_id, user_id, message_text, direction, platform) VALUES (%s, %s, %s, %s, %s)",
                (bot['id'], user_id, response_text, 'out', 'telegram')
            )
            conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'isBase64Encoded': False,
            'body': json.dumps({'ok': True})
        }
        
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'isBase64Encoded': False,
            'body': json.dumps({'ok': True, 'error': str(e)})
        }
