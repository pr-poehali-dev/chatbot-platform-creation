"""
Business: Telegram webhook handler with AI integration - receives messages and sends intelligent auto-replies
Args: event - dict with httpMethod, body (Telegram update)
      context - object with attributes: request_id, function_name
Returns: HTTP response dict
"""

import json
import os
from typing import Dict, Any, Optional
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


def call_ai_chat(ai_model: str, prompt: str, message: str, ai_chat_url: str) -> Optional[str]:
    """Call AI chat API to get intelligent response"""
    try:
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": message}
        ]
        
        data = json.dumps({
            "messages": messages,
            "model": ai_model
        }).encode('utf-8')
        
        req = urllib.request.Request(
            ai_chat_url,
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get('content')
    except Exception:
        return None


def get_fallback_response(message_text: str) -> str:
    """Fallback responses if AI is not configured"""
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
        user_id = message['from']['id']
        username = message['from'].get('username', '')
        
        db_url = os.environ.get('DATABASE_URL')
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        
        if not bot_token or not db_url:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'isBase64Encoded': False,
                'body': json.dumps({'ok': True})
            }
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            "SELECT * FROM bots WHERE telegram_token = %s AND is_active = %s LIMIT 1",
            (bot_token, True)
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
        
        bot_id = bot['id']
        ai_model = bot.get('ai_model', 'deepseek')
        ai_prompt = bot.get('ai_prompt') or 'Ты вежливый помощник. Отвечай кратко и по делу.'
        
        cur.execute(
            "INSERT INTO messages (bot_id, user_id, username, message_text) VALUES (%s, %s, %s, %s)",
            (bot_id, user_id, username, message_text)
        )
        conn.commit()
        
        ai_chat_url = 'https://functions.poehali.dev/c2e48ecb-bb5d-44ec-8ac2-f56e7946f066'
        response_text = call_ai_chat(ai_model, ai_prompt, message_text, ai_chat_url)
        
        if not response_text:
            response_text = get_fallback_response(message_text)
        
        send_success = send_telegram_message(bot_token, chat_id, response_text)
        
        if send_success:
            cur.execute(
                "UPDATE messages SET response_text = %s WHERE bot_id = %s AND user_id = %s AND message_text = %s",
                (response_text, bot_id, user_id, message_text)
            )
            
            cur.execute(
                """
                INSERT INTO bot_analytics (bot_id, date, messages_count, unique_users_count) 
                VALUES (%s, CURRENT_DATE, 1, 1)
                ON CONFLICT (bot_id, date) 
                DO UPDATE SET messages_count = bot_analytics.messages_count + 1
                """,
                (bot_id,)
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
