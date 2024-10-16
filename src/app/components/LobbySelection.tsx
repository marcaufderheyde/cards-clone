const LobbySelection: React.FC<{
    onSelectLobby: (lobbyId: string) => void;
}> = ({ onSelectLobby }) => {
    return (
        <div className="mb-4">
            <h2 className="text-xl font-bold mb-2 text-center text-black">
                Select a Lobby
            </h2>
            <div className="flex flex-col items-center">
                {}
                <button
                    onClick={() => onSelectLobby('lobby1')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-2 w-full"
                >
                    Lobby 1
                </button>
                <button
                    onClick={() => onSelectLobby('lobby2')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-2 w-full"
                >
                    Lobby 2
                </button>
                <button
                    onClick={() => onSelectLobby('lobby3')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-2 w-full"
                >
                    Lobby 3
                </button>
                <button
                    onClick={() => onSelectLobby('lobby4')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-2 w-full"
                >
                    Lobby 4
                </button>
                <button
                    onClick={() => onSelectLobby('lobby5')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-2 w-full"
                >
                    Lobby 5
                </button>
                <button
                    onClick={() => onSelectLobby('lobby6')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-2 w-full"
                >
                    Lobby 6
                </button>
                <button
                    onClick={() => onSelectLobby('lobby7')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-2 w-full"
                >
                    Lobby 7
                </button>
                <button
                    onClick={() => onSelectLobby('lobby8')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-2 w-full"
                >
                    Lobby 8
                </button>
                <button
                    onClick={() => onSelectLobby('lobby9')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-2 w-full"
                >
                    Lobby 9
                </button>
                <button
                    onClick={() => onSelectLobby('lobby10')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-2 w-full"
                >
                    Lobby 10
                </button>
            </div>
        </div>
    );
};

export default LobbySelection;
