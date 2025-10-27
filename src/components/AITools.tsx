import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AIToolsProps {
  botId?: number;
}

const AITools = ({ botId }: AIToolsProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [imageUrl, setImageUrl] = useState('');
  const [ocrResult, setOcrResult] = useState('');
  
  const [crmApiKey, setCrmApiKey] = useState('');
  const [crmSubdomain, setCrmSubdomain] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleOCR = async () => {
    if (!imageUrl) {
      toast({
        title: 'Ошибка',
        description: 'Введите URL изображения',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('https://functions.poehali.dev/a696f2e4-4a9d-42e0-b0b3-05ac55b4531f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'ocr',
          image_url: imageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOcrResult(data.text);
        toast({
          title: 'Текст распознан!',
          description: `Извлечено ${data.text.length} символов`,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось распознать текст',
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
      setIsProcessing(false);
    }
  };

  const handleAutoLearn = async () => {
    if (!botId) {
      toast({
        title: 'Ошибка',
        description: 'ID бота не указан',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('https://functions.poehali.dev/a696f2e4-4a9d-42e0-b0b3-05ac55b4531f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'auto_learn',
          bot_id: botId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Автообучение завершено!',
          description: `Добавлено ${data.result.learned} новых примеров из диалогов`,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось выполнить автообучение',
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
      setIsProcessing(false);
    }
  };

  const handleCRMSync = async () => {
    if (!crmApiKey || !crmSubdomain || !contactName) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('https://functions.poehali.dev/a696f2e4-4a9d-42e0-b0b3-05ac55b4531f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'crm_sync',
          api_key: crmApiKey,
          subdomain: crmSubdomain,
          contact: {
            name: contactName,
            phone: contactPhone,
            email: contactEmail,
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Контакт синхронизирован!',
          description: 'Данные успешно отправлены в AmoCRM',
        });
        
        setContactName('');
        setContactPhone('');
        setContactEmail('');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось синхронизировать контакт',
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
      setIsProcessing(false);
    }
  };

  return (
    <Tabs defaultValue="auto-learn" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="auto-learn">
          <Icon name="Brain" size={16} className="mr-2" />
          Автообучение
        </TabsTrigger>
        <TabsTrigger value="crm">
          <Icon name="Users" size={16} className="mr-2" />
          CRM
        </TabsTrigger>
        <TabsTrigger value="ocr">
          <Icon name="FileText" size={16} className="mr-2" />
          OCR
        </TabsTrigger>
      </TabsList>

      <TabsContent value="auto-learn" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Sparkles" size={20} />
              Автоматическое обучение
            </CardTitle>
            <CardDescription>
              Бот анализирует реальные диалоги и автоматически запоминает часто повторяющиеся вопросы
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Как работает автообучение?</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Анализ диалогов за последние 7 дней</li>
                    <li>Поиск повторяющихся вопросов (от 2 раз)</li>
                    <li>Автоматическое добавление в базу знаний</li>
                    <li>Улучшение точности ответов с каждым днём</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button onClick={handleAutoLearn} disabled={isProcessing} className="w-full">
              <Icon name="Play" size={16} className="mr-2" />
              {isProcessing ? 'Обучение...' : 'Запустить автообучение'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="crm" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Database" size={20} />
              Интеграция с AmoCRM
            </CardTitle>
            <CardDescription>
              Синхронизация контактов с CRM системой
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crm-api-key">API ключ AmoCRM</Label>
              <Input
                id="crm-api-key"
                type="password"
                placeholder="Введите API ключ"
                value={crmApiKey}
                onChange={(e) => setCrmApiKey(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm-subdomain">Поддомен</Label>
              <Input
                id="crm-subdomain"
                placeholder="example (для example.amocrm.ru)"
                value={crmSubdomain}
                onChange={(e) => setCrmSubdomain(e.target.value)}
              />
            </div>

            <hr className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="contact-name">Имя контакта</Label>
              <Input
                id="contact-name"
                placeholder="Иван Иванов"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-phone">Телефон</Label>
              <Input
                id="contact-phone"
                placeholder="+7 999 123-45-67"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="ivan@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <Button onClick={handleCRMSync} disabled={isProcessing} className="w-full">
              <Icon name="Upload" size={16} className="mr-2" />
              {isProcessing ? 'Синхронизация...' : 'Синхронизировать контакт'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ocr" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ScanText" size={20} />
              Распознавание текста (OCR)
            </CardTitle>
            <CardDescription>
              Извлечение текста из изображений и документов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL изображения</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Поддерживаются форматы: JPG, PNG, PDF. Бесплатный OCR.space API.
              </p>
            </div>

            <Button onClick={handleOCR} disabled={isProcessing} className="w-full">
              <Icon name="Scan" size={16} className="mr-2" />
              {isProcessing ? 'Распознавание...' : 'Распознать текст'}
            </Button>

            {ocrResult && (
              <div className="space-y-2">
                <Label>Результат распознавания</Label>
                <Textarea
                  value={ocrResult}
                  readOnly
                  rows={10}
                  className="font-mono text-sm"
                />
                <Badge variant="secondary">{ocrResult.length} символов</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AITools;
