"""
Модуль безопасности для backend функций
Включает валидацию, санитизацию, rate limiting, аутентификацию
"""

import html
import re
import time
import json
from typing import Dict, Any, List, Optional, Tuple
from collections import defaultdict

# Rate limiting storage
request_counts = defaultdict(list)

RATE_LIMIT = 60
RATE_WINDOW = 60

ALLOWED_ORIGINS = [
    'https://poehali.dev',
    'https://www.poehali.dev',
    'http://localhost:5173',
    'http://localhost:3000'
]

def get_cors_headers(event: Dict[str, Any]) -> Dict[str, str]:
    """
    Безопасные CORS заголовки с whitelist доменов
    """
    origin = event.get('headers', {}).get('Origin', '')
    
    if origin in ALLOWED_ORIGINS:
        cors_origin = origin
    else:
        cors_origin = ALLOWED_ORIGINS[0]
    
    return {
        'Access-Control-Allow-Origin': cors_origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
    }

def check_rate_limit(ip_address: str, limit: int = RATE_LIMIT, window: int = RATE_WINDOW) -> bool:
    """
    Проверка rate limiting по IP адресу
    
    Args:
        ip_address: IP адрес клиента
        limit: Максимум запросов в окне
        window: Окно времени в секундах
        
    Returns:
        True если лимит не превышен, False иначе
    """
    now = time.time()
    
    request_counts[ip_address] = [
        t for t in request_counts[ip_address] 
        if now - t < window
    ]
    
    if len(request_counts[ip_address]) >= limit:
        return False
    
    request_counts[ip_address].append(now)
    return True

def sanitize_input(text: str, max_length: int = 1000) -> str:
    """
    Санитизация пользовательского ввода от XSS
    
    Args:
        text: Входной текст
        max_length: Максимальная длина
        
    Returns:
        Очищенный текст
    """
    if not text:
        return ''
    
    text = str(text)[:max_length]
    
    text = re.sub(r'<[^>]*>', '', text)
    text = html.escape(text)
    text = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]', '', text)
    
    return text.strip()

def validate_input(data: Dict[str, Any], schema: Dict[str, Dict[str, Any]]) -> List[str]:
    """
    Валидация входных данных по схеме
    
    Args:
        data: Данные для валидации
        schema: Схема валидации
        
    Returns:
        Список ошибок (пустой если всё ок)
        
    Example:
        schema = {
            'name': {'type': str, 'max_len': 100, 'required': True},
            'email': {'type': str, 'pattern': r'^[^@]+@[^@]+\.[^@]+$'},
            'age': {'type': int, 'min': 0, 'max': 150}
        }
    """
    errors = []
    
    for field, rules in schema.items():
        value = data.get(field)
        
        if rules.get('required') and not value:
            errors.append(f'{field} is required')
            continue
            
        if value is not None:
            expected_type = rules.get('type')
            if expected_type and not isinstance(value, expected_type):
                errors.append(f'{field} must be {expected_type.__name__}')
                continue
            
            if isinstance(value, str):
                if 'max_len' in rules and len(value) > rules['max_len']:
                    errors.append(f'{field} exceeds max length {rules["max_len"]}')
                
                if 'min_len' in rules and len(value) < rules['min_len']:
                    errors.append(f'{field} is too short (min {rules["min_len"]})')
                
                if 'pattern' in rules:
                    if not re.match(rules['pattern'], value):
                        errors.append(f'{field} format is invalid')
            
            if isinstance(value, (int, float)):
                if 'min' in rules and value < rules['min']:
                    errors.append(f'{field} must be >= {rules["min"]}')
                
                if 'max' in rules and value > rules['max']:
                    errors.append(f'{field} must be <= {rules["max"]}')
    
    return errors

def escape_sql_param(param: Any) -> str:
    """
    Безопасное экранирование SQL параметров для Simple Query Protocol
    
    Args:
        param: Параметр для экранирования
        
    Returns:
        Экранированная строка
    """
    if param is None:
        return 'NULL'
    
    if isinstance(param, bool):
        return 'TRUE' if param else 'FALSE'
    
    if isinstance(param, (int, float)):
        return str(param)
    
    param_str = str(param)
    param_str = param_str.replace("'", "''")
    
    return f"'{param_str}'"

def validate_uuid(uuid_str: str) -> bool:
    """
    Проверка валидности UUID
    
    Args:
        uuid_str: Строка UUID
        
    Returns:
        True если валидный UUID
    """
    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    return bool(re.match(uuid_pattern, str(uuid_str).lower()))

def safe_error_response(error: Exception, context: Any) -> Dict[str, Any]:
    """
    Безопасный ответ с ошибкой без утечки деталей
    
    Args:
        error: Exception объект
        context: Cloud function context
        
    Returns:
        Безопасный ответ для клиента
    """
    import logging
    logger = logging.getLogger(__name__)
    
    logger.error(f"Error in {context.function_name}: {str(error)}", exc_info=True)
    
    return {
        'statusCode': 500,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'error': 'Internal server error',
            'request_id': getattr(context, 'request_id', 'unknown')
        })
    }

def validate_telegram_token(token: str) -> bool:
    """
    Валидация формата Telegram Bot токена
    
    Args:
        token: Telegram токен
        
    Returns:
        True если формат корректный
    """
    pattern = r'^\d{8,10}:[A-Za-z0-9_-]{35}$'
    return bool(re.match(pattern, token))

def validate_url(url: str) -> bool:
    """
    Валидация URL
    
    Args:
        url: URL для проверки
        
    Returns:
        True если валидный URL
    """
    url_pattern = r'^https?://[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(/.*)?$'
    return bool(re.match(url_pattern, url))

def extract_ip(event: Dict[str, Any]) -> str:
    """
    Извлечение IP адреса из события
    
    Args:
        event: Cloud function event
        
    Returns:
        IP адрес клиента
    """
    return event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
