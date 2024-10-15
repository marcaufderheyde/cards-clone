// src/components/Card.tsx
import React from 'react';
import { Card as CardType } from '../types';

interface CardProps {
    card: CardType;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ card, onClick }) => {
    return (
        <div
            className={`card ${card.type}`}
            onClick={onClick}
            style={{
                border:
                    card.type === 'black'
                        ? '2px solid black'
                        : '2px solid white',
                backgroundColor: card.type === 'black' ? 'black' : 'white',
                color: card.type === 'black' ? 'white' : 'black',
            }}
        >
            <p>{card.text}</p>
        </div>
    );
};

export default Card;
