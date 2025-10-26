import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import BotMarketplace from '@/components/BotMarketplace';
import BotConstructor from '@/components/BotConstructor';
import MyBots from '@/components/MyBots';
import BotTester from '@/components/BotTester';

const Index = () => {
  const [activeTab, setActiveTab] = useState('marketplace');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-secondary p-2.5 rounded-xl">
                <Icon name="Bot" className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  BotPlatform
                </h1>
                <p className="text-xs text-muted-foreground">Платформа для создания ИИ-агентов</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Icon name="Bell" size={18} className="mr-2" />
                <span className="hidden lg:inline">Уведомления</span>
              </Button>
              <Button variant="outline" size="sm">
                <Icon name="User" size={18} className="md:mr-2" />
                <span className="hidden md:inline">Профиль</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 md:mb-8 animate-fade-in">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Создавайте умных ботов за минуты
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mb-6">
            Платформа для разработки чат-ботов, ИИ-агентов и ИИ-сотрудников для социальных сетей и бизнеса
          </p>
          <BotTester />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 h-auto p-1">
            <TabsTrigger value="marketplace" className="flex items-center gap-1 md:gap-2 py-2 md:py-3 text-xs md:text-sm">
              <Icon name="Store" size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Маркетплейс</span>
              <span className="sm:hidden">Магазин</span>
            </TabsTrigger>
            <TabsTrigger value="constructor" className="flex items-center gap-1 md:gap-2 py-2 md:py-3 text-xs md:text-sm">
              <Icon name="Boxes" size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Конструктор</span>
              <span className="sm:hidden">Создать</span>
            </TabsTrigger>
            <TabsTrigger value="my-bots" className="flex items-center gap-1 md:gap-2 py-2 md:py-3 text-xs md:text-sm">
              <Icon name="Folder" size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Мои боты</span>
              <span className="sm:hidden">Мои</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="animate-fade-in">
            <BotMarketplace />
          </TabsContent>

          <TabsContent value="constructor" className="animate-fade-in">
            <BotConstructor />
          </TabsContent>

          <TabsContent value="my-bots" className="animate-fade-in">
            <MyBots />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-white/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs md:text-sm text-muted-foreground">
            <p className="text-center md:text-left">© 2024 BotPlatform. Все права защищены.</p>
            <div className="flex gap-3 md:gap-4">
              <a href="#" className="hover:text-primary transition-colors">Помощь</a>
              <a href="#" className="hover:text-primary transition-colors">Документация</a>
              <a href="#" className="hover:text-primary transition-colors">Контакты</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;