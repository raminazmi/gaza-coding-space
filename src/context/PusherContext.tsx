import React, { createContext, useContext, useEffect, useState } from 'react';
import { getEchoInstance } from '@/lib/echo';
import { useAppSelector } from '@/hooks/useAppSelector';

interface PusherContextType {
  echo: ReturnType<typeof getEchoInstance> | null;
}

const PusherContext = createContext<PusherContextType>({ echo: null });

export const usePusher = () => useContext(PusherContext);

export const PusherProvider = ({ children }: { children: React.ReactNode }) => {
  const [echo, setEcho] = useState<ReturnType<typeof getEchoInstance> | null>(null);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (isAuthenticated && token) {
      const echoInstance = getEchoInstance(token);
      setEcho(echoInstance);
    } else if (echo) {
      echo.disconnect();
      setEcho(null);
    }
    return () => {
      if (echo) {
        echo.disconnect();
        setEcho(null);
      }
    };
    // eslint-disable-next-line
  }, [isAuthenticated]);

  return (
    <PusherContext.Provider value={{ echo }}>
      {children}
    </PusherContext.Provider>
  );
};