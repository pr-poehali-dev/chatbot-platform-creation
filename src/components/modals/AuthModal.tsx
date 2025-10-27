import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = (method: string) => {
    alert(`Авторизация через ${method}`);
    onClose();
  };

  const handleEmailAuth = () => {
    alert('Письмо с подтверждением отправлено на ' + email);
    onClose();
  };

  const handlePhoneAuth = () => {
    alert('SMS с кодом отправлен на ' + phone);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="User" size={24} />
            Вход в аккаунт
          </DialogTitle>
          <DialogDescription>
            Войдите или зарегистрируйтесь для продолжения
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={authMethod === 'email' ? 'default' : 'outline'}
                  onClick={() => setAuthMethod('email')}
                  className="flex-1"
                >
                  <Icon name="Mail" size={16} className="mr-2" />
                  Email
                </Button>
                <Button
                  variant={authMethod === 'phone' ? 'default' : 'outline'}
                  onClick={() => setAuthMethod('phone')}
                  className="flex-1"
                >
                  <Icon name="Smartphone" size={16} className="mr-2" />
                  Телефон
                </Button>
              </div>

              {authMethod === 'email' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Пароль</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="login-phone">Номер телефона</Label>
                    <Input
                      id="login-phone"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Мы отправим SMS с кодом подтверждения
                  </p>
                </>
              )}

              <Button 
                onClick={authMethod === 'email' ? handleEmailAuth : handlePhoneAuth}
                className="w-full"
                disabled={authMethod === 'email' ? !email || !password : !phone}
              >
                <Icon name="LogIn" size={16} className="mr-2" />
                Войти
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Или войти через
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAuth('Google')}
                  className="w-full"
                >
                  <Icon name="Chrome" size={20} />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAuth('Яндекс')}
                  className="w-full"
                >
                  <span className="font-bold text-lg">Я</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAuth('VK')}
                  className="w-full"
                >
                  <Icon name="MessageCircle" size={20} />
                </Button>
              </div>

              <Button
                variant="link"
                className="w-full text-sm"
                onClick={() => alert('Ссылка для восстановления отправлена')}
              >
                Забыли пароль?
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Имя</Label>
                <Input
                  id="reg-name"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={authMethod === 'email' ? 'default' : 'outline'}
                  onClick={() => setAuthMethod('email')}
                  className="flex-1"
                >
                  <Icon name="Mail" size={16} className="mr-2" />
                  Email
                </Button>
                <Button
                  variant={authMethod === 'phone' ? 'default' : 'outline'}
                  onClick={() => setAuthMethod('phone')}
                  className="flex-1"
                >
                  <Icon name="Smartphone" size={16} className="mr-2" />
                  Телефон
                </Button>
              </div>

              {authMethod === 'email' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Пароль</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Минимум 8 символов"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Номер телефона</Label>
                  <Input
                    id="reg-phone"
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              )}

              <Button 
                onClick={authMethod === 'email' ? handleEmailAuth : handlePhoneAuth}
                className="w-full"
                disabled={!name || (authMethod === 'email' ? !email || !password : !phone)}
              >
                <Icon name="UserPlus" size={16} className="mr-2" />
                Зарегистрироваться
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Или через соцсети
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAuth('Google')}
                  className="w-full"
                >
                  <Icon name="Chrome" size={20} />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAuth('Яндекс')}
                  className="w-full"
                >
                  <span className="font-bold text-lg">Я</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAuth('VK')}
                  className="w-full"
                >
                  <Icon name="MessageCircle" size={20} />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Регистрируясь, вы соглашаетесь с{' '}
                <a href="#" className="underline">условиями использования</a>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
