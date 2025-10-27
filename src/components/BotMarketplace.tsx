import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface Bot {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  rentPrice: number;
  rating: number;
  users: number;
  icon: string;
  features: string[];
}

const mockBots: Bot[] = [
  // Продажи (10 ботов)
  {
    id: 1,
    name: 'Помощник продаж',
    description: 'ИИ-агент для автоматизации продаж в Instagram и WhatsApp',
    category: 'Продажи',
    price: 15000,
    rentPrice: 3000,
    rating: 4.8,
    users: 1240,
    icon: 'ShoppingBag',
    features: ['Квалификация лидов', 'Автоответы 24/7', 'Интеграция с CRM']
  },
  {
    id: 2,
    name: 'Консультант магазина',
    description: 'Бот-продавец для интернет-магазинов с каталогом',
    category: 'Продажи',
    price: 12000,
    rentPrice: 2500,
    rating: 4.9,
    users: 1580,
    icon: 'Store',
    features: ['Каталог товаров', 'Приём заказов', 'Расчёт доставки']
  },
  {
    id: 3,
    name: 'Лид-квалификатор',
    description: 'Фильтрация и оценка качества входящих заявок',
    category: 'Продажи',
    price: 18000,
    rentPrice: 3500,
    rating: 4.7,
    users: 890,
    icon: 'Filter',
    features: ['Скоринг лидов', 'Анкетирование', 'Передача в отдел продаж']
  },
  {
    id: 4,
    name: 'Менеджер допродаж',
    description: 'Upsell и cross-sell для существующих клиентов',
    category: 'Продажи',
    price: 16000,
    rentPrice: 3200,
    rating: 4.6,
    users: 720,
    icon: 'TrendingUp',
    features: ['Персональные предложения', 'История покупок', 'Скидки']
  },
  {
    id: 5,
    name: 'Холодные звонки',
    description: 'Бот для первичного контакта с холодной базой',
    category: 'Продажи',
    price: 14000,
    rentPrice: 2800,
    rating: 4.5,
    users: 650,
    icon: 'Phone',
    features: ['Скрипты продаж', 'Обработка возражений', 'Запись звонков']
  },
  {
    id: 6,
    name: 'Карьерный консультант',
    description: 'Продажа образовательных курсов и программ',
    category: 'Продажи',
    price: 17000,
    rentPrice: 3400,
    rating: 4.8,
    users: 540,
    icon: 'GraduationCap',
    features: ['Подбор курсов', 'Рассрочка', 'Консультации']
  },
  {
    id: 7,
    name: 'Риэлтор-помощник',
    description: 'Бот для агентств недвижимости и застройщиков',
    category: 'Продажи',
    price: 22000,
    rentPrice: 4500,
    rating: 4.7,
    users: 430,
    icon: 'Home',
    features: ['База объектов', 'Подбор по критериям', 'Запись на просмотр']
  },
  {
    id: 8,
    name: 'Туристический агент',
    description: 'Продажа туров и бронирование путешествий',
    category: 'Продажи',
    price: 19000,
    rentPrice: 3800,
    rating: 4.9,
    users: 820,
    icon: 'Plane',
    features: ['Подбор туров', 'Виза', 'Страховка']
  },
  {
    id: 9,
    name: 'Автосалон консультант',
    description: 'Продажа автомобилей с тест-драйвами',
    category: 'Продажи',
    price: 25000,
    rentPrice: 5000,
    rating: 4.6,
    users: 380,
    icon: 'Car',
    features: ['Каталог авто', 'Trade-in', 'Кредит и лизинг']
  },
  {
    id: 10,
    name: 'B2B менеджер',
    description: 'Продажи для корпоративных клиентов',
    category: 'Продажи',
    price: 28000,
    rentPrice: 5600,
    rating: 4.8,
    users: 290,
    icon: 'Building2',
    features: ['Договоры', 'Оптовые цены', 'Документооборот']
  },

  // Поддержка (10 ботов)
  {
    id: 11,
    name: 'Клиентская поддержка',
    description: 'Бот для обработки обращений клиентов в Telegram',
    category: 'Поддержка',
    price: 12000,
    rentPrice: 2500,
    rating: 4.9,
    users: 2180,
    icon: 'Headphones',
    features: ['База знаний', 'Умные ответы', 'Эскалация в поддержку']
  },
  {
    id: 12,
    name: 'Техподдержка IT',
    description: 'Помощь пользователям с техническими проблемами',
    category: 'Поддержка',
    price: 15000,
    rentPrice: 3000,
    rating: 4.7,
    users: 1340,
    icon: 'Wrench',
    features: ['Диагностика', 'Инструкции', 'Создание тикетов']
  },
  {
    id: 13,
    name: 'FAQ-помощник',
    description: 'Автоматические ответы на частые вопросы',
    category: 'Поддержка',
    price: 8000,
    rentPrice: 1600,
    rating: 4.8,
    users: 2850,
    icon: 'MessageCircleQuestion',
    features: ['База ответов', 'Поиск', 'Обратная связь']
  },
  {
    id: 14,
    name: 'Возврат товаров',
    description: 'Обработка возвратов и рекламаций',
    category: 'Поддержка',
    price: 10000,
    rentPrice: 2000,
    rating: 4.6,
    users: 980,
    icon: 'PackageX',
    features: ['Оформление возврата', 'Трекинг', 'Компенсации']
  },
  {
    id: 15,
    name: 'Чат модератор',
    description: 'Модерация сообщений в чатах и сообществах',
    category: 'Поддержка',
    price: 9000,
    rentPrice: 1800,
    rating: 4.5,
    users: 1560,
    icon: 'Shield',
    features: ['Фильтр спама', 'Бан пользователей', 'Правила чата']
  },
  {
    id: 16,
    name: 'Жалобы и претензии',
    description: 'Работа с негативными отзывами',
    category: 'Поддержка',
    price: 13000,
    rentPrice: 2600,
    rating: 4.7,
    users: 670,
    icon: 'AlertCircle',
    features: ['Приём жалоб', 'Компенсации', 'Эскалация']
  },
  {
    id: 17,
    name: 'Онбординг клиентов',
    description: 'Обучение новых пользователей продукту',
    category: 'Поддержка',
    price: 11000,
    rentPrice: 2200,
    rating: 4.8,
    users: 1120,
    icon: 'Rocket',
    features: ['Туры по продукту', 'Видео-уроки', 'Чек-листы']
  },
  {
    id: 18,
    name: 'Статус заказа',
    description: 'Отслеживание доставки и статусов',
    category: 'Поддержка',
    price: 7000,
    rentPrice: 1400,
    rating: 4.9,
    users: 3200,
    icon: 'Package',
    features: ['Трекинг', 'Уведомления', 'История заказов']
  },
  {
    id: 19,
    name: 'Служба безопасности',
    description: 'Помощь при блокировке аккаунтов',
    category: 'Поддержка',
    price: 14000,
    rentPrice: 2800,
    rating: 4.6,
    users: 540,
    icon: 'Lock',
    features: ['Восстановление доступа', 'Верификация', '2FA']
  },
  {
    id: 20,
    name: 'Сбор отзывов',
    description: 'Автоматический сбор feedback от клиентов',
    category: 'Поддержка',
    price: 6000,
    rentPrice: 1200,
    rating: 4.7,
    users: 1890,
    icon: 'Star',
    features: ['Опросы NPS', 'Отзывы', 'Аналитика']
  },

  // HR (10 ботов)
  {
    id: 21,
    name: 'HR-ассистент',
    description: 'ИИ-сотрудник для подбора персонала и онбординга',
    category: 'HR',
    price: 20000,
    rentPrice: 4500,
    rating: 4.7,
    users: 680,
    icon: 'Users',
    features: ['Скрининг резюме', 'Интервью', 'Адаптация сотрудников']
  },
  {
    id: 22,
    name: 'Рекрутер',
    description: 'Автоматический поиск и отбор кандидатов',
    category: 'HR',
    price: 22000,
    rentPrice: 4800,
    rating: 4.8,
    users: 520,
    icon: 'UserSearch',
    features: ['Парсинг резюме', 'Интервью', 'Тестирование']
  },
  {
    id: 23,
    name: 'Адаптация новичков',
    description: 'Онбординг новых сотрудников в компании',
    category: 'HR',
    price: 15000,
    rentPrice: 3000,
    rating: 4.9,
    users: 780,
    icon: 'UserPlus',
    features: ['Welcome-пакет', 'Обучение', 'Менторство']
  },
  {
    id: 24,
    name: 'Табель учёта',
    description: 'Контроль рабочего времени сотрудников',
    category: 'HR',
    price: 12000,
    rentPrice: 2400,
    rating: 4.6,
    users: 1340,
    icon: 'Clock',
    features: ['Отметки времени', 'Отпуска', 'Больничные']
  },
  {
    id: 25,
    name: 'Оценка персонала',
    description: 'Проведение аттестаций и оценки 360',
    category: 'HR',
    price: 18000,
    rentPrice: 3600,
    rating: 4.5,
    users: 430,
    icon: 'ClipboardCheck',
    features: ['Опросы', 'KPI', 'Отчёты']
  },
  {
    id: 26,
    name: 'Корпоративное обучение',
    description: 'Организация тренингов и курсов',
    category: 'HR',
    price: 16000,
    rentPrice: 3200,
    rating: 4.7,
    users: 590,
    icon: 'BookOpen',
    features: ['Курсы', 'Тесты', 'Сертификаты']
  },
  {
    id: 27,
    name: 'Helpdesk для HR',
    description: 'Ответы на вопросы сотрудников',
    category: 'HR',
    price: 10000,
    rentPrice: 2000,
    rating: 4.8,
    users: 1120,
    icon: 'HelpCircle',
    features: ['FAQ', 'Документы', 'Справки']
  },
  {
    id: 28,
    name: 'Увольнение сотрудников',
    description: 'Offboarding и выходные интервью',
    category: 'HR',
    price: 11000,
    rentPrice: 2200,
    rating: 4.4,
    users: 290,
    icon: 'UserMinus',
    features: ['Выходное интервью', 'Документы', 'Обратная связь']
  },
  {
    id: 29,
    name: 'Зарплатный помощник',
    description: 'Расчёт и выдача зарплат',
    category: 'HR',
    price: 25000,
    rentPrice: 5000,
    rating: 4.9,
    users: 380,
    icon: 'Wallet',
    features: ['Расчёт ЗП', 'Налоги', 'Платёжки']
  },
  {
    id: 30,
    name: 'Корп культура',
    description: 'Поддержка корпоративной культуры',
    category: 'HR',
    price: 13000,
    rentPrice: 2600,
    rating: 4.6,
    users: 470,
    icon: 'Heart',
    features: ['Мероприятия', 'Опросы', 'Признание']
  },

  // Маркетинг (10 ботов)
  {
    id: 31,
    name: 'Контент-менеджер',
    description: 'Автоматизация публикаций в социальных сетях',
    category: 'Маркетинг',
    price: 18000,
    rentPrice: 3500,
    rating: 4.6,
    users: 950,
    icon: 'Sparkles',
    features: ['Генерация постов', 'Планирование', 'Аналитика']
  },
  {
    id: 32,
    name: 'Email-маркетолог',
    description: 'Автоматические email-рассылки',
    category: 'Маркетинг',
    price: 15000,
    rentPrice: 3000,
    rating: 4.8,
    users: 1230,
    icon: 'Mail',
    features: ['Рассылки', 'Сегментация', 'A/B тесты']
  },
  {
    id: 33,
    name: 'SMM-помощник',
    description: 'Управление соцсетями и контентом',
    category: 'Маркетинг',
    price: 17000,
    rentPrice: 3400,
    rating: 4.7,
    users: 870,
    icon: 'Share2',
    features: ['Кросс-постинг', 'Hashtags', 'Stories']
  },
  {
    id: 34,
    name: 'Реферальная программа',
    description: 'Управление рефералами и бонусами',
    category: 'Маркетинг',
    price: 14000,
    rentPrice: 2800,
    rating: 4.9,
    users: 680,
    icon: 'Gift',
    features: ['Реф-ссылки', 'Бонусы', 'Статистика']
  },
  {
    id: 35,
    name: 'Чат-бот для лендинга',
    description: 'Квиз-боты для сбора лидов',
    category: 'Маркетинг',
    price: 12000,
    rentPrice: 2400,
    rating: 4.5,
    users: 1540,
    icon: 'FileQuestion',
    features: ['Квизы', 'Лид-формы', 'Интеграция']
  },
  {
    id: 36,
    name: 'Конкурсы и розыгрыши',
    description: 'Проведение конкурсов в соцсетях',
    category: 'Маркетинг',
    price: 10000,
    rentPrice: 2000,
    rating: 4.6,
    users: 1890,
    icon: 'Trophy',
    features: ['Механики', 'Выбор победителя', 'Модерация']
  },
  {
    id: 37,
    name: 'Партнёрская программа',
    description: 'Affiliate маркетинг и комиссии',
    category: 'Маркетинг',
    price: 20000,
    rentPrice: 4000,
    rating: 4.7,
    users: 490,
    icon: 'Handshake',
    features: ['Партнёры', 'Комиссии', 'Выплаты']
  },
  {
    id: 38,
    name: 'Аналитик данных',
    description: 'Сбор и анализ маркетинговых метрик',
    category: 'Маркетинг',
    price: 22000,
    rentPrice: 4400,
    rating: 4.8,
    users: 340,
    icon: 'BarChart3',
    features: ['Дашборды', 'ROI', 'Отчёты']
  },
  {
    id: 39,
    name: 'Чат-бот VK',
    description: 'Автоматизация сообщества ВКонтакте',
    category: 'Маркетинг',
    price: 11000,
    rentPrice: 2200,
    rating: 4.6,
    users: 1670,
    icon: 'MessageSquare',
    features: ['Автоответы', 'Рассылки', 'Конкурсы']
  },
  {
    id: 40,
    name: 'Push-уведомления',
    description: 'Отправка push в мобильных приложениях',
    category: 'Маркетинг',
    price: 16000,
    rentPrice: 3200,
    rating: 4.5,
    users: 720,
    icon: 'Bell',
    features: ['Сегменты', 'Триггеры', 'Персонализация']
  },

  // Финансы (10 ботов)
  {
    id: 41,
    name: 'Бухгалтер-помощник',
    description: 'ИИ для автоматизации финансового учета',
    category: 'Финансы',
    price: 25000,
    rentPrice: 5000,
    rating: 4.9,
    users: 520,
    icon: 'Calculator',
    features: ['Учет расходов', 'Отчеты', 'Напоминания']
  },
  {
    id: 42,
    name: 'Инвойс-менеджер',
    description: 'Автоматическое выставление счетов',
    category: 'Финансы',
    price: 18000,
    rentPrice: 3600,
    rating: 4.7,
    users: 890,
    icon: 'FileText',
    features: ['Счета', 'Акты', 'УПД']
  },
  {
    id: 43,
    name: 'Личный финансист',
    description: 'Учёт личных финансов и бюджета',
    category: 'Финансы',
    price: 8000,
    rentPrice: 1600,
    rating: 4.8,
    users: 2340,
    icon: 'PiggyBank',
    features: ['Бюджет', 'Категории', 'Цели']
  },
  {
    id: 44,
    name: 'Налоговый помощник',
    description: 'Расчёт и подача налоговых деклараций',
    category: 'Финансы',
    price: 22000,
    rentPrice: 4400,
    rating: 4.6,
    users: 430,
    icon: 'Receipt',
    features: ['Декларации', 'Вычеты', 'Календарь']
  },
  {
    id: 45,
    name: 'Касса и платежи',
    description: 'Приём онлайн-платежей',
    category: 'Финансы',
    price: 20000,
    rentPrice: 4000,
    rating: 4.9,
    users: 1120,
    icon: 'CreditCard',
    features: ['Оплата картой', 'СБП', 'Чеки']
  },
  {
    id: 46,
    name: 'Долги и кредиты',
    description: 'Учёт задолженностей клиентов',
    category: 'Финансы',
    price: 15000,
    rentPrice: 3000,
    rating: 4.5,
    users: 670,
    icon: 'Banknote',
    features: ['Реестр долгов', 'Напоминания', 'Взыскание']
  },
  {
    id: 47,
    name: 'Криптовалюта',
    description: 'Отслеживание крипто-портфеля',
    category: 'Финансы',
    price: 12000,
    rentPrice: 2400,
    rating: 4.4,
    users: 540,
    icon: 'Bitcoin',
    features: ['Портфель', 'Курсы', 'Алерты']
  },
  {
    id: 48,
    name: 'Финансовый планер',
    description: 'Планирование бюджета компании',
    category: 'Финансы',
    price: 28000,
    rentPrice: 5600,
    rating: 4.8,
    users: 290,
    icon: 'TrendingUp',
    features: ['Прогнозы', 'P&L', 'Cash Flow']
  },
  {
    id: 49,
    name: 'Зарплатная ведомость',
    description: 'Автоматизация выплат сотрудникам',
    category: 'Финансы',
    price: 24000,
    rentPrice: 4800,
    rating: 4.7,
    users: 380,
    icon: 'Wallet',
    features: ['Расчёт ЗП', 'НДФЛ', 'Ведомость']
  },
  {
    id: 50,
    name: 'Инвестиционный советник',
    description: 'Помощь в инвестировании',
    category: 'Финансы',
    price: 30000,
    rentPrice: 6000,
    rating: 4.6,
    users: 210,
    icon: 'LineChart',
    features: ['Портфель', 'Аналитика', 'Рекомендации']
  },

  // Сервис (10 ботов)
  {
    id: 51,
    name: 'Помощник записи',
    description: 'Бот для записи клиентов в салоны красоты и клиники',
    category: 'Сервис',
    price: 10000,
    rentPrice: 2000,
    rating: 4.8,
    users: 1850,
    icon: 'Calendar',
    features: ['Онлайн-запись', 'Напоминания', 'Управление расписанием']
  },
  {
    id: 52,
    name: 'Доставка еды',
    description: 'Приём заказов для ресторанов',
    category: 'Сервис',
    price: 14000,
    rentPrice: 2800,
    rating: 4.9,
    users: 2120,
    icon: 'UtensilsCrossed',
    features: ['Меню', 'Заказы', 'Доставка']
  },
  {
    id: 53,
    name: 'Фитнес-тренер',
    description: 'Персональные тренировки и планы',
    category: 'Сервис',
    price: 12000,
    rentPrice: 2400,
    rating: 4.7,
    users: 980,
    icon: 'Dumbbell',
    features: ['Тренировки', 'Питание', 'Прогресс']
  },
  {
    id: 54,
    name: 'Медицинский помощник',
    description: 'Запись к врачам и напоминания',
    category: 'Сервис',
    price: 16000,
    rentPrice: 3200,
    rating: 4.8,
    users: 1340,
    icon: 'Stethoscope',
    features: ['Запись', 'Анализы', 'Рецепты']
  },
  {
    id: 55,
    name: 'Гостиничный консьерж',
    description: 'Сервис для отелей и гостиниц',
    category: 'Сервис',
    price: 18000,
    rentPrice: 3600,
    rating: 4.6,
    users: 560,
    icon: 'Hotel',
    features: ['Бронирование', 'Room service', 'Check-in']
  },
  {
    id: 56,
    name: 'Служба такси',
    description: 'Заказ такси и курьеров',
    category: 'Сервис',
    price: 15000,
    rentPrice: 3000,
    rating: 4.5,
    users: 1670,
    icon: 'Car',
    features: ['Заказ авто', 'Трекинг', 'Оплата']
  },
  {
    id: 57,
    name: 'Клининг-сервис',
    description: 'Заказ уборки и клининга',
    category: 'Сервис',
    price: 11000,
    rentPrice: 2200,
    rating: 4.7,
    users: 890,
    icon: 'Sparkles',
    features: ['Виды уборки', 'Расписание', 'Оценка']
  },
  {
    id: 58,
    name: 'Ремонтная служба',
    description: 'Вызов мастеров на дом',
    category: 'Сервис',
    price: 13000,
    rentPrice: 2600,
    rating: 4.8,
    users: 740,
    icon: 'Hammer',
    features: ['Мастера', 'Смета', 'Гарантия']
  },
  {
    id: 59,
    name: 'Юридическая помощь',
    description: 'Консультации и документы',
    category: 'Сервис',
    price: 20000,
    rentPrice: 4000,
    rating: 4.6,
    users: 430,
    icon: 'Scale',
    features: ['Консультации', 'Договоры', 'Иски']
  },
  {
    id: 60,
    name: 'Автосервис помощник',
    description: 'Запись на ремонт авто',
    category: 'Сервис',
    price: 12000,
    rentPrice: 2400,
    rating: 4.7,
    users: 1120,
    icon: 'Wrench',
    features: ['Диагностика', 'Запчасти', 'Запись']
  }
];

