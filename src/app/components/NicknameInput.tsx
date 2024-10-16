import React from 'react';
import { Socket } from 'socket.io-client';

interface NicknameInputProps {
    nickname: string;
    setNickname: (nickname: string) => void;
    handleSetNickname: () => void;
    socket: Socket | undefined;
    gameStarted: boolean;
    gameOver: boolean;
    host: string | null;
    isInLobby: boolean;
}

const NicknameInput: React.FC<NicknameInputProps> = ({
    nickname,
    setNickname,
    handleSetNickname,
    socket,
    gameStarted,
    gameOver,
    host,
    isInLobby,
}) => {
    return (
        <>
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
            {/* Join Lobby Button */}
            {socket?.id !== host && (!gameStarted || gameOver) && (
                <div className="flex justify-center mb-4">
                    <button
                        onClick={handleSetNickname}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
                        disabled={gameStarted || gameOver || !nickname}
                    >
                        {isInLobby
                            ? 'Set Username'
                            : 'Set Username and Join Lobby'}
                    </button>
                </div>
            )}
        </>
    );
};

export default NicknameInput;
