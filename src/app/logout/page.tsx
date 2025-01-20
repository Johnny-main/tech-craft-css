'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Logout = () => {
  const router = useRouter(); // To navigate after clearing the teamName

  useEffect(() => {
    // Clear the teamName from localStorage when this route is accessed
    localStorage.removeItem('teamName');
    
    // Redirect user to the home page or the login page
    router.push('/'); // You can change this route if you want a different page (e.g., '/login')
  }, [router]);

  return null; // No need to render anything on this page
};

export default Logout;
