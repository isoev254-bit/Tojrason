// Tojrason/frontend/client/src/components/layout/Layout.tsx

import React, { ReactNode, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header/Header';
import Footer from './Footer/Footer';

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Саҳифаҳое, ки Header ва Footer надоранд
  const hideHeaderFooter = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ].some(path => location.pathname.startsWith(path));

  // Тағйири ҳолати скрол барои Header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Бостани менюи мобилӣ ҳангоми тағйири саҳифа
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Қулф кардани скрол ҳангоми кушода будани менюи мобилӣ
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Агар саҳифаи логин ё register бошад, танҳо outlet-ро нишон медиҳем
  if (hideHeaderFooter) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="min-h-screen">
          {children || <Outlet />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        isScrolled={isScrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Content */}
      <main className={`flex-1 pt-16 md:pt-20 ${isMobileMenuOpen ? 'hidden' : 'block'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children || <Outlet />}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

// Компонент барои тугмаи ба боло баргаштан
const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-110"
      aria-label="Ба боло баргаштан"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
};

export default Layout;
