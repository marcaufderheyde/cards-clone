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
    lobbyId: string | null;
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
    lobbyId,
}) => {
    const handleScoreLimitChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newLimit = parseInt(event.target.value, 10);
        setGameSettings((prevSettings) => ({
            ...prevSettings,
            pointsToWin: newLimit,
        }));

        if (socket && host === socket.id && lobbyId) {
            socket.emit('setScoreLimit', { newLimit, lobbyId });
        }
    };

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
            {adminSet && !gameStarted && !gameOver && (
                <div className="flex flex-col items-center mb-4 text-black">
                    <label htmlFor="scoreLimit">Score Limit:</label>
                    <input
                        type="number"
                        id="scoreLimit"
                        value={gameSettings.pointsToWin}
                        onChange={handleScoreLimitChange}
                        className="mt-1 block  border border-gray-300 rounded-md shadow-sm text-center"
                    />
                </div>
            )}
        </>
    );
};

export default AdminControls;
