import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', username: '', password: '', confirmPassword: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authService.login(loginData.email, loginData.password);
      toast({ title: "Добро пожаловать!", description: "Вы успешно вошли в систему" });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ 
        title: "Ошибка входа", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({ 
        title: "Ошибка", 
        description: "Пароли не совпадают",
        variant: "destructive" 
      });
      return;
    }
    
    setLoading(true);
    try {
      await authService.register(registerData.email, registerData.username, registerData.password);
      toast({ 
        title: "Регистрация успешна!", 
        description: "Вам начислено 100 единиц энергии" 
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ 
        title: "Ошибка регистрации", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="text-5xl animate-float">🚀</div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Уехали
          </h1>
          <p className="text-muted-foreground">Создавайте будущее вместе с нами</p>
        </div>

        <Card className="bg-card border-border animate-fade-in">
          <CardHeader>
            <CardTitle>Вход в систему</CardTitle>
            <CardDescription>Войдите или создайте новый аккаунт</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Пароль"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="bg-background"
                    />
                  </div>
                  <Button type="submit" className="w-full hover-scale" disabled={loading}>
                    {loading ? 'Загрузка...' : 'Войти'}
                    <Icon name="LogIn" className="ml-2" size={18} />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Имя пользователя"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Пароль (минимум 6 символов)"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      minLength={6}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Подтвердите пароль"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                      className="bg-background"
                    />
                  </div>
                  <Button type="submit" className="w-full hover-scale" disabled={loading}>
                    {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                    <Icon name="UserPlus" className="ml-2" size={18} />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" className="mr-2" size={18} />
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
