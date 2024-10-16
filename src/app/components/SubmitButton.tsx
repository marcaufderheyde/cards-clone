import { User } from '@/types';
import React from 'react';
import { Socket } from 'socket.io-client';

interface SubmitButtonProps {
    selectedCards: { text: string; isBlank?: boolean }[];
    blackCard: { text: string; blanks: number } | null;
    handleSubmitCards: () => void;
    hasSubmitted: boolean;
    cardCzar: User | null;
    socket: Socket | undefined;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
    selectedCards,
    blackCard,
    handleSubmitCards,
    hasSubmitted,
    cardCzar,
    socket,
}) => {
    return (
        <>
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
        </>
    );
};

export default SubmitButton;
