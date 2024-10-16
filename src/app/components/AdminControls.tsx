import { GameSettings, Submission } from '@/types';
import React from 'react';
import { Socket } from 'socket.io-client';

interface AdminControlsProps {
    socket: Socket | undefined;
    host: string | null;
    nickname: string;
    adminSet: boolean;
    gameStarted: boolean;
    gameOver: boolean;
    winningSubmission: Submission | null;
    handleBecomeAdmin: () => void;
    handleStartGame: () => void;
    handleStartNewRound: () => void;
    gameSettings: GameSettings;
    setGameSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
}

const AdminControls: React.FC<AdminControlsProps> = ({
    socket,
    host,
    nickname,
    adminSet,
    gameStarted,
    gameOver,
    winningSubmission,
    handleBecomeAdmin,
    handleStartGame,
    handleStartNewRound,
    gameSettings,
    setGameSettings,
}) => {
    return (
        <>
            {socket?.id === host ? (
                <div className="flex justify-center mb-4">
                    {!adminSet ? (
                        <button
                            onClick={handleBecomeAdmin}
                            className={`px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none ${
                                !nickname ? 'opacity-50 cursor-not-allowed' : ''
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
            ) : null}
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
        </>
    );
};

export default AdminControls;
