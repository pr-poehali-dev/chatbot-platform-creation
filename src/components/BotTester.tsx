import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const BotTester = () => {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-green-500">
            <Icon name="CheckCircle" size={24} className="text-white" />
          </div>
          <div>
            <CardTitle className="text-lg md:text-xl text-green-900">
              Бот работает! 🎉
            </CardTitle>
            <CardDescription className="text-green-700">
              Все 4 активных бота отвечают на сообщения
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Icon name="MessageSquare" size={16} className="text-green-600" />
            Как протестировать бота:
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Откройте Telegram и найдите бота <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">@helplide_bot</code></li>
            <li>Нажмите "Start" или напишите <code className="bg-gray-100 px-2 py-0.5 rounded">/start</code></li>
            <li>Попробуйте разные команды:</li>
          </ol>
          
          <div className="ml-6 space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Icon name="ArrowRight" size={14} className="mt-1 text-green-600" />
              <div>
                <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-800">Привет</code>
                <span className="text-gray-600 ml-2">- приветствие</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="ArrowRight" size={14} className="mt-1 text-green-600" />
              <div>
                <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-800">Тарифы</code>
                <span className="text-gray-600 ml-2">- цены на услуги</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="ArrowRight" size={14} className="mt-1 text-green-600" />
              <div>
                <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-800">Помощь</code>
                <span className="text-gray-600 ml-2">- список команд</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="ArrowRight" size={14} className="mt-1 text-green-600" />
              <div>
                <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-800">Контакты</code>
                <span className="text-gray-600 ml-2">- связь с нами</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="Zap" size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-purple-900 mb-1">Автоответы включены</p>
              <p className="text-purple-800">
                Бот автоматически отвечает на популярные вопросы 24/7. 
                Все сообщения сохраняются в базе данных для аналитики.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-500">4 активных бота</Badge>
          <Badge variant="outline">Webhook настроен</Badge>
          <Badge variant="outline">БД подключена</Badge>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2 text-xs text-blue-800">
            <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" />
            <p>
              <strong>Webhook URL:</strong> <code className="bg-blue-100 px-1 rounded">https://functions.poehali.dev/28e4e6a0-60c6-42fa-9b4c-b40df0a1762e</code>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotTester;
