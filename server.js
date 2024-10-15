const fs = require('fs');
const { createServer } = require('http');
const next = require('next');
const express = require('express');
const { Server } = require('socket.io');
const port = process.env.PORT || 3000;

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const whiteCardsDeck = JSON.parse(
    fs.readFileSync('./public/white.json', 'utf8')
);
const blackCardsDeck = JSON.parse(
    fs.readFileSync('./public/black.json', 'utf8')
);

let connectedUsers = [];
let host = null;
let adminSet = false;
let gameStarted = false;
let cardCzarOrder = [];
let currentCardCzarIndex = 0;
let submissions = [];
let SCORE_LIMIT = 3;

app.prepare().then(() => {
    const server = express();
    const httpServer = createServer(server);
    const io = new Server(httpServer);

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        if (!host) {
            host = socket.id;
        }
        connectedUsers.push({
            id: socket.id,
            nickname: null,
            whiteCards: [],
            points: 0,
        });

        io.emit('updateUserList', connectedUsers);
        io.emit('updateHost', host);

        socket.on('setNickname', (nickname) => {
            const user = connectedUsers.find((user) => user.id === socket.id);
            if (user) {
                user.nickname = nickname;
            }
            io.emit('updateUserList', connectedUsers);
        });

        socket.on('becomeAdmin', () => {
            if (socket.id === host && !adminSet) {
                adminSet = true;
                io.emit('adminSet');
            }
        });

        socket.on('startGame', () => {
            if (socket.id === host && adminSet && !gameStarted) {
                if (connectedUsers.length < 3) {
                    socket.emit(
                        'errorMessage',
                        'At least 3 players are required to start the game'
                    );
                    return;
                }

                gameStarted = true;
                submissions = [];
                cardCzarOrder = shuffleArray([...connectedUsers]);
                currentCardCzarIndex = 0;

                connectedUsers.forEach((user) => {
                    user.whiteCards = getRandomCards(whiteCardsDeck, 10);
                });

                const cardCzar = cardCzarOrder[currentCardCzarIndex];

                io.emit('gameStarted', {
                    blackCard: getRandomCard(blackCardsDeck),
                    users: connectedUsers,
                    cardCzar,
                    scoreLimit: SCORE_LIMIT,
                });
            }
        });

        socket.on('submitWhiteCards', (submittedCards) => {
            const user = connectedUsers.find((user) => user.id === socket.id);
            if (user && !submissions.some((sub) => sub.user.id === user.id)) {
                submittedCards.forEach((card) => {
                    // Remove the card from user's hand only if it's not a custom card
                    if (!card.isCustom) {
                        user.whiteCards = user.whiteCards.filter(
                            (c) => c.text !== card.text
                        );
                        const newCard = getRandomCard(whiteCardsDeck);
                        user.whiteCards.push(newCard);
                    }
                });

                submissions.push({ user, cards: submittedCards });

                socket.emit('updateHand', user.whiteCards);

                if (submissions.length === connectedUsers.length - 1) {
                    io.emit('allCardsSubmitted', { submissions });
                }
            }
        });

        socket.on('setScoreLimit', (newLimit) => {
            if (socket.id === host) {
                SCORE_LIMIT = newLimit;
                console.log(`New score limit set to: ${SCORE_LIMIT}`);
                io.emit('updateScoreLimit', SCORE_LIMIT);
            }
        });

        socket.on('selectWinner', (winningSubmission) => {
            const submission = submissions.find(
                (sub) => sub.user.id === winningSubmission.user.id
            );
            if (submission) {
                const winner = connectedUsers.find(
                    (user) => user.id === submission.user.id
                );
                if (winner) {
                    winner.points += 1;

                    if (winner.points >= SCORE_LIMIT) {
                        const topPlayers = connectedUsers
                            .sort((a, b) => b.points - a.points)
                            .slice(0, 3);
                        io.emit('announceTopPlayers', topPlayers);
                        resetGame(io);
                    } else {
                        io.emit('winnerSelected', {
                            winner,
                            winningSubmission,
                        });
                        setTimeout(() => {
                            startNextRound(io);
                        }, 5000);
                    }
                }
            }
        });

        socket.on('startNewRound', ({ newScoreLimit }) => {
            SCORE_LIMIT = newScoreLimit;
            resetGame(io);
            startNewGame(io);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            connectedUsers = connectedUsers.filter(
                (user) => user.id !== socket.id
            );
            cardCzarOrder = cardCzarOrder.filter(
                (user) => user.id !== socket.id
            );

            if (connectedUsers.length === 0) {
                host = null;
            } else if (socket.id === host) {
                host = connectedUsers[0].id;
            }

            io.emit('updateUserList', connectedUsers);
            io.emit('updateHost', host);
        });
    });

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    httpServer.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Server Ready on dynamic link...');
    });
});

function getRandomCard(deck) {
    return deck[Math.floor(Math.random() * deck.length)];
}

function getRandomCards(deck, numberOfCards) {
    return shuffleArray([...deck]).slice(0, numberOfCards);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startNextRound(io) {
    currentCardCzarIndex = (currentCardCzarIndex + 1) % cardCzarOrder.length;
    const newCardCzar = cardCzarOrder[currentCardCzarIndex];
    submissions = [];

    io.emit('nextRound', {
        blackCard: getRandomCard(blackCardsDeck),
        cardCzar: newCardCzar,
        users: connectedUsers,
    });
}

function resetGame(io) {
    connectedUsers.forEach((user) => {
        user.points = 0;
        user.whiteCards = getRandomCards(whiteCardsDeck, 10);
    });
    gameStarted = false;
    adminSet = false;
    submissions = [];
    currentCardCzarIndex = 0;
    io.emit('updateUserList', connectedUsers); // Emit updated user list
}

function startNewGame(io) {
    gameStarted = true;
    cardCzarOrder = shuffleArray([...connectedUsers]);
    currentCardCzarIndex = 0;
    submissions = []; // Clear submissions
    const cardCzar = cardCzarOrder[currentCardCzarIndex];

    io.emit('gameStarted', {
        blackCard: getRandomCard(blackCardsDeck),
        users: connectedUsers,
        cardCzar,
        scoreLimit: SCORE_LIMIT,
    });
}
