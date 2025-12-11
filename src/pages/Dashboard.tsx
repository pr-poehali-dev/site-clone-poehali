import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService, adminService, User } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await authService.verifyToken();
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    setUser(currentUser);
    
    if (currentUser.isAdmin) {
      loadAdminData();
    }
    setLoading(false);
  };

  const loadAdminData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers()
      ]);
      setStats(statsData);
      setUsers(usersData.users);
    } catch (error: any) {
      toast({ 
        title: "Ошибка загрузки данных", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    toast({ title: "Вы вышли из системы" });
    navigate('/');
  };

  const handleUpdateEnergy = async (userId: number, amount: number) => {
    try {
      await adminService.updateEnergy(userId, amount);
      toast({ title: "Энергия обновлена" });
      loadAdminData();
    } catch (error: any) {
      toast({ 
        title: "Ошибка", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleToggleInfinite = async (userId: number) => {
    try {
      await adminService.toggleInfiniteEnergy(userId);
      toast({ title: "Статус обновлен" });
      loadAdminData();
    } catch (error: any) {
      toast({ 
        title: "Ошибка", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">🚀</div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/30 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl animate-float">🚀</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Уехали
                </h1>
                <p className="text-sm text-muted-foreground">Привет, {user?.username}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Icon name="Home" className="mr-2" size={18} />
                Главная
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <Icon name="LogOut" className="mr-2" size={18} />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="User" className="text-primary" />
                Профиль
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Имя:</strong> {user?.username}</p>
                {user?.isAdmin && (
                  <Badge variant="destructive">Администратор</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Zap" className="text-secondary" />
                Энергия
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {user?.isInfiniteEnergy ? (
                  <>
                    <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                      ∞
                    </div>
                    <p className="text-muted-foreground">Безлимитная энергия</p>
                  </>
                ) : (
                  <>
                    <div className="text-5xl font-bold text-primary mb-2">{user?.energy}</div>
                    <p className="text-muted-foreground">единиц доступно</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Sparkles" className="text-accent" />
                Действия
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full hover-scale mb-3">
                <Icon name="PlusCircle" className="mr-2" size={18} />
                Создать сайт
              </Button>
              <Button variant="outline" className="w-full">
                <Icon name="FolderOpen" className="mr-2" size={18} />
                Мои проекты
              </Button>
            </CardContent>
          </Card>
        </div>

        {user?.isAdmin && stats && (
          <>
            <h2 className="text-3xl font-bold mb-6">Панель администратора</h2>
            
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Пользователей</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Активных сессий</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-secondary">{stats.activeSessions}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Всего энергии</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-accent">{stats.totalEnergy}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Средняя энергия</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">{stats.avgEnergy}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
                <CardDescription>Выдача и списание энергии</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Энергия</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.username}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          {u.isInfiniteEnergy ? '∞' : u.energy}
                        </TableCell>
                        <TableCell>
                          {u.isAdmin && <Badge variant="destructive" className="mr-2">Админ</Badge>}
                          {u.isInfiniteEnergy && <Badge>∞</Badge>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateEnergy(u.id, 50)}
                              disabled={u.isInfiniteEnergy}
                            >
                              +50
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateEnergy(u.id, -50)}
                              disabled={u.isInfiniteEnergy}
                            >
                              -50
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleToggleInfinite(u.id)}
                            >
                              ∞
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
