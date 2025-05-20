
import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Logo from '@/components/Logo';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-mindcare-light to-white dark:from-mindcare-dark dark:to-mindcare-dark p-4">
      <div className="w-full max-w-md mb-8 flex justify-center">
        <Logo size="lg" />
      </div>
      
      <div className="w-full max-w-md mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold gradient-text">
            Mental Wellness Support
          </h1>
          <p className="text-muted-foreground mt-2">
            Your AI companion for emotional support and mental health guidance
          </p>
        </div>

        {isLogin ? (
          <LoginForm onToggleForm={toggleForm} />
        ) : (
          <RegisterForm onToggleForm={toggleForm} />
        )}
      </div>

      <div className="w-full max-w-md mt-8">
        <p className="text-center text-sm text-muted-foreground">
          MindCareAI provides support, not medical advice. If you're experiencing a crisis,
          please seek professional help immediately.
        </p>
      </div>
    </div>
  );
};

export default Auth;
