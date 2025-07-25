import React, { createContext, useContext, useEffect, useState } from 'react';
import { getEchoInstance, disconnectEcho } from '@/lib/echo';
import { useAppSelector } from '@/hooks/useAppSelector';
import { apiBaseUrl } from '@/lib/utils';

interface PusherContextType {
  echo: ReturnType<typeof getEchoInstance> | null;
  totalNewMessages: number;
  setTotalNewMessages: React.Dispatch<React.SetStateAction<number>>;
}

type Participant = {
  id: number;
  name: string;
  profile_photo_url?: string;
  isOnline?: boolean;
};

const PusherContext = createContext<PusherContextType>({
  echo: null,
  totalNewMessages: 0,
  setTotalNewMessages: () => {},
});

export const usePusher = () => useContext(PusherContext);

export const PusherProvider = ({ children }: { children: React.ReactNode }) => {
  const [echo, setEcho] = useState<ReturnType<typeof getEchoInstance> | null>(null);
  const [totalNewMessages, setTotalNewMessages] = useState(0);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const authUser = useAppSelector((state) => state.user.user);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (isAuthenticated && token && !echo) {
      console.log('Connecting to Pusher...');
      const echoInstance = getEchoInstance(token);
      setEcho(echoInstance);
    }

    return () => {
      if (echo) {
        console.log('Disconnecting from Pusher...');
        disconnectEcho();
        setEcho(null);
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!echo || !authUser) return;

    console.log('authUser:', authUser); // تحقق من بيانات authUser
    const channelName = `Messenger.${authUser.id}`;
    const channel = echo.private(channelName);

    console.log(`Subscribing to channel: ${channelName}`);
    channel.listen('.new-message', (data: any) => {
      console.log('New message received:', data);
      setTotalNewMessages((prev) => {
        console.log('Updating totalNewMessages to:', prev + 1);
        return prev + 1;
      }); 
    });

    return () => {
      console.log(`Unsubscribing from channel: ${channelName}`);
      echo.leave(channelName);
    };
  }, [echo, authUser]);

  return (
    <PusherContext.Provider value={{ echo, totalNewMessages, setTotalNewMessages }}>
      {children}
    </PusherContext.Provider>
  );
};