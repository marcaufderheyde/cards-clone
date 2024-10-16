import { User } from '@/types';
import React from 'react';

interface LeaderboardProps {
    users: User[];
    cardCzar: User | null;
    scoreLimit: number;
    highlight: boolean;
    gameWinner: User | null;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
    users,
    cardCzar,
    scoreLimit,
    highlight,
    gameWinner,
}) => {
    return (
        <div
            className={`mt-4 p-4 rounded-lg shadow-md ${
                highlight ? 'animate-highlight' : 'bg-gray-100'
            }`}
        >
            {' '}
            <h2 className="text-lg font-semibold mb-4 text-black">
                Leaderboard
            </h2>
            <div className="flex flex-col gap-2">
                {users
                    .sort((a, b) => b.points - a.points)
                    .map((user) => {
                        const isGameWinner = gameWinner?.id === user.id;
                        return (
                            <div
                                key={user.id}
                                className={`flex items-center justify-between p-2 rounded-lg shadow-sm text-black ${
                                    isGameWinner
                                        ? 'font-bold text-green-500'
                                        : ''
                                }`}
                            >
                                <span className="text-black">
                                    {user.nickname || 'Anonymous'}
                                    {(user.id === cardCzar?.id &&
                                        ' (Card Czar)') ||
                                        (user.id === cardCzar?.id &&
                                            ' (Winner)' &&
                                            isGameWinner)}
                                </span>
                                <span className="text-sm text-black right-0">
                                    Points: {user.points}
                                </span>
                            </div>
                        );
                    })}
            </div>
            <p className="text-sm text-center mt-4 text-black">
                Score Limit: {scoreLimit}
            </p>
        </div>
    );
};

export default Leaderboard;
