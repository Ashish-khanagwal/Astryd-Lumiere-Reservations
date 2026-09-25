import React, { useState, useEffect } from 'react';
import { usePageContent } from '../context/usePageContent';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const label = usePageContent('global').text('scrollTopLabel');

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility();

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
      aria-label={label}
      title={label}
      className="fixed bottom-8 right-8 z-50 p-3.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary border border-outline-variant/40 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:bg-primary hover:text-on-primary hover:border-primary hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer flex items-center justify-center"
    >
      <span className="material-symbols-outlined text-2xl group-hover:-translate-y-0.5 transition-transform">
        keyboard_arrow_up
      </span>
    </button>
  );
};
