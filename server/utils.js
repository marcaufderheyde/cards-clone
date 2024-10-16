function getRandomCard(deck) {
    return deck[Math.floor(Math.random() * deck.length)];
}

function getRandomCards(deck, numberOfCards) {
    return shuffleArray([...deck]).slice(0, numberOfCards);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = {
    getRandomCard,
    getRandomCards,
    shuffleArray,
};
