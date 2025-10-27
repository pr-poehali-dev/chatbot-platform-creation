-- Add feedback system for improving bot responses
CREATE TABLE IF NOT EXISTS bot_feedback (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES bots(id),
    message_id INTEGER REFERENCES messages(id),
    user_id BIGINT NOT NULL,
    feedback_type VARCHAR(20) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add CRM integrations table
CREATE TABLE IF NOT EXISTS crm_integrations (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES bots(id),
    crm_type VARCHAR(50) NOT NULL,
    api_key TEXT,
    webhook_url TEXT,
    settings JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add knowledge base auto-update log
CREATE TABLE IF NOT EXISTS knowledge_updates (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES bots(id),
    update_type VARCHAR(50) NOT NULL,
    source VARCHAR(100),
    entries_added INTEGER DEFAULT 0,
    entries_updated INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add document processing queue
CREATE TABLE IF NOT EXISTS document_queue (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES bots(id),
    user_id BIGINT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    processing_status VARCHAR(20) DEFAULT 'pending',
    extracted_text TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_bot_id ON bot_feedback(bot_id);
CREATE INDEX IF NOT EXISTS idx_crm_bot_id ON crm_integrations(bot_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_bot_id ON knowledge_updates(bot_id);
CREATE INDEX IF NOT EXISTS idx_doc_queue_status ON document_queue(processing_status);