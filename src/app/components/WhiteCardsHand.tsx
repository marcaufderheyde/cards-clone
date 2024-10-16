import React from 'react';
import { WhiteCard, User } from '@/types';
import { Socket } from 'socket.io-client';

interface WhiteCardsHandProps {
    myWhiteCards: WhiteCard[];
    selectedCards: { text: string; isBlank?: boolean }[];
    handleSelectCard: (card: WhiteCard) => void;
    hasSubmitted: boolean;
    cardCzar: User | null;
    socket: Socket | undefined;
    submissionTimeEnded: boolean;
}

const WhiteCardsHand: React.FC<WhiteCardsHandProps> = ({
    myWhiteCards,
    selectedCards,
    handleSelectCard,
    hasSubmitted,
    cardCzar,
    socket,
    submissionTimeEnded,
}) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
            {myWhiteCards.map((card, index) => {
                const isSelected = selectedCards.some(
                    (c) => c.text === card.text
                );
                return (
                    <div
                        key={index}
                        onClick={() =>
                            !hasSubmitted &&
                            !submissionTimeEnded && // Add this condition
                            handleSelectCard(card)
                        }
                        className={`bg-white text-black text-center p-2 rounded-lg shadow-md ${
                            !hasSubmitted &&
                            !submissionTimeEnded && // Add this condition
                            socket &&
                            cardCzar?.id !== socket.id
                                ? 'cursor-pointer'
                                : 'cursor-not-allowed'
                        } ${isSelected ? 'border-2 border-green-500' : ''} ${
                            (socket && cardCzar?.id === socket.id) ||
                            hasSubmitted ||
                            submissionTimeEnded // Add this condition
                                ? 'opacity-50'
                                : ''
                        }`}
                    >
                        {card.isBlank ? <em>Blank Card</em> : card.text}
                    </div>
                );
            })}
        </div>
    );
};

export default WhiteCardsHand;
