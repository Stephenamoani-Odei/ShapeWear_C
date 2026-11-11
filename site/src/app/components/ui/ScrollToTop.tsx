import { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation({ select: (l) => ({ pathname: l.pathname, hash: l.hash ? '#' + l.hash.replace(/^#/, '') : '' }) });

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);

  return null;
}

