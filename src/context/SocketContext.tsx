import React, { createContext, useContext, useEffect } from 'react';
import { socketService } from '../../services/websocket/socket';

const SocketContext = createContext({});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    socketService.connect();
    return () => socketService.disconnect();
  }, []);

  return <SocketContext.Provider value={{}}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);