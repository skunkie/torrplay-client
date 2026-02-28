'use client';

import { ArrowDown,ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from './button';

export function ScrollButtons() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showBackToBottom, setShowBackToBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Show Back to Top button
      setShowBackToTop(window.pageYOffset > 300);

      // Show Back to Bottom button
      const isAtBottom = Math.ceil(window.innerHeight + window.pageYOffset) >= document.body.offsetHeight;
      setShowBackToBottom(!isAtBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className='fixed bottom-4 right-4 z-50 flex flex-col gap-2'>
      {showBackToTop && (
        <Button
          variant='outline'
          onClick={scrollToTop}
          className='p-2 rounded-full h-12 w-12'
        >
          <ArrowUp className='h-6 w-6' />
        </Button>
      )}
      {showBackToBottom && (
        <Button
          variant='outline'
          onClick={scrollToBottom}
          className='p-2 rounded-full h-12 w-12'
        >
          <ArrowDown className='h-6 w-6' />
        </Button>
      )}
    </div>
  );
}
