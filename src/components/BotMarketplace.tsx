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
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
    name: 'Помощник записи',
    description: 'Бот для записи клиентов в салоны красоты и клиники',
    category: 'Сервис',
    price: 10000,
    rentPrice: 2000,
    rating: 4.8,
    users: 1850,
    icon: 'Calendar',
    features: ['Онлайн-запись', 'Напоминания', 'Управление расписанием']
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