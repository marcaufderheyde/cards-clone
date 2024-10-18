function shuffleArray(array) {
    const shuffled = array.slice(); // Create a copy to avoid mutating the original array
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getRandomCard(deck) {
    return deck[Math.floor(Math.random() * deck.length)];
}

function getRandomCards(deck, numCards, excludeCards = []) {
    const excludeTexts = new Set(
        excludeCards.filter((card) => !card.isBlank).map((card) => card.text)
    );

    const availableCards = deck.filter(
        (card) => card.isBlank || !excludeTexts.has(card.text)
    );

    const shuffledDeck = shuffleArray(availableCards);
    const cardsToPick = Math.min(numCards, shuffledDeck.length);

    return shuffledDeck.slice(0, cardsToPick);
}

module.exports = { getRandomCards /*, other exports */ };

module.exports = {
    getRandomCard,
    getRandomCards,
    shuffleArray,
};
