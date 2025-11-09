import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import ChatPage from './components/ChatPage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="h-screen bg-slate-100 dark:bg-slate-900 font-sans">
      {isLoggedIn ? (
        <ChatPage onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
