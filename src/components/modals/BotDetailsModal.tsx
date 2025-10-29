import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Bot } from '../marketplace/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getBotDetails } from '../marketplace/botDescriptions';

interface BotDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot?: Bot;
}

export default function BotDetailsModal({ isOpen, onClose, bot }: BotDetailsModalProps) {
  if (!bot) return null;

  const details = getBotDetails(bot.id);
  const fullDescription = bot.fullDescription || details.fullDescription;
  const functionality = bot.functionality || details.functionality;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-3 rounded-xl">
              <Icon name={bot.icon as any} className="text-primary" size={32} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{bot.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{bot.category}</Badge>
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">{bot.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Icon name="Users" size={14} />
                  <span className="text-sm">{bot.users.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogDescription className="text-base">
            {bot.description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="FileText" size={20} className="text-primary" />
                Полное описание
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {fullDescription}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="Zap" size={20} className="text-primary" />
                Основные возможности
              </h3>
              <div className="flex flex-wrap gap-2">
                {bot.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-sm py-1.5">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="ListChecks" size={20} className="text-primary" />
                Функционал бота
              </h3>
              <ul className="space-y-2">
                {functionality.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <Icon name="CheckCircle2" size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="DollarSign" size={20} className="text-primary" />
                Стоимость
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Покупка</p>
                  <p className="text-2xl font-bold text-primary">
                    {bot.price.toLocaleString()} ₽
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Разовый платеж</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Аренда</p>
                  <p className="text-2xl font-bold text-secondary">
                    {bot.rentPrice.toLocaleString()} ₽
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">В месяц</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Закрыть
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-primary to-secondary">
            <Icon name="ShoppingCart" size={16} className="mr-2" />
            Перейти к покупке
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}