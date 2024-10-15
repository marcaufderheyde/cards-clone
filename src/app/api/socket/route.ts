import { Server } from 'socket.io';
import { NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

// Extend the NextApiResponse to access the Node.js server
type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: any;
  };
};

let io: Server | null = null;

export async function GET(req: NextRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');

    io = new Server(res.socket.server, {
      path: '/api/socket', // Match the client-side socket.io connection path
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

      // Handle the custom events like "playWhiteCard"
      socket.on('playWhiteCard', (card) => {
        console.log('White card played:', card);
        io?.emit('whiteCardPlayed', card);
      });

      socket.on('voteForWhiteCard', (card) => {
        console.log('White card voted:', card);
        io?.emit('whiteCardVoted', card);
      });
    });

    // Attach the io instance to the server so it doesn't reinitialize
    res.socket.server.io = io;
  } else {
    console.log('Socket.IO server is already running');
  }

  return NextResponse.json({ status: 'Socket.IO server running' });
}

// Disable body parsing since WebSockets don’t need body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};
