import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, onLogin }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Public Header */}
      <Header onLogin={onLogin} />
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Public Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
