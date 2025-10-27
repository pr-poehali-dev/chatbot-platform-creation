"""
Business: Self-learning ML chatbot using TF-IDF similarity without external API
Args: event - dict with httpMethod, body {"bot_id": int, "message": str, "learn": bool}
Returns: HTTP response with AI-like response based on training data
"""

import json
import os
from typing import Dict, Any, List, Tuple, Optional
import re
import math
from collections import Counter
import urllib.request
import urllib.parse


def get_db_connection_params(db_url: str) -> Dict[str, Any]:
    """Parse DATABASE_URL into connection parameters"""
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
    """Execute SQL query using simple query protocol via HTTP"""
    import urllib.request
    import urllib.parse
    
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
        for i, formatted_param in enumerate(formatted_params):
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


def normalize_text(text: str) -> str:
    """Normalize text for comparison"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text


def tokenize(text: str) -> List[str]:
    """Split text into words"""
    return normalize_text(text).split()


def calculate_tfidf(documents: List[str]) -> Tuple[List[Dict[str, float]], Dict[str, float]]:
    """Calculate TF-IDF for documents"""
    doc_tokens = [tokenize(doc) for doc in documents]
    
    all_words = set()
    for tokens in doc_tokens:
        all_words.update(tokens)
    
    idf = {}
    num_docs = len(documents)
    for word in all_words:
        doc_count = sum(1 for tokens in doc_tokens if word in tokens)
        idf[word] = math.log(num_docs / (1 + doc_count))
    
    tfidf_vectors = []
    for tokens in doc_tokens:
        word_count = Counter(tokens)
        total_words = len(tokens)
        
        vector = {}
        for word in word_count:
            tf = word_count[word] / total_words if total_words > 0 else 0
            vector[word] = tf * idf.get(word, 0)
        
        tfidf_vectors.append(vector)
    
    return tfidf_vectors, idf


def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    """Calculate cosine similarity between two vectors"""
    common_words = set(vec1.keys()) & set(vec2.keys())
    
    if not common_words:
        return 0.0
    
    dot_product = sum(vec1[word] * vec2[word] for word in common_words)
    
    magnitude1 = math.sqrt(sum(val ** 2 for val in vec1.values()))
    magnitude2 = math.sqrt(sum(val ** 2 for val in vec2.values()))
    
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    
    return dot_product / (magnitude1 * magnitude2)


def find_best_match(query: str, training_data: List[Dict], threshold: float = 0.3) -> Optional[str]:
    """Find best matching answer using TF-IDF similarity"""
    if not training_data:
        return None
    
    questions = [item['question'] for item in training_data]
    all_texts = questions + [query]
    
    tfidf_vectors, idf = calculate_tfidf(all_texts)
    
    query_vector = tfidf_vectors[-1]
    question_vectors = tfidf_vectors[:-1]
    
    best_similarity = 0.0
    best_index = -1
    
    for i, q_vector in enumerate(question_vectors):
        similarity = cosine_similarity(query_vector, q_vector)
        if similarity > best_similarity:
            best_similarity = similarity
            best_index = i
    
    if best_similarity >= threshold and best_index >= 0:
        return training_data[best_index]['answer']
    
    return None


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
        bot_id: Optional[int] = body_data.get('bot_id')
        message: str = body_data.get('message', '')
        learn: bool = body_data.get('learn', False)
        answer: Optional[str] = body_data.get('answer')
        
        if not message:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'message required'})
            }
        
        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'DATABASE_URL not configured'})
            }
        
        if learn and answer:
            execute_query(
                db_url,
                "INSERT INTO bot_training_data (bot_id, question, answer) VALUES (%s, %s, %s)",
                (bot_id, message, answer)
            )
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'content': 'Обучение успешно! Запомнил новый пример.',
                    'learned': True
                })
            }
        
        if bot_id:
            training_data = execute_query(
                db_url,
                "SELECT question, answer FROM bot_training_data WHERE bot_id = %s OR bot_id IS NULL",
                (bot_id,)
            )
        else:
            training_data = execute_query(
                db_url,
                "SELECT question, answer FROM bot_training_data WHERE bot_id IS NULL",
                ()
            )
        
        response_text = find_best_match(message, training_data, threshold=0.2)
        
        if not response_text:
            response_text = "Интересный вопрос! Я ещё учусь и пока не знаю точный ответ. Можете научить меня?"
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'content': response_text,
                'confidence': 'high' if response_text else 'low'
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
