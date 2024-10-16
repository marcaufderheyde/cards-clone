import { Submission, User } from '@/types';
import React from 'react';
import { Socket } from 'socket.io-client';

interface GameBoardProps {
    blackCard: { text: string; blanks: number } | null;
    submittedCards: Submission[];
    cardCzar: User | null;
    socket: Socket | undefined;
    handleSelectWinner: (submission: Submission) => void;
    winningSubmission: Submission | null;
    hasSelectedWinner: boolean;
    totalPlayers: number;
    allSubmissionsReceived: boolean;
    currentSubmissionsCount: number;
    expectedSubmissionsCount: number;
}

const GameBoard: React.FC<GameBoardProps> = ({
    blackCard,
    submittedCards,
    cardCzar,
    socket,
    handleSelectWinner,
    winningSubmission,
    hasSelectedWinner,
    allSubmissionsReceived,
    currentSubmissionsCount,
    expectedSubmissionsCount,
}) => {
    return (
        <div className="text-center text-lg font-semibold text-green-500 mb-4">
            {/* Styled Black Card */}
            <div className="bg-black text-white p-6 rounded-lg shadow-md">
                {blackCard?.text}
            </div>

            {/* Submitted Cards */}
            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-4 text-center">
                    Submitted Cards
                </h3>
                {!allSubmissionsReceived ? (
                    <div>
                        <p>
                            {`Waiting for submissions... (${currentSubmissionsCount}/${
                                expectedSubmissionsCount || 'Unknown'
                            })`}
                        </p>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            {[...Array(currentSubmissionsCount)].map(
                                (_, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-500 text-black p-4 rounded-lg shadow-md"
                                    >
                                        <p className="text-white text-center">
                                            Card
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {submittedCards.map(({ cards, user }, index) => (
                            <div
                                key={index}
                                onClick={() =>
                                    socket &&
                                    cardCzar?.id === socket.id &&
                                    !hasSelectedWinner &&
                                    handleSelectWinner({
                                        user,
                                        cards,
                                    })
                                }
                                className={`bg-white text-black p-4 rounded-lg shadow-md ${
                                    socket &&
                                    cardCzar?.id === socket.id &&
                                    !hasSelectedWinner
                                        ? 'cursor-pointer'
                                        : ''
                                } ${
                                    winningSubmission &&
                                    winningSubmission.user.id === user.id
                                        ? 'border-2 border-yellow-500'
                                        : ''
                                }`}
                            >
                                {cards.map((card, idx) => (
                                    <p key={idx} className="mb-2 last:mb-0">
                                        {card.text}
                                    </p>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Show the Card Czar */}
            <p className="text-sm mt-4">
                Card Czar: {cardCzar?.nickname ? cardCzar.nickname : 'Unknown'}
            </p>
        </div>
    );
};

export default GameBoard;
