'use client';

import React, { useEffect, useState, useRef } from 'react';
import NicknameInput from './components/NicknameInput';
import AdminControls from './components/AdminControls';
import Leaderboard from './components/Leaderboard';
import GameBoard from './components/GameBoard';
import WhiteCardsHand from './components/WhiteCardsHand';
import SubmitButton from './components/SubmitButton';
import useSocket from './hooks/useSocket';
import { GameSettings, User, WhiteCard, Submission } from '@/types';

const CardGamePage: React.FC = () => {
    // Socket initialization
    const socket = useSocket();

    // State variables
    const [nickname, setNickname] = useState('');
    const [gameSettings, setGameSettings] = useState<GameSettings>({
        pointsToWin: 5,
    });
    const [users, setUsers] = useState<User[]>([]);
    const [host, setHost] = useState<string | null>(null);
    const [adminSet, setAdminSet] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [blackCard, setBlackCard] = useState<{
        text: string;
        blanks: number;
    } | null>(null);

    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [myWhiteCards, setMyWhiteCards] = useState<WhiteCard[]>([]);
    const [selectedCards, setSelectedCards] = useState<
        { text: string; isBlank?: boolean }[]
    >([]);
    const [cardCzar, setCardCzar] = useState<User | null>(null);
    const [submittedCards, setSubmittedCards] = useState<Submission[]>([]);
    const [currentSubmissionsCount, setCurrentSubmissionsCount] = useState(0);
    const [expectedSubmissionsCount, setExpectedSubmissionsCount] = useState(0);

    const [allSubmissionsReceived, setAllSubmissionsReceived] = useState(false);

    const [winningSubmission, setWinningSubmission] =
        useState<Submission | null>(null);
    const [scoreLimit, setScoreLimit] = useState<number>(5);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [submissionTimeEnded, setSubmissionTimeEnded] = useState(false);

    const [gameOver, setGameOver] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [hasSelectedWinner, setHasSelectedWinner] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.on('connect', () => {
            console.log('Connected to server with ID:', socket.id);
        });

        socket.on('adminReset', () => {
            setAdminSet(false);
        });

        socket.on('updateUserList', (updatedUsers: User[]) => {
            setUsers(updatedUsers);
        });

        socket.on('updateHost', (hostId: string) => {
            setHost(hostId);
            if (hostId !== socket.id) {
                setAdminSet(false); // Reset adminSet if you're not the host
            }
        });

        socket.on('adminSet', () => {
            setAdminSet(true);
        });

        socket.on(
            'gameStarted',
            ({
                blackCard,
                users,
                cardCzar,
                scoreLimit,
                expectedSubmissions,
            }) => {
                setGameStarted(true);
                setBlackCard(blackCard);
                setCardCzar(cardCzar);
                setScoreLimit(scoreLimit);
                setGameOver(false);
                setHasSubmitted(false);
                setSubmittedCards([]);
                setUsers(users);

                const me = users.find((user: User) => user.id === socket.id);
                if (me) {
                    setMyWhiteCards(me.whiteCards || []);
                }
                setTimeLeft(75); // 75 seconds
                setSubmissionTimeEnded(false);

                startTimer();

                // Reset submission counts
                setCurrentSubmissionsCount(0);
                setExpectedSubmissionsCount(expectedSubmissions); // Now properly set
            }
        );

        socket.on('updateHand', (newHand) => {
            setMyWhiteCards(newHand);
        });

        socket.on('updateScoreLimit', (newLimit) => {
            setScoreLimit(newLimit);
        });

        socket.on(
            'playerSubmittedCards',
            ({ totalSubmissions, expectedSubmissions }) => {
                setCurrentSubmissionsCount(totalSubmissions);
                setExpectedSubmissionsCount(expectedSubmissions);
            }
        );

        socket.on('allCardsSubmitted', ({ submissions }) => {
            setSubmittedCards(submissions);
            setAllSubmissionsReceived(true);
            setCurrentSubmissionsCount(submissions.length);

            // Clear the timer
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        });

        socket.on('submissionTimeEnded', () => {
            setSubmissionTimeEnded(true);
            setTimeLeft(0);

            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        });

        socket.on('winnerSelected', ({ winner, winningSubmission }) => {
            setWinningSubmission(winningSubmission);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === winner.id
                        ? { ...user, points: winner.points }
                        : user
                )
            );
            setTimeout(() => {
                setWinningSubmission(null);
            }, 5000);
        });

        socket.on(
            'nextRound',
            ({ blackCard, cardCzar, users, expectedSubmissions }) => {
                setBlackCard(blackCard);
                setCardCzar(cardCzar);
                setUsers(users);
                setSubmittedCards([]);
                setSelectedCards([]);
                setHasSubmitted(false);
                setHasSelectedWinner(false);
                setAllSubmissionsReceived(false);

                const me = users.find((user: User) => user.id === socket.id);
                if (me) {
                    setMyWhiteCards(me.whiteCards || []);
                }

                setTimeLeft(75); // 75 seconds
                setSubmissionTimeEnded(false);

                startTimer();

                // Reset submission counts
                setCurrentSubmissionsCount(0);
                setExpectedSubmissionsCount(expectedSubmissions); // Now properly set
            }
        );

        socket.on('announceTopPlayers', (topPlayers: User[]) => {
            const playerNames = topPlayers
                .map(
                    (player) =>
                        `${player.nickname || 'Anonymous'}: ${
                            player.points
                        } points`
                )
                .join('\n');
            setTimeout(() => {
                alert(`Game Over! Top 3 Players:\n${playerNames}`);
            }, 1000);
            setGameOver(true);
            setGameStarted(false);
            setSubmittedCards([]);
            setSelectedCards([]);
            setCurrentSubmissionsCount(0);
            setExpectedSubmissionsCount(0); // Reset counts
        });

        return () => {
            socket.off('connect');
            socket.off('adminReset');
            socket.off('updateUserList');
            socket.off('updateHost');
            socket.off('adminSet');
            socket.off('gameStarted');
            socket.off('updateHand');
            socket.off('updateScoreLimit');
            socket.off('allCardsSubmitted');
            socket.off('winnerSelected');
            socket.off('nextRound');
            socket.off('announceTopPlayers');
            socket.off('submissionTimeEnded');
            socket.off('playerSubmittedCards');
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, [socket]);

    const startTimer = () => {
        // Clear any existing interval
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }

        let time = 75;
        setTimeLeft(time);

        timerIntervalRef.current = setInterval(() => {
            time -= 1;
            setTimeLeft(time);

            if (time <= 0) {
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                }
            }
        }, 1000);
    };

    const handleSelectCard = (card: WhiteCard) => {
        if (socket && cardCzar?.id !== socket.id && !hasSubmitted) {
            if (selectedCards.some((c) => c.text === card.text)) {
                setSelectedCards(
                    selectedCards.filter((c) => c.text !== card.text)
                );
            } else {
                if (selectedCards.length < (blackCard?.blanks || 1)) {
                    if (card.isBlank) {
                        const customText = prompt('Enter your custom answer:');
                        if (customText && customText.trim() !== '') {
                            const customCard = {
                                text: customText.trim(),
                                isCustom: true,
                            };
                            setSelectedCards([...selectedCards, customCard]);
                            setMyWhiteCards((prevCards) =>
                                prevCards.filter((c) => c !== card)
                            );
                        }
                    } else {
                        setSelectedCards([...selectedCards, card]);
                    }
                }
            }
        }
    };

    const handleStartNewRound = () => {
        if (socket && host === socket.id) {
            const newScoreLimit = gameSettings.pointsToWin;
            socket.emit('startNewRound', { newScoreLimit });
            setCardCzar(null);
            setGameOver(false);
        }
    };

    const handleSubmitCards = () => {
        if (
            socket &&
            selectedCards.length === (blackCard?.blanks || 1) &&
            cardCzar?.id !== socket.id &&
            !hasSubmitted &&
            !submissionTimeEnded
        ) {
            socket.emit('submitWhiteCards', selectedCards);
            setSelectedCards([]);
            setHasSubmitted(true);
            setMyWhiteCards((prevCards) =>
                prevCards.filter(
                    (card) => !selectedCards.some((c) => c.text === card.text)
                )
            );
        }
    };

    const handleSelectWinner = (submission: {
        user: User;
        cards: { text: string }[];
    }) => {
        if (socket && cardCzar?.id === socket.id && !hasSelectedWinner) {
            const confirmSelection = window.confirm(
                'Are you sure you want to select this submission as the winner?'
            );
            if (confirmSelection) {
                socket.emit('selectWinner', submission);
                setHasSelectedWinner(true);
            }
        }
    };

    const handleSetNickname = () => {
        if (socket && nickname) {
            socket.emit('setNickname', nickname);
        }
    };

    const handleBecomeAdmin = () => {
        if (socket && host === socket.id) {
            socket.emit('setNickname', nickname);
            socket.emit('becomeAdmin');
        }
    };

    const handleStartGame = () => {
        if (socket && host === socket.id && adminSet) {
            socket.emit('startGame');
        }
    };

    return (
        socket && (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl w-full">
                    <h1 className="text-3xl font-bold mb-4 text-center text-black">
                        CardsClone
                    </h1>
                    <NicknameInput
                        nickname={nickname}
                        setNickname={setNickname}
                        handleSetNickname={handleSetNickname}
                        socket={socket}
                        gameStarted={gameStarted}
                        gameOver={gameOver}
                        host={host}
                    />
                    <AdminControls
                        socket={socket}
                        host={host}
                        nickname={nickname}
                        adminSet={adminSet}
                        gameStarted={gameStarted}
                        gameOver={gameOver}
                        winningSubmission={winningSubmission}
                        handleBecomeAdmin={handleBecomeAdmin}
                        handleStartGame={handleStartGame}
                        handleStartNewRound={handleStartNewRound}
                        gameSettings={gameSettings}
                        setGameSettings={setGameSettings}
                    />
                    <Leaderboard
                        users={users}
                        cardCzar={cardCzar}
                        scoreLimit={scoreLimit}
                    />
                    {gameStarted && !gameOver && (
                        <>
                            {/* Display Countdown Timer */}
                            <div className="text-center text-lg font-semibold text-red-500 mb-4">
                                {timeLeft !== null && timeLeft > 0 && (
                                    <p>
                                        Time left to submit: {timeLeft} seconds
                                    </p>
                                )}
                                {submissionTimeEnded && (
                                    <p>Submission time has ended.</p>
                                )}
                            </div>
                            <GameBoard
                                blackCard={blackCard}
                                submittedCards={submittedCards}
                                cardCzar={cardCzar}
                                socket={socket}
                                handleSelectWinner={handleSelectWinner}
                                winningSubmission={winningSubmission}
                                hasSelectedWinner={hasSelectedWinner}
                                allSubmissionsReceived={allSubmissionsReceived}
                                totalPlayers={users.length}
                                currentSubmissionsCount={
                                    currentSubmissionsCount
                                }
                                expectedSubmissionsCount={
                                    expectedSubmissionsCount
                                }
                            />
                        </>
                    )}
                    {gameStarted && !gameOver && (
                        <>
                            <WhiteCardsHand
                                myWhiteCards={myWhiteCards}
                                selectedCards={selectedCards}
                                handleSelectCard={handleSelectCard}
                                hasSubmitted={hasSubmitted}
                                cardCzar={cardCzar}
                                socket={socket}
                                submissionTimeEnded={submissionTimeEnded}
                            />
                            <SubmitButton
                                selectedCards={selectedCards}
                                blackCard={blackCard}
                                handleSubmitCards={handleSubmitCards}
                                hasSubmitted={hasSubmitted}
                                cardCzar={cardCzar}
                                socket={socket}
                            />
                        </>
                    )}
                </div>
            </div>
        )
    );
};

export default CardGamePage;
