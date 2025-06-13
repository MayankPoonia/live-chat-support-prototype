import { createContext, useContext, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const initializeSocket = (isAdmin = false) => {
    if (!socket) {
      const newSocket = io("http://localhost:3000", {
        transports: ["websocket", "polling"],
        withCredentials: true,
      });

      if (isAdmin) {
        newSocket.on("connect", () => {
          console.log("Admin connected to server");
          newSocket.emit("admin-connect");
        });
      }

      setSocket(newSocket);
    }
    return socket;
  };

  return (
    <SocketContext.Provider value={{ socket, initializeSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
