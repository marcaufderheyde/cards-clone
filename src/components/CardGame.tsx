'use client';
import React, { useEffect, useState } from 'react';

interface Card {
    colour: string;
    text: string;
}

const CardGame: React.FC = () => {
    const [blackDeck, setBlackDeck] = useState<Card[]>([]);
    const [whiteDeck, setWhiteDeck] = useState<Card[]>([]);

    // Fetch data from public folder on component mount
    useEffect(() => {
        // Fetch black cards
        fetch('/black.json')
            .then((response) => response.json())
            .then((data) => setBlackDeck(data));

        // Fetch white cards
        fetch('/white.json')
            .then((response) => response.json())
            .then((data) => setWhiteDeck(data));
    }, []);

    return (
        <div>
            <h2>Black Cards</h2>
            <ul>
                {blackDeck.map((card, index) => (
                    <li key={index}>{card.text}</li>
                ))}
            </ul>

            <h2>White Cards</h2>
            <ul>
                {whiteDeck.map((card, index) => (
                    <li key={index}>{card.text}</li>
                ))}
            </ul>
        </div>
    );
};

export default CardGame;
