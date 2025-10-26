import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const TelegramIntegration = () => {
  const { toast } = useToast();
  const [chatId, setChatId] = useState('');
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [botInfo, setBotInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://functions.poehali.dev/5b77f8c6-c939-4ae9-bd61-e94167dce816';

  const handleCheckConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_bot_info'
        })
      });

      const data = await response.json();
      
      if (data.success && data.bot) {
        setIsConnected(true);
        setBotInfo(data.bot);
        toast({
          title: 'Бот подключен!',
          description: `@${data.bot.username} готов к работе`,
        });
      } else {
        toast({
          title: 'Ошибка подключения',
          description: data.error || 'Не удалось подключиться к боту',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проверьте, что токен добавлен в настройках проекта',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetupWebhook = async () => {
    setLoading(true);
    const webhookUrl = 'https://functions.poehali.dev/28e4e6a0-60c6-42fa-9b4c-b40df0a1762e';
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set_webhook',
          webhook_url: webhookUrl
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Webhook настроен!',
          description: 'Бот теперь получает сообщения и отвечает автоматически',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось настроить webhook',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с настройкой webhook',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatId || !message) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_message',
          chat_id: chatId,
          text: message
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Сообщение отправлено!',
          description: 'Проверьте Telegram',
        });
        setMessage('');
      } else {
        toast({
          title: 'Ошибка отправки',
          description: data.error || 'Не удалось отправить сообщение',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проверьте подключение',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <Icon name="Send" size={24} className="text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg md:text-xl">Telegram Bot API</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Подключение к Telegram боту
                </CardDescription>
              </div>
            </div>
            {isConnected ? (
              <Badge className="bg-green-500">Подключено</Badge>
            ) : (
              <Badge variant="outline">Не подключено</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                <div className="flex gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-xs md:text-sm">
                    <p className="font-semibold text-blue-900">Как создать бота:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800">
                      <li>Откройте Telegram и найдите <code className="bg-blue-100 px-1 rounded">@BotFather</code></li>
                      <li>Отправьте команду <code className="bg-blue-100 px-1 rounded">/newbot</code></li>
                      <li>Следуйте инструкциям для создания бота</li>
                      <li>Скопируйте полученный токен</li>
                      <li>Добавьте токен в секреты проекта (см. выше)</li>
                    </ol>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCheckConnection} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Icon name="CheckCircle" size={18} className="mr-2" />
                    Проверить подключение
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {botInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="font-semibold text-green-900">Бот подключен:</p>
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Имя:</span> {botInfo.first_name}
                      </p>
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Username:</span> @{botInfo.username}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 md:p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Icon name="Zap" size={20} className="text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-purple-900">Автоответы включены!</p>
                    <p className="text-sm text-purple-800 mt-1">
                      Настройте webhook для автоматических ответов на сообщения пользователей
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleSetupWebhook} 
                  disabled={loading}
                  variant="outline"
                  className="w-full border-purple-300 hover:bg-purple-100"
                >
                  {loading ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Настройка...
                    </>
                  ) : (
                    <>
                      <Icon name="Link" size={18} className="mr-2" />
                      Настроить Webhook
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Тестовая отправка сообщения</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="chat-id" className="text-xs md:text-sm">
                    Chat ID получателя
                  </Label>
                  <Input
                    id="chat-id"
                    placeholder="Ваш Telegram ID"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Узнать свой Chat ID можно у бота <code className="bg-muted px-1 rounded">@userinfobot</code>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs md:text-sm">Сообщение</Label>
                  <Input
                    id="message"
                    placeholder="Привет из BotPlatform!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <Button 
                  onClick={handleSendMessage} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={18} className="mr-2" />
                      Отправить тестовое сообщение
                    </>
                  )}
                </Button>
              </div>

              <Button 
                variant="outline" 
                onClick={() => {
                  setIsConnected(false);
                  setBotInfo(null);
                }}
                className="w-full"
              >
                <Icon name="RefreshCw" size={18} className="mr-2" />
                Переподключить
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramIntegration;