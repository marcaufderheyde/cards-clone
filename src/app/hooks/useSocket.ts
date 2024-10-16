import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return socket;
};

export default useSocket;
