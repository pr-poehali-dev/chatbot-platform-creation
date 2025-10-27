-- Create bots table with AI model configuration
CREATE TABLE IF NOT EXISTS bots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    telegram_token VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    ai_model VARCHAR(50) DEFAULT 'deepseek',
    ai_prompt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table for tracking all bot interactions
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES bots(id),
    user_id BIGINT NOT NULL,
    username VARCHAR(255),
    message_text TEXT NOT NULL,
    response_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics table for bot statistics
CREATE TABLE IF NOT EXISTS bot_analytics (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES bots(id),
    date DATE NOT NULL,
    messages_count INTEGER DEFAULT 0,
    unique_users_count INTEGER DEFAULT 0,
    UNIQUE(bot_id, date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_bot_id ON messages(bot_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_bot_date ON bot_analytics(bot_id, date);