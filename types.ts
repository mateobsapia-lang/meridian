import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scrolls to the top of the document immediately when the route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
