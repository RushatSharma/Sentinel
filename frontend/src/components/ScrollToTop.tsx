import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Whenever the pathname changes, instantly scroll to the top left
    window.scrollTo(0, 0);
  }, [pathname]);

  // This component doesn't render anything visually
  return null; 
}