const categories = ['Все', 'Продажи', 'Поддержка', 'HR', 'Маркетинг', 'Финансы', 'Сервис'];

const BotMarketplace = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const filteredBots = mockBots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || bot.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск ботов и агентов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="transition-all hover:scale-105"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBots.map((bot, index) => (
          <Card 
            key={bot.id} 
            className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-scale-in border-2 hover:border-primary/30"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-3 rounded-xl">
                  <Icon name={bot.icon as any} size={28} className="text-primary" />
                </div>
                <Badge variant="secondary" className="font-medium">
                  {bot.category}
                </Badge>
              </div>
              <CardTitle className="text-xl">{bot.name}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {bot.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{bot.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Icon name="Users" size={16} />
                  <span>{bot.users.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Возможности:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bot.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3 pt-0">
              <div className="w-full flex items-center justify-between text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Покупка</p>
                  <p className="font-bold text-lg">{bot.price.toLocaleString()} ₽</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Аренда/мес</p>
                  <p className="font-semibold text-secondary">{bot.rentPrice.toLocaleString()} ₽</p>
                </div>
              </div>
              <div className="w-full flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/bot/${bot.id}`)}
                >
                  <Icon name="Eye" size={16} className="mr-2" />
                  Подробнее
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  onClick={() => navigate('/pricing')}
                >
                  <Icon name="ShoppingCart" size={16} className="mr-2" />
                  Купить
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredBots.length === 0 && (
        <div className="text-center py-16">
          <Icon name="SearchX" size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
          <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
        </div>
      )}
    </div>
  );
};

export default BotMarketplace;