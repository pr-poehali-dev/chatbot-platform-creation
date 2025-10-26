-- Добавление шаблонных ботов
INSERT INTO bots (name, bot_type, platform, description, telegram_token, telegram_username, status, scenarios, settings) VALUES 
('Помощник продаж', 'ai-agent', 'telegram', 'ИИ-агент для автоматизации продаж в Instagram и WhatsApp', '8059737467:AAEywpOOuZBvzCu35gSqZetsxgZzwULHCjc', 'helplide_bot', 'active', 
'[{"type": "greeting", "text": "Здравствуйте! Я помогу вам с выбором товара."}, {"type": "questions", "questions": ["Какой бюджет?", "Какие характеристики важны?"]}]'::jsonb,
'{"auto_reply": true, "work_hours": "24/7"}'::jsonb),

('Клиентская поддержка', 'chatbot', 'telegram', 'Бот для обработки обращений клиентов в Telegram', '8059737467:AAEywpOOuZBvzCu35gSqZetsxgZzwULHCjc', 'helplide_bot', 'active',
'[{"type": "greeting", "text": "Здравствуйте! Опишите вашу проблему, и я помогу."}, {"type": "faq", "items": [{"q": "Как оформить заказ?", "a": "Выберите товар и нажмите Купить"}]}]'::jsonb,
'{"auto_reply": true, "escalate_to_human": true}'::jsonb),

('HR-ассистент', 'ai-employee', 'telegram', 'ИИ-сотрудник для подбора персонала и онбординга', '8059737467:AAEywpOOuZBvzCu35gSqZetsxgZzwULHCjc', 'helplide_bot', 'active',
'[{"type": "greeting", "text": "Привет! Я HR-бот. Помогу с вопросами о вакансиях."}, {"type": "collect_resume", "fields": ["ФИО", "Опыт", "Email"]}]'::jsonb,
'{"auto_reply": true, "save_applications": true}'::jsonb),

('Контент-менеджер', 'ai-agent', 'telegram', 'Автоматизация публикаций в социальных сетях', '8059737467:AAEywpOOuZBvzCu35gSqZetsxgZzwULHCjc', 'helplide_bot', 'draft',
'[{"type": "greeting", "text": "Я помогу запланировать публикации."}, {"type": "schedule", "platforms": ["Instagram", "VK", "Facebook"]}]'::jsonb,
'{"auto_reply": true, "content_generation": true}'::jsonb),

('Бухгалтер-помощник', 'ai-employee', 'telegram', 'ИИ для автоматизации финансового учета', '8059737467:AAEywpOOuZBvzCu35gSqZetsxgZzwULHCjc', 'helplide_bot', 'draft',
'[{"type": "greeting", "text": "Здравствуйте! Загрузите чек или опишите расход."}, {"type": "expense_tracking", "categories": ["Офис", "Транспорт", "Еда"]}]'::jsonb,
'{"auto_reply": true, "categorize_expenses": true}'::jsonb),

('Помощник записи', 'chatbot', 'telegram', 'Бот для записи клиентов в салоны красоты и клиники', '8059737467:AAEywpOOuZBvzCu35gSqZetsxgZzwULHCjc', 'helplide_bot', 'active',
'[{"type": "greeting", "text": "Добро пожаловать! Выберите услугу и время записи."}, {"type": "booking", "services": ["Стрижка", "Маникюр", "Массаж"]}]'::jsonb,
'{"auto_reply": true, "send_reminders": true}'::jsonb);
