
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Brain, HeartPulse, Activity } from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useAuthStore } from '@/services/authService';

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="p-6 bg-card rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-mindcare-primary/10 text-mindcare-primary mb-4">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Home = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            {user ? (
              <Link to="/chat">
                <Button>Accéder au Chat</Button>
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link to="/auth">
                  <Button variant="outline">Se connecter</Button>
                </Link>
                <Link to="/auth?tab=register">
                  <Button>S'inscrire</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-mindcare-light/20 dark:from-background dark:to-mindcare-dark/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Prenez soin de votre santé mentale
          </h1>
          <p className="text-xl mb-10 max-w-3xl mx-auto text-muted-foreground">
            MindCareAI est votre assistant personnel de bien-être qui vous aide à comprendre et améliorer votre santé mentale grâce à des conversations empathiques et des analyses émotionnelles en temps réel.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={user ? "/chat" : "/auth"}>
              <Button size="lg" className="rounded-full px-8">
                Commencer maintenant
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-full px-8">
              En savoir plus
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Fonctionnalités principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={MessageSquare} 
              title="Chat intelligent" 
              description="Discutez avec notre IA qui comprend vos émotions et vous offre un soutien adapté à vos besoins."
            />
            <FeatureCard 
              icon={Brain} 
              title="Analyses émotionnelles" 
              description="Obtenez des insights sur votre état émotionnel grâce à l'analyse de vos conversations textuelles et vocales."
            />
            <FeatureCard 
              icon={HeartPulse} 
              title="Suivi du bien-être" 
              description="Suivez vos progrès au fil du temps et identifiez les facteurs qui influencent votre bien-être mental."
            />
            <FeatureCard 
              icon={Activity} 
              title="Ressources personnalisées" 
              description="Recevez des recommandations et des exercices adaptés à vos besoins spécifiques."
            />
          </div>
        </div>
      </section>

      {/* Testimonials or additional info */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Votre bien-être est notre priorité</h2>
          <p className="text-xl max-w-3xl mx-auto text-muted-foreground mb-8">
            MindCareAI est là pour vous accompagner dans votre parcours de bien-être mental, où que vous soyez et quand vous en avez besoin.
          </p>
          <Link to={user ? "/chat" : "/auth"}>
            <Button size="lg" className="rounded-full px-8">
              Commencer maintenant
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <Logo size="sm" className="mx-auto mb-4" />
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} MindCareAI. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
