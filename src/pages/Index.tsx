import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Сообщение отправлено!",
      description: "Мы свяжемся с вами в ближайшее время.",
    });
    setFormData({ name: '', email: '', message: '' });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-3xl animate-float">🚀</div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Уехали
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {['home', 'team', 'services', 'portfolio', 'blog', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {section === 'home' && 'Главная'}
                  {section === 'team' && 'О команде'}
                  {section === 'services' && 'Услуги'}
                  {section === 'portfolio' && 'Портфолио'}
                  {section === 'blog' && 'Блог'}
                  {section === 'contact' && 'Контакты'}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://inferno-client-clone--preview.poehali.dev/', '_blank')}
                className="hover-scale"
              >
                Проект 1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://inferno-client-clone--preview.poehali.dev/', '_blank')}
                className="hover-scale"
              >
                Проект 2
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/auth')}
                className="hover-scale"
              >
                <Icon name="LogIn" className="mr-2" size={16} />
                Войти
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <section id="home" className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Уехали в космос
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Создаем сайты, которые выводят ваш бизнес на орбиту. Разработка, дизайн и поддержка веб-проектов любой сложности.
            </p>
            <Button size="lg" className="hover-scale text-lg px-8 py-6" onClick={() => scrollToSection('contact')}>
              Начать проект
              <Icon name="Rocket" className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </section>

      <section id="team" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 animate-fade-in">О команде</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: 'Users', title: 'Опытная команда', desc: 'Более 50 успешных проектов за плечами' },
              { icon: 'Zap', title: 'Быстрая разработка', desc: 'Запускаем MVP за 2-3 недели' },
              { icon: 'Shield', title: 'Надежность', desc: 'Гарантия качества и поддержка 24/7' }
            ].map((item, i) => (
              <Card key={i} className="hover-scale bg-card border-border">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <Icon name={item.icon as any} size={32} className="text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 animate-fade-in">Услуги</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: 'Code', title: 'Веб-разработка', desc: 'Создание сайтов и веб-приложений на современных технологиях' },
              { icon: 'Palette', title: 'UI/UX Дизайн', desc: 'Разработка уникального дизайна с фокусом на пользователя' },
              { icon: 'Smartphone', title: 'Мобильные приложения', desc: 'Нативные и кроссплатформенные решения' },
              { icon: 'ShoppingCart', title: 'E-commerce', desc: 'Интернет-магазины с полной интеграцией' },
              { icon: 'Search', title: 'SEO оптимизация', desc: 'Продвижение в поисковых системах' },
              { icon: 'BarChart3', title: 'Аналитика', desc: 'Настройка систем аналитики и отчетности' }
            ].map((service, i) => (
              <Card key={i} className="hover-scale bg-card border-border">
                <CardHeader>
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-3">
                    <Icon name={service.icon as any} size={24} className="text-secondary" />
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{service.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 animate-fade-in">Портфолио</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="hover-scale overflow-hidden bg-card border-border">
                <div className="h-48 bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                  <Icon name="Image" size={64} className="text-primary/50" />
                </div>
                <CardHeader>
                  <CardTitle>Проект #{item}</CardTitle>
                  <CardDescription>Успешный запуск веб-приложения</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 animate-fade-in">Блог</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { title: 'Тренды веб-разработки 2025', date: '10 декабря 2025', icon: 'TrendingUp' },
              { title: 'Как выбрать технологический стек', date: '5 декабря 2025', icon: 'Layers' },
              { title: 'Оптимизация производительности', date: '1 декабря 2025', icon: 'Gauge' }
            ].map((post, i) => (
              <Card key={i} className="hover-scale bg-card border-border cursor-pointer">
                <CardHeader>
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mb-3">
                    <Icon name={post.icon as any} size={20} className="text-accent" />
                  </div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription>{post.date}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-5xl font-bold text-center mb-16 animate-fade-in">Контакты</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Send" className="text-primary" />
                  Telegram
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a 
                  href="https://t.me/FreeWebCreator" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-primary hover:text-secondary transition-colors"
                >
                  Канал: @FreeWebCreator
                </a>
                <a 
                  href="https://t.me/+pJ_2ss_PeTplYzgy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-primary hover:text-secondary transition-colors"
                >
                  Секретный чат 🔒
                </a>
                <a 
                  href="https://t.me/InfernoClient" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-primary hover:text-secondary transition-colors"
                >
                  Связь: @InfernoClient
                </a>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MessageSquare" className="text-secondary" />
                  Форма связи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Заполните форму ниже, и мы свяжемся с вами в течение 24 часов
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Отправить сообщение</CardTitle>
              <CardDescription>Расскажите о вашем проекте</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Расскажите о вашем проекте..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="bg-background"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full hover-scale">
                  Отправить сообщение
                  <Icon name="Send" className="ml-2" size={18} />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="text-2xl">🚀</div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Уехали
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2025 Уехали. Создаем будущее вместе с вами
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;