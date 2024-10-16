export interface Card {
    id: string;
    text: string;
    type: 'black' | 'white';
  }
  
  export interface Player {
    id: string;
    name: string;
    hand: Card[];
    score: number;
  }
  
  export interface GameState {
    players: Player[];
    blackDeck: Card[];
    whiteDeck: Card[];
    currentBlackCard: Card | null;
    currentPlayerTurn: string; // Player ID who is currently the Card Czar
    pointsToWin: number;
  }
  
  export interface GameSettings {
    pointsToWin: number;
}

export interface User {
    id: string;
    nickname?: string;
    whiteCards?: { text: string }[];
    points: number;
}

export interface Submission {
    user: User;
    cards: { text: string; isCustom?: boolean; isBlank?: boolean }[];
}

export interface WhiteCard {
    text: string;
    isBlank?: boolean;
}