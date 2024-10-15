'use client';

import React, { useEffect, useState } from 'react';
import { DefaultEventsMap } from 'socket.io';
import io, { Socket } from 'socket.io-client';

interface GameSettings {
    pointsToWin: number;
}

interface User {
    id: string;
    nickname?: string;
    whiteCards?: { text: string }[];
    points: number;
}

interface Submission {
    user: User;
    cards: { text: string; isCustom?: boolean; isBlank?: boolean }[];
}

interface WhiteCard {
    text: string;
    isBlank?: boolean;
}

const CardGamePage: React.FC = () => {
    const [socket, setSocket] =
        useState<Socket<DefaultEventsMap, DefaultEventsMap>>();
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

    const [myWhiteCards, setMyWhiteCards] = useState<WhiteCard[]>([]);
    const [selectedCards, setSelectedCards] = useState<
        { text: string; isBlank?: boolean }[]
    >([]);
    const [cardCzar, setCardCzar] = useState<User | null>(null);
    const [submittedCards, setSubmittedCards] = useState<Submission[]>([]);
    const [winningSubmission, setWinningSubmission] =
        useState<Submission | null>(null);
    const [scoreLimit, setScoreLimit] = useState<number>(5);
    const [gameOver, setGameOver] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    // Add this state variable
    const [hasSelectedWinner, setHasSelectedWinner] = useState(false);

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server with ID:', newSocket.id);
        });

        newSocket.on('updateUserList', (updatedUsers: User[]) => {
            setUsers(updatedUsers);
        });

        newSocket.on('updateHost', (hostId: string) => {
            setHost(hostId);
        });

        newSocket.on('adminSet', () => {
            setAdminSet(true);
        });

        newSocket.on(
            'gameStarted',
            ({ blackCard, users, cardCzar, scoreLimit }) => {
                setGameStarted(true);
                setBlackCard(blackCard);
                setCardCzar(cardCzar);
                setScoreLimit(scoreLimit);
                setGameOver(false);
                setHasSubmitted(false);
                setSubmittedCards([]);
                setUsers(users);

                const me = users.find((user: User) => user.id === newSocket.id);
                if (me) {
                    setMyWhiteCards(me.whiteCards || []);
                }
            }
        );

        newSocket.on('updateHand', (newHand) => {
            setMyWhiteCards(newHand);
        });

        newSocket.on('updateScoreLimit', (newLimit) => {
            setScoreLimit(newLimit);
        });

        newSocket.on('allCardsSubmitted', ({ submissions }) => {
            setSubmittedCards(submissions);
        });

        newSocket.on('winnerSelected', ({ winner, winningSubmission }) => {
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

        newSocket.on('nextRound', ({ blackCard, cardCzar, users }) => {
            setBlackCard(blackCard);
            setCardCzar(cardCzar);
            setUsers(users);
            setSubmittedCards([]);
            setSelectedCards([]);
            setHasSubmitted(false);
            setHasSelectedWinner(false);

            const me = users.find((user: User) => user.id === newSocket.id);
            if (me) {
                setMyWhiteCards(me.whiteCards || []);
            }
        });

        newSocket.on('announceTopPlayers', (topPlayers: User[]) => {
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
            setGameStarted(false); // Add this line
            setSubmittedCards([]); // Clear submitted cards
            setSelectedCards([]); // Reset selected cards
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

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
            !hasSubmitted
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
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl w-full">
                {' '}
                {/* Increase max width */}
                <h1 className="text-3xl font-bold mb-4 text-center text-black">
                    CardsClone
                </h1>
                {/* Nickname Input */}
                <div className="mb-4">
                    <label
                        htmlFor="nickname"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Enter Your Nickname
                    </label>
                    <input
                        id="nickname"
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                        placeholder="Your Nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                </div>
                {/* Admin/Start Game Logic */}
                {socket?.id === host ? (
                    <div className="flex justify-center mb-4">
                        {!adminSet ? (
                            <button
                                onClick={handleBecomeAdmin}
                                className={`px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none ${
                                    !nickname
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                }`}
                                disabled={!nickname || gameStarted}
                            >
                                Become Admin
                            </button>
                        ) : (
                            <div className="flex justify-center mb-4">
                                {!gameStarted &&
                                    !winningSubmission &&
                                    !gameOver && (
                                        <button
                                            onClick={handleStartGame}
                                            className={`px-4 py-2 font-semibold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 focus:outline-none`}
                                            disabled={gameStarted}
                                        >
                                            Start Game
                                        </button>
                                    )}
                                {gameOver && (
                                    <button
                                        onClick={handleStartNewRound}
                                        className="px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
                                    >
                                        Start New Round
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    (!gameStarted || gameOver) && (
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={handleSetNickname}
                                className={`px-4 py-2 font-semibold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 focus:outline-none ${
                                    !nickname
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                }`}
                                disabled={!nickname}
                            >
                                Set Username and Join Lobby
                            </button>
                        </div>
                    )
                )}
                {socket?.id === host && (!gameStarted || gameOver) && (
                    <div className="flex flex-col items-center mb-4">
                        <label
                            htmlFor="scoreLimit"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Set Score Limit
                        </label>
                        <input
                            id="scoreLimit"
                            type="number"
                            className="mt-1 block w-20 text-center px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                            value={gameSettings.pointsToWin}
                            onChange={(e) =>
                                setGameSettings({
                                    ...gameSettings,
                                    pointsToWin: Number(e.target.value),
                                })
                            }
                        />
                        <button
                            onClick={() =>
                                socket.emit(
                                    'setScoreLimit',
                                    gameSettings.pointsToWin
                                )
                            }
                            className="mt-4 px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
                        >
                            Set Score Limit
                        </button>
                    </div>
                )}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-black">
                        Leaderboard
                    </h2>
                    <div className="flex flex-col gap-2">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className={`flex items-center justify-between p-2 rounded-lg shadow-sm text-black ${
                                    user.id === cardCzar?.id
                                        ? 'bg-yellow-200 font-bold'
                                        : 'bg-gray-200'
                                }`}
                            >
                                <span>
                                    {user.nickname || 'Anonymous'}
                                    {user.id === cardCzar?.id && ' (Card Czar)'}
                                </span>
                                <span className="text-sm">
                                    Points: {user.points}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-center mt-4 text-black">
                        Score Limit: {scoreLimit}
                    </p>
                </div>
                {gameStarted && !gameOver && (
                    <div>
                        <div className="text-center text-lg font-semibold text-green-500 mb-4">
                            {/* Styled Black Card */}
                            <div className="bg-black text-white p-6 rounded-lg shadow-md">
                                {blackCard?.text}
                            </div>

                            {/* Submitted Cards */}
                            {submittedCards.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold mb-4 text-center">
                                        Submitted Cards
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {submittedCards.map(
                                            ({ cards, user }, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() =>
                                                        socket &&
                                                        cardCzar?.id ===
                                                            socket.id &&
                                                        !hasSelectedWinner &&
                                                        handleSelectWinner({
                                                            user,
                                                            cards,
                                                        })
                                                    }
                                                    className={`bg-white text-black p-4 rounded-lg shadow-md ${
                                                        socket &&
                                                        cardCzar?.id ===
                                                            socket.id &&
                                                        !hasSelectedWinner
                                                            ? 'cursor-pointer'
                                                            : ''
                                                    } ${
                                                        winningSubmission &&
                                                        winningSubmission.user
                                                            .id === user.id
                                                            ? 'border-2 border-yellow-500'
                                                            : ''
                                                    }`}
                                                >
                                                    {cards.map((card, idx) => (
                                                        <p
                                                            key={idx}
                                                            className="mb-2 last:mb-0"
                                                        >
                                                            {card.text}
                                                        </p>
                                                    ))}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Show the Card Czar */}
                            <p className="text-sm mt-4">
                                Card Czar:{' '}
                                {cardCzar?.nickname
                                    ? cardCzar.nickname
                                    : 'Unknown'}
                            </p>
                        </div>

                        {/* White Cards */}
                        <div className="grid grid-cols-5 gap-2 mt-4">
                            {myWhiteCards.map((card, index) => {
                                const isSelected = selectedCards.some(
                                    (c) => c.text === card.text
                                );
                                return (
                                    <div
                                        key={index}
                                        onClick={() =>
                                            !hasSubmitted &&
                                            handleSelectCard(card)
                                        }
                                        className={`bg-white text-black text-center p-2 rounded-lg shadow-md ${
                                            !hasSubmitted &&
                                            socket &&
                                            cardCzar?.id !== socket.id
                                                ? 'cursor-pointer'
                                                : 'cursor-not-allowed'
                                        } ${
                                            isSelected
                                                ? 'border-2 border-green-500'
                                                : ''
                                        } ${
                                            (socket &&
                                                cardCzar?.id === socket.id) ||
                                            hasSubmitted
                                                ? 'opacity-50'
                                                : ''
                                        }`}
                                    >
                                        {card.isBlank ? (
                                            <em>Blank Card</em>
                                        ) : (
                                            card.text
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Submit Button */}
                        {selectedCards.length === (blackCard?.blanks || 1) &&
                            socket &&
                            cardCzar?.id !== socket.id &&
                            !hasSubmitted && (
                                <div className="flex justify-center mt-4">
                                    <button
                                        onClick={handleSubmitCards}
                                        className="px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
                                    >
                                        Submit Cards
                                    </button>
                                </div>
                            )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardGamePage;
