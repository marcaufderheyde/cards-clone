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

    // Move the creation of games here, after io is defined
    const games = {
        lobby1: new Game(io, 'lobby1'),
        lobby2: new Game(io, 'lobby2'),
        lobby3: new Game(io, 'lobby3'),
        lobby4: new Game(io, 'lobby4'),
        lobby5: new Game(io, 'lobby5'),
        lobby6: new Game(io, 'lobby6'),
        lobby7: new Game(io, 'lobby7'),
        lobby8: new Game(io, 'lobby8'),
        lobby9: new Game(io, 'lobby9'),
        lobby10: new Game(io, 'lobby10'),
        lobby11: new Game(io, 'lobby11'),
        lobby12: new Game(io, 'lobby12'),
        lobby13: new Game(io, 'lobby13'),
        lobby14: new Game(io, 'lobby14'),
        lobby15: new Game(io, 'lobby15'),
        lobby16: new Game(io, 'lobby16'),
        lobby17: new Game(io, 'lobby17'),
        lobby18: new Game(io, 'lobby18'),
        lobby19: new Game(io, 'lobby19'),
        lobby20: new Game(io, 'lobby20'),
    };

    io.on(EVENTS.CONNECTION, (socket) => {
        console.log(`New client connected: ${socket.id}`);

        // Remove unnecessary parameters when calling Game methods
        socket.on(EVENTS.JOIN_LOBBY, ({ lobbyId }) => {
            if (games[lobbyId]) {
                socket.join(lobbyId);
                games[lobbyId].addUser(socket);
            } else {
                socket.emit(EVENTS.ERROR_MESSAGE, 'Invalid lobby ID');
            }
        });

        socket.on(EVENTS.SET_NICKNAME, ({ nickname, lobbyId }) => {
            games[lobbyId]?.setNickname(socket, nickname);
        });

        socket.on(EVENTS.BECOME_ADMIN, ({ lobbyId }) => {
            games[lobbyId]?.becomeAdmin(socket);
        });

        socket.on(EVENTS.START_GAME, ({ lobbyId }) => {
            games[lobbyId]?.startGame(socket);
        });

        socket.on(EVENTS.SUBMIT_WHITE_CARDS, ({ submittedCards, lobbyId }) =>
            games[lobbyId]?.submitWhiteCards(socket, submittedCards)
        );

        socket.on(EVENTS.SET_SCORE_LIMIT, ({ newLimit, lobbyId }) =>
            games[lobbyId]?.setScoreLimit(socket, newLimit)
        );

        socket.on(EVENTS.SELECT_WINNER, ({ winningSubmission, lobbyId }) =>
            games[lobbyId]?.selectWinner(socket, winningSubmission)
        );

        socket.on(EVENTS.START_NEW_ROUND, ({ newScoreLimit, lobbyId }) =>
            games[lobbyId]?.startNewRound(socket, newScoreLimit)
        );

        socket.on(EVENTS.DISCONNECT, () => {
            console.log(`Client disconnected: ${socket.id}`);
            // Remove the user from all lobbies they might be in
            for (const lobbyId in games) {
                games[lobbyId].removeUser(socket);
            }
        });
    });

    server.all('*', (req, res) => handle(req, res));

    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Server Ready on http://localhost:${port}`);
    });
});
