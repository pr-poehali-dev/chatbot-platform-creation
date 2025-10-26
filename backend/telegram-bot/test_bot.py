import urllib.request
import json

bot_token = "8059737467:AAEywpOOuZBvzCu35gSqZetsxgZzwULHCjc"
telegram_url = f'https://api.telegram.org/bot{bot_token}/getMe'

try:
    with urllib.request.urlopen(telegram_url) as response:
        result = json.loads(response.read().decode('utf-8'))
        print(json.dumps(result, indent=2, ensure_ascii=False))
except Exception as e:
    print(f"Error: {e}")
