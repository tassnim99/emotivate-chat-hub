
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, HeartPulse, MessageSquare, VolumeUp } from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) => (
  <div className="p-6 bg-card rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-mindcare-primary/10 text-mindcare-primary mb-4">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Presentation = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <div className="flex gap-2">
              <Link to="/auth">
                <Button variant="outline">Se connecter</Button>
              </Link>
              <Link to="/auth?tab=register">
                <Button>S'inscrire</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-mindcare-light/20 dark:from-background dark:to-mindcare-dark/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Découvrez MindCareAI
          </h1>
          <p className="text-xl mb-10 max-w-3xl mx-auto text-muted-foreground">
            Un assistant intelligent qui vous aide à comprendre et améliorer votre santé mentale avec des conversations personnalisées dans votre langue.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="rounded-full px-8">
                Commencer l'expérience
              </Button>
            </Link>
            <Link to="/home">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center gradient-text">Comment MindCareAI peut vous aider</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={MessageSquare} 
              title="Conversations dans votre langue" 
              description="Discutez avec MindCareAI dans 6 langues différentes : français, anglais, espagnol, italien, allemand et arabe."
            />
            <FeatureCard 
              icon={Brain} 
              title="Intelligence émotionnelle" 
              description="Notre IA comprend vos émotions et adapte ses réponses pour vous offrir un soutien personnalisé."
            />
            <FeatureCard 
              icon={VolumeUp} 
              title="Interaction vocale" 
              description="Communiquez par la voix si vous préférez parler plutôt qu'écrire, pour une expérience plus naturelle."
            />
            <FeatureCard 
              icon={HeartPulse} 
              title="Suivi de votre bien-être" 
              description="Suivez l'évolution de votre état émotionnel au fil du temps avec des analyses personnalisées."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-background to-mindcare-light/20 dark:from-background dark:to-mindcare-dark/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 gradient-text">Prêt à améliorer votre bien-être mental?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            Créez un compte gratuit et commencez votre parcours vers une meilleure santé mentale dès aujourd'hui.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/auth?tab=register">
              <Button size="lg" className="rounded-full px-8">
                Créer un compte gratuit
              </Button>
            </Link>
          </div>
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

export default Presentation;
