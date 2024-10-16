const { getRandomCard, getRandomCards, shuffleArray } = require('./utils');
const { EVENTS } = require('./constants');
const fs = require('fs');

class Game {
    constructor(io) {
        this.io = io;
        this.connectedUsers = [];
        this.host = null;
        this.adminSet = false;
        this.gameStarted = false;
        this.cardCzarOrder = [];
        this.currentCardCzarIndex = 0;
        this.submissions = [];
        this.SCORE_LIMIT = 3;
        this.winnerSelected = false;
        this.MIN_PLAYERS = 3;
        this.submissionTimer = null;
        this.SUBMISSION_TIME_LIMIT = 75000;

        // Load card decks
        this.whiteCardsDeck = JSON.parse(
            fs.readFileSync('./public/white.json', 'utf8')
        );
        this.blackCardsDeck = JSON.parse(
            fs.readFileSync('./public/black.json', 'utf8')
        );
    }

    addUser(socket) {
        if (!this.host) {
            this.host = socket.id;
        }
        this.connectedUsers.push({
            id: socket.id,
            nickname: null,
            whiteCards: [],
            points: 0,
        });

        this.io.emit(EVENTS.UPDATE_USER_LIST, this.connectedUsers);
        this.io.emit(EVENTS.UPDATE_HOST, this.host);
    }

    removeUser(socket) {
        this.connectedUsers = this.connectedUsers.filter(
            (user) => user.id !== socket.id
        );
        this.cardCzarOrder = this.cardCzarOrder.filter(
            (user) => user.id !== socket.id
        );

        if (this.connectedUsers.length === 0) {
            this.host = null;
            this.adminSet = false;
            this.io.emit(EVENTS.ADMIN_RESET);
        } else if (socket.id === this.host) {
            this.host = this.connectedUsers[0].id;
            this.adminSet = false;
            this.io.emit(EVENTS.ADMIN_RESET);
            this.io.emit(EVENTS.UPDATE_HOST, this.host);
        }

        this.io.emit(EVENTS.UPDATE_USER_LIST, this.connectedUsers);
    }

    setNickname(socket, nickname) {
        const user = this.connectedUsers.find((user) => user.id === socket.id);
        if (user) {
            user.nickname = nickname;
            this.io.emit(EVENTS.UPDATE_USER_LIST, this.connectedUsers);
        }
    }

    becomeAdmin(socket) {
        if (socket.id === this.host && !this.adminSet) {
            this.adminSet = true;
            this.io.emit(EVENTS.ADMIN_SET);
        }
    }

    handleSubmissionTimeout() {
        // If all submissions have already been received, do nothing
        const expectedSubmissions = this.connectedUsers.length - 1; // Exclude Card Czar
        if (this.submissions.length >= expectedSubmissions) {
            return;
        }

        // Notify players that the submission time has ended
        this.io.emit(EVENTS.SUBMISSION_TIME_ENDED);

        // Proceed with the submissions received so far
        this.io.emit(EVENTS.ALL_CARDS_SUBMITTED, {
            submissions: this.submissions,
        });
    }

    startGame(socket) {
        if (socket.id === this.host && this.adminSet && !this.gameStarted) {
            if (this.connectedUsers.length < this.MIN_PLAYERS) {
                socket.emit(
                    EVENTS.ERROR_MESSAGE,
                    `At least ${this.MIN_PLAYERS} players are required to start the game`
                );
                return;
            }

            this.gameStarted = true;
            this.submissions = [];
            this.cardCzarOrder = shuffleArray([...this.connectedUsers]);
            this.currentCardCzarIndex = 0;

            this.connectedUsers.forEach((user) => {
                user.whiteCards = getRandomCards(this.whiteCardsDeck, 10);
            });

            const cardCzar = this.cardCzarOrder[this.currentCardCzarIndex];

            this.io.emit(EVENTS.GAME_STARTED, {
                blackCard: getRandomCard(this.blackCardsDeck),
                users: this.connectedUsers,
                cardCzar,
                scoreLimit: this.SCORE_LIMIT,
                expectedSubmissions: this.connectedUsers.length - 1,
            });
        }
    }

