const express = require('express');
const next = require('next');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Game = require('./server/Game');
const { EVENTS } = require('./server/constants');

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
    const httpServer = createServer(server);
    const io = new Server(httpServer);
    const game = new Game(io);

    io.on(EVENTS.CONNECTION, (socket) => {
        console.log(`New client connected: ${socket.id}`);
        game.addUser(socket);

        socket.on(EVENTS.SET_NICKNAME, (nickname) =>
            game.setNickname(socket, nickname)
        );
        socket.on(EVENTS.BECOME_ADMIN, () => game.becomeAdmin(socket));
        socket.on(EVENTS.START_GAME, () => game.startGame(socket));
        socket.on(EVENTS.SUBMIT_WHITE_CARDS, (submittedCards) =>
            game.submitWhiteCards(socket, submittedCards)
        );
        socket.on(EVENTS.SET_SCORE_LIMIT, (newLimit) =>
            game.setScoreLimit(socket, newLimit)
        );
        socket.on(EVENTS.SELECT_WINNER, (winningSubmission) =>
            game.selectWinner(socket, winningSubmission)
        );
        socket.on(EVENTS.START_NEW_ROUND, ({ newScoreLimit }) =>
            game.startNewRound(socket, newScoreLimit)
        );

        socket.on(EVENTS.DISCONNECT, () => {
            console.log(`Client disconnected: ${socket.id}`);
            game.removeUser(socket);
        });
    });

    server.all('*', (req, res) => handle(req, res));

    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Server Ready on http://localhost:${port}`);
    });
});
