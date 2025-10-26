-- Создание таблицы для хранения ботов
CREATE TABLE IF NOT EXISTS bots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bot_type VARCHAR(50) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    description TEXT,
    telegram_token VARCHAR(255),
    telegram_username VARCHAR(255),
    webhook_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft',
    scenarios JSONB,
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы для хранения сообщений
CREATE TABLE IF NOT EXISTS bot_messages (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES bots(id),
    user_id VARCHAR(100),
    message_text TEXT,
    direction VARCHAR(10) CHECK (direction IN ('in', 'out')),
    platform VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы для статистики
CREATE TABLE IF NOT EXISTS bot_stats (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES bots(id),
    date DATE DEFAULT CURRENT_DATE,
    total_users INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    UNIQUE(bot_id, date)
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_bots_status ON bots(status);
CREATE INDEX IF NOT EXISTS idx_bot_messages_bot_id ON bot_messages(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_messages_created_at ON bot_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_bot_stats_bot_id_date ON bot_stats(bot_id, date);
