import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface BotTrainingProps {
  botId?: number;
}

interface TrainingExample {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

const BotTraining = ({ botId }: BotTrainingProps) => {
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [examples, setExamples] = useState<TrainingExample[]>([
    { id: 1, question: 'Привет', answer: 'Здравствуйте! Чем могу помочь?', category: 'greeting' },
    { id: 2, question: 'Какие цены', answer: 'Наши цены начинаются от 2000₽', category: 'pricing' },
    { id: 3, question: 'Как связаться', answer: 'Напишите нам на support@example.com', category: 'contact' },
  ]);

  const handleTrain = async () => {
    if (!question || !answer) {
      toast({
        title: 'Ошибка',
        description: 'Заполните вопрос и ответ',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/23f5dcaf-616d-4957-922d-ef9968ec1662', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: botId,
          message: question,
          answer: answer,
          learn: true,
        }),
      });

      const data = await response.json();

      if (response.ok && data.learned) {
        toast({
          title: 'Успешно обучен!',
          description: 'Бот запомнил новый пример',
        });

        setExamples([
          ...examples,
          {
            id: Date.now(),
            question,
            answer,
            category: category || 'custom',
          },
        ]);

        setQuestion('');
        setAnswer('');
        setCategory('');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обучить бота',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!question) {
      toast({
        title: 'Ошибка',
        description: 'Введите вопрос для тестирования',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/23f5dcaf-616d-4957-922d-ef9968ec1662', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: botId,
          message: question,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAnswer(data.content);
        toast({
          title: 'Ответ получен',
          description: `Уверенность: ${data.confidence === 'high' ? 'высокая' : 'низкая'}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить ответ',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Brain" size={20} />
            Обучение бота
          </CardTitle>
          <CardDescription>
            Научите бота отвечать на вопросы на примерах
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Как работает обучение?</p>
                <p className="text-xs">
                  Бот использует алгоритм TF-IDF для поиска похожих вопросов. 
                  Чем больше примеров вы добавите, тем точнее будут ответы.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Вопрос пользователя</Label>
            <Input
              id="question"
              placeholder="Например: Сколько стоит доставка?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Ответ бота</Label>
            <Textarea
              id="answer"
              placeholder="Например: Доставка по городу бесплатная при заказе от 1000₽"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Категория (опционально)</Label>
            <Input
              id="category"
              placeholder="Например: delivery, pricing"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleTrain} 
              disabled={isLoading}
              className="flex-1"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              {isLoading ? 'Обучение...' : 'Добавить пример'}
            </Button>
            <Button 
              onClick={handleTest} 
              variant="outline"
              disabled={isLoading}
            >
              <Icon name="TestTube" size={16} className="mr-2" />
              Тест
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BookOpen" size={20} />
            Примеры обучения ({examples.length})
          </CardTitle>
          <CardDescription>
            База знаний вашего бота
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {examples.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Brain" size={48} className="mx-auto mb-2 opacity-20" />
                <p>Пока нет примеров обучения</p>
              </div>
            ) : (
              examples.map((example) => (
                <div
                  key={example.id}
                  className="border rounded-lg p-4 space-y-2 hover:bg-gray-50 transition-colors"
                >
                  {example.category && (
                    <Badge variant="secondary" className="text-xs mb-2">
                      {example.category}
                    </Badge>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-start gap-2">
                      <Icon name="MessageSquare" size={14} className="mt-1 flex-shrink-0" />
                      {example.question}
                    </p>
                  </div>
                  <div className="pl-6">
                    <p className="text-sm text-gray-600">
                      → {example.answer}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BotTraining;
