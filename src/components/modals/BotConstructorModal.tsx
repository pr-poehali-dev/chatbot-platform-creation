import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface BotConstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BotConstructorModal({ isOpen, onClose }: BotConstructorModalProps) {
  const [step, setStep] = useState(1);
  const [botData, setBotData] = useState({
    name: '',
    category: '',
    description: '',
    personality: 'professional',
    knowledge: '',
    triggers: [] as string[],
  });

  const [currentTrigger, setCurrentTrigger] = useState('');

  const addTrigger = () => {
    if (currentTrigger.trim()) {
      setBotData({ ...botData, triggers: [...botData.triggers, currentTrigger.trim()] });
      setCurrentTrigger('');
    }
  };

  const removeTrigger = (index: number) => {
    setBotData({ ...botData, triggers: botData.triggers.filter((_, i) => i !== index) });
  };

  const handleCreate = () => {
    alert('Бот успешно создан!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Sparkles" size={24} />
            Конструктор чат-ботов
          </DialogTitle>
          <DialogDescription>
            Создайте своего уникального чат-бота за 4 простых шага
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`flex-1 h-2 rounded-full ${
                step >= num ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Шаг 1: Основная информация</h3>
            
            <div className="space-y-2">
              <Label htmlFor="bot-name">Название бота *</Label>
              <Input
                id="bot-name"
                placeholder="Например: Помощник по продажам"
                value={botData.name}
                onChange={(e) => setBotData({ ...botData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория *</Label>
              <Select value={botData.category} onValueChange={(value) => setBotData({ ...botData, category: value })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Продажи</SelectItem>
                  <SelectItem value="support">Поддержка клиентов</SelectItem>
                  <SelectItem value="hr">HR и рекрутинг</SelectItem>
                  <SelectItem value="marketing">Маркетинг</SelectItem>
                  <SelectItem value="finance">Финансы</SelectItem>
                  <SelectItem value="service">Сервис</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание бота *</Label>
              <Textarea
                id="description"
                placeholder="Опишите, что будет делать ваш бот..."
                value={botData.description}
                onChange={(e) => setBotData({ ...botData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Шаг 2: Личность и стиль</h3>
            
            <div className="space-y-2">
              <Label>Выберите стиль общения</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'professional', label: 'Профессиональный', icon: 'Briefcase', desc: 'Деловой и официальный' },
                  { value: 'friendly', label: 'Дружелюбный', icon: 'Smile', desc: 'Тёплый и приветливый' },
                  { value: 'casual', label: 'Неформальный', icon: 'MessageCircle', desc: 'Расслабленный и простой' },
                  { value: 'expert', label: 'Эксперт', icon: 'GraduationCap', desc: 'Технический и детальный' },
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setBotData({ ...botData, personality: style.value })}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      botData.personality === style.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon name={style.icon as any} size={24} className="text-primary" />
                      <div>
                        <div className="font-semibold">{style.label}</div>
                        <div className="text-xs text-muted-foreground">{style.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <Icon name="Info" size={16} className="inline mr-2" />
                Стиль общения влияет на формулировки и тон ответов бота
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Шаг 3: База знаний</h3>
            
            <div className="space-y-2">
              <Label htmlFor="knowledge">Загрузите знания для бота</Label>
              <Textarea
                id="knowledge"
                placeholder="Вставьте текст, который бот должен знать: информацию о продуктах, услугах, FAQ и т.д."
                value={botData.knowledge}
                onChange={(e) => setBotData({ ...botData, knowledge: e.target.value })}
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label>Или загрузите файлы</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="justify-start">
                  <Icon name="FileText" size={16} className="mr-2" />
                  PDF
                </Button>
                <Button variant="outline" className="justify-start">
                  <Icon name="FileSpreadsheet" size={16} className="mr-2" />
                  Excel
                </Button>
                <Button variant="outline" className="justify-start">
                  <Icon name="FileType" size={16} className="mr-2" />
                  Word
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Шаг 4: Триггеры и команды</h3>
            
            <div className="space-y-2">
              <Label>Добавьте ключевые фразы для активации</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Например: привет, здравствуйте, помощь"
                  value={currentTrigger}
                  onChange={(e) => setCurrentTrigger(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTrigger()}
                />
                <Button onClick={addTrigger} variant="outline">
                  <Icon name="Plus" size={16} />
                </Button>
              </div>
            </div>

            {botData.triggers.length > 0 && (
              <div className="space-y-2">
                <Label>Добавленные триггеры</Label>
                <div className="flex flex-wrap gap-2">
                  {botData.triggers.map((trigger, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full"
                    >
                      <span className="text-sm">{trigger}</span>
                      <button
                        onClick={() => removeTrigger(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Icon name="Eye" size={16} />
                Предпросмотр бота
              </h4>
              <div className="p-3 bg-background rounded border">
                <p className="text-sm"><strong>Название:</strong> {botData.name || 'Не указано'}</p>
                <p className="text-sm"><strong>Категория:</strong> {botData.category || 'Не выбрано'}</p>
                <p className="text-sm"><strong>Стиль:</strong> {botData.personality}</p>
                <p className="text-sm"><strong>Триггеров:</strong> {botData.triggers.length}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <Icon name="ChevronLeft" size={16} className="mr-2" />
              Назад
            </Button>
          )}
          
          <Button variant="outline" onClick={onClose} className="ml-auto">
            Отмена
          </Button>

          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)}>
              Далее
              <Icon name="ChevronRight" size={16} className="ml-2" />
            </Button>
          ) : (
            <Button onClick={handleCreate}>
              <Icon name="Sparkles" size={16} className="mr-2" />
              Создать бота
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}