import { User } from '@/types';
import React from 'react';

interface LeaderboardProps {
    users: User[];
    cardCzar: User | null;
    scoreLimit: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
    users,
    cardCzar,
    scoreLimit,
}) => {
    return (
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
                        <span className="text-sm">Points: {user.points}</span>
                    </div>
                ))}
            </div>
            <p className="text-sm text-center mt-4 text-black">
                Score Limit: {scoreLimit}
            </p>
        </div>
    );
};

export default Leaderboard;