    submitWhiteCards(socket, submittedCards) {
        const user = this.connectedUsers.find((user) => user.id === socket.id);
        if (!user) {
            console.error(`User with ID ${socket.id} not found.`);
            return;
        }

        if (this.submissions.some((sub) => sub.user.id === user.id)) {
            console.warn(`User ${socket.id} has already submitted cards.`);
            return;
        }

        submittedCards.forEach((card) => {
            // Remove the card from user's hand only if it's not a custom card
            if (!card.isCustom) {
                user.whiteCards = user.whiteCards.filter(
                    (c) => c.text !== card.text
                );
                const newCard = getRandomCard(this.whiteCardsDeck);
                user.whiteCards.push(newCard);
            }
        });

        this.submissions.push({ user, cards: submittedCards });

        socket.emit(EVENTS.UPDATE_HAND, user.whiteCards);

        this.io.emit(EVENTS.PLAYER_SUBMITTED_CARDS, {
            totalSubmissions: this.submissions.length,
            expectedSubmissions: this.connectedUsers.length - 1, // Exclude Card Czar
        });

        const expectedSubmissions = this.connectedUsers.length - 1;

        if (this.submissions.length === expectedSubmissions) {
            // All submissions received before timeout, clear the timer
            if (this.submissionTimer) {
                clearTimeout(this.submissionTimer);
                this.submissionTimer = null;
            }
            this.io.emit(EVENTS.ALL_CARDS_SUBMITTED, {
                submissions: this.submissions,
            });
        }
    }

    setScoreLimit(socket, newLimit) {
        if (socket.id === this.host) {
            this.SCORE_LIMIT = newLimit;
            console.log(`New score limit set to: ${this.SCORE_LIMIT}`);
            this.io.emit(EVENTS.UPDATE_SCORE_LIMIT, this.SCORE_LIMIT);
        }
    }

    selectWinner(socket, winningSubmission) {
        if (
            socket.id !== this.cardCzarOrder[this.currentCardCzarIndex].id ||
            this.winnerSelected
        ) {
            return; // Prevent non-card czar or multiple selections
        }
        this.winnerSelected = true;
        const submission = this.submissions.find(
            (sub) => sub.user.id === winningSubmission.user.id
        );
        if (submission) {
            const winner = this.connectedUsers.find(
                (user) => user.id === submission.user.id
            );
            if (winner) {
                winner.points += 1;

                if (winner.points >= this.SCORE_LIMIT) {
                    const topPlayers = this.connectedUsers
                        .sort((a, b) => b.points - a.points)
                        .slice(0, 3);
                    this.io.emit(EVENTS.ANNOUNCE_TOP_PLAYERS, topPlayers);
                    this.resetGame();
                } else {
                    this.io.emit(EVENTS.WINNER_SELECTED, {
                        winner,
                        winningSubmission,
                    });
                    setTimeout(() => {
                        this.startNextRound();
                    }, 5000);
                }
            }
        }

        if (this.winnerSelected) {
            // Clear the submission timer if it's still running
            if (this.submissionTimer) {
                clearTimeout(this.submissionTimer);
                this.submissionTimer = null;
            }
        }
    }

    startNewRound(socket, newScoreLimit) {
        if (socket.id === this.host) {
            this.SCORE_LIMIT = newScoreLimit;
            this.resetGame();
            this.startNewGame();
        }
    }

    startNextRound() {
        this.currentCardCzarIndex =
            (this.currentCardCzarIndex + 1) % this.cardCzarOrder.length;
        const newCardCzar = this.cardCzarOrder[this.currentCardCzarIndex];
        this.submissions = [];
        this.winnerSelected = false;

        // Start the submission timer
        if (this.submissionTimer) {
            clearTimeout(this.submissionTimer);
        }
        this.submissionTimer = setTimeout(() => {
            this.handleSubmissionTimeout();
        }, this.SUBMISSION_TIME_LIMIT);

        this.io.emit(EVENTS.NEXT_ROUND, {
            blackCard: getRandomCard(this.blackCardsDeck),
            cardCzar: newCardCzar,
            users: this.connectedUsers,
            expectedSubmissions: this.connectedUsers.length - 1,
        });
    }

    resetGame() {
        this.connectedUsers.forEach((user) => {
            user.points = 0;
            user.whiteCards = getRandomCards(this.whiteCardsDeck, 10);
        });
        this.gameStarted = false;
        this.adminSet = false;
        this.submissions = [];
        this.currentCardCzarIndex = 0;
        this.winnerSelected = false;
        this.io.emit(EVENTS.UPDATE_USER_LIST, this.connectedUsers);
        this.io.emit(EVENTS.ADMIN_RESET);
    }

    startNewGame() {
        this.gameStarted = true;
        this.cardCzarOrder = shuffleArray([...this.connectedUsers]);
        this.currentCardCzarIndex = 0;
        this.submissions = [];
        const cardCzar = this.cardCzarOrder[this.currentCardCzarIndex];

        // Start the submission timer
        if (this.submissionTimer) {
            clearTimeout(this.submissionTimer);
        }
        this.submissionTimer = setTimeout(() => {
            this.handleSubmissionTimeout();
        }, this.SUBMISSION_TIME_LIMIT);

        this.io.emit(EVENTS.GAME_STARTED, {
            blackCard: getRandomCard(this.blackCardsDeck),
            users: this.connectedUsers,
            cardCzar,
            scoreLimit: this.SCORE_LIMIT,
            expectedSubmissions: this.connectedUsers.length - 1,
        });
    }
}

module.exports = Game;
