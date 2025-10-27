"""
Business: Universal AI chat API supporting multiple providers (DeepSeek, Groq, OpenAI)
Args: event - dict with httpMethod, body {"messages": [...], "model": "deepseek"/"groq"/"openai"}
Returns: HTTP response with AI chat completion
"""

import json
import os
from typing import Dict, Any, List
import urllib.request
import urllib.error


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
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
    
    body_data = json.loads(event.get('body', '{}'))
    messages: List[Dict[str, str]] = body_data.get('messages', [])
    model_type: str = body_data.get('model', 'deepseek').lower()
    
    if not messages:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'messages required'})
        }
    
    try:
        if model_type == 'deepseek':
            result = call_deepseek(messages)
        elif model_type == 'groq':
            result = call_groq(messages)
        elif model_type == 'openai':
            result = call_openai(messages)
        else:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid model. Use: deepseek, groq, openai'})
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(result)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }


def call_deepseek(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    api_key = os.environ.get('DEEPSEEK_API_KEY')
    if not api_key:
        raise ValueError('DEEPSEEK_API_KEY not configured')
    
    url = 'https://api.deepseek.com/v1/chat/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    payload = {
        'model': 'deepseek-chat',
        'messages': messages,
        'temperature': 0.7
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        return {
            'content': result['choices'][0]['message']['content'],
            'model': 'deepseek-chat',
            'usage': result.get('usage', {})
        }


def call_groq(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    api_key = os.environ.get('GROQ_API_KEY')
    if not api_key:
        raise ValueError('GROQ_API_KEY not configured')
    
    url = 'https://api.groq.com/openai/v1/chat/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    payload = {
        'model': 'llama-3.1-70b-versatile',
        'messages': messages,
        'temperature': 0.7
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        return {
            'content': result['choices'][0]['message']['content'],
            'model': 'llama-3.1-70b-versatile',
            'usage': result.get('usage', {})
        }


def call_openai(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        raise ValueError('OPENAI_API_KEY not configured')
    
    url = 'https://api.openai.com/v1/chat/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    payload = {
        'model': 'gpt-3.5-turbo',
        'messages': messages,
        'temperature': 0.7
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        return {
            'content': result['choices'][0]['message']['content'],
            'model': 'gpt-3.5-turbo',
            'usage': result.get('usage', {})
        }
