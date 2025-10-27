-- Create training data table for bot learning
CREATE TABLE IF NOT EXISTS bot_training_data (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES bots(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_training_bot_id ON bot_training_data(bot_id);
CREATE INDEX IF NOT EXISTS idx_training_category ON bot_training_data(category);

-- Add sample training data for general knowledge
INSERT INTO bot_training_data (bot_id, question, answer, category) VALUES
(NULL, 'привет', 'Здравствуйте! Чем могу помочь?', 'greeting'),
(NULL, 'здравствуйте', 'Привет! Рад вас видеть!', 'greeting'),
(NULL, 'добрый день', 'Добрый день! Как дела?', 'greeting'),
(NULL, 'как дела', 'Отлично, спасибо! А у вас?', 'greeting'),
(NULL, 'спасибо', 'Всегда пожалуйста!', 'gratitude'),
(NULL, 'благодарю', 'Рад помочь!', 'gratitude'),
(NULL, 'помощь', 'Конечно помогу! Опишите вашу задачу подробнее.', 'help'),
(NULL, 'что ты умеешь', 'Я могу отвечать на вопросы, помогать с информацией и обучаться на ваших примерах!', 'help'),
(NULL, 'пока', 'До свидания! Обращайтесь ещё!', 'goodbye'),
(NULL, 'до свидания', 'Пока! Хорошего дня!', 'goodbye');