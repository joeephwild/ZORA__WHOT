// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC1155SignatureMint.sol";

contract WHOTGame is ERC1155SignatureMint {
    // Game constants
    uint256 public constant TOTAL_CARDS = 54;
    uint256 public constant CARDS_PER_PLAYER = 6;
    uint256 public constant MAX_PLAYERS = 4;
    uint256 public constant MIN_PLAYERS = 2;
    
    // Card types (token IDs)
    enum CardType { 
        NUMBER_1, NUMBER_2, NUMBER_3, NUMBER_4, NUMBER_5, NUMBER_7, NUMBER_8, 
        NUMBER_10, NUMBER_11, NUMBER_12, NUMBER_13, NUMBER_14,
        WHOT_20, PICK_TWO, PICK_THREE, GENERAL_MARKET, HOLD_ON, SUSPENSION
    }
    
    enum GameState { WAITING, ACTIVE, FINISHED }
    enum Direction { CLOCKWISE, COUNTERCLOCKWISE }
    
    // Game structures
    struct Game {
        uint256 gameId;
        address[] players;
        address currentPlayer;
        uint256 currentPlayerIndex;
        GameState state;
        Direction direction;
        uint256 lastPlayedCard;
        uint256 drawPile;
        uint256 discardPile;
        address winner;
        uint256 createdAt;
        uint256 entryFee;
        uint256 prizePool;
        bool isPrivate;
        string gameCode;
    }
    
    struct Player {
        address playerAddress;
        uint256[] hand;
        bool isActive;
        uint256 gamesWon;
        uint256 gamesPlayed;
    }
    
    // State variables
    mapping(uint256 => Game) public games;
    mapping(address => Player) public players;
    mapping(uint256 => mapping(address => uint256[])) public gamePlayerHands;
    mapping(uint256 => uint256[]) public gameDrawPiles;
    mapping(uint256 => uint256[]) public gameDiscardPiles;
    mapping(string => uint256) public gameCodeToId;
    
    uint256 public gameCounter;
    uint256 public platformFeePercentage = 5; // 5% platform fee
    address public feeRecipient;
    
    // Events
    event GameCreated(uint256 indexed gameId, address indexed creator, uint256 entryFee, bool isPrivate);
    event PlayerJoined(uint256 indexed gameId, address indexed player);
    event GameStarted(uint256 indexed gameId, address[] players);
    event CardPlayed(uint256 indexed gameId, address indexed player, uint256 cardId);
    event CardDrawn(uint256 indexed gameId, address indexed player, uint256 amount);
    event GameFinished(uint256 indexed gameId, address indexed winner, uint256 prizeAmount);
    event DirectionChanged(uint256 indexed gameId, Direction newDirection);
    
    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps,
        address _primarySaleRecipient,
        address _feeRecipient
    )
        ERC1155SignatureMint(
            _defaultAdmin,
            _name,
            _symbol,
            _royaltyRecipient,
            _royaltyBps,
            _primarySaleRecipient
        )
    {
        feeRecipient = _feeRecipient;
        _initializeCardSupply();
    }
    
    // Initialize card supply for the game
    function _initializeCardSupply() internal {
        // Mint initial card supply to contract
        for (uint256 i = 0; i < uint256(CardType.SUSPENSION) + 1; i++) {
            _mint(address(this), i, 100, ""); // Mint 100 of each card type
        }
    }
    
    // Create a new game
    function createGame(uint256 _entryFee, bool _isPrivate, string memory _gameCode) external payable returns (uint256) {
        require(msg.value >= _entryFee, "Insufficient entry fee");
        require(!_isPrivate || bytes(_gameCode).length > 0, "Private games need a code");
        
        gameCounter++;
        uint256 gameId = gameCounter;
        
        Game storage newGame = games[gameId];
        newGame.gameId = gameId;
        newGame.players.push(msg.sender);
        newGame.state = GameState.WAITING;
        newGame.direction = Direction.CLOCKWISE;
        newGame.createdAt = block.timestamp;
        newGame.entryFee = _entryFee;
        newGame.prizePool = msg.value;
        newGame.isPrivate = _isPrivate;
        newGame.gameCode = _gameCode;
        
        if (_isPrivate) {
            gameCodeToId[_gameCode] = gameId;
        }
        
        // Initialize player if not exists
        if (players[msg.sender].playerAddress == address(0)) {
            players[msg.sender].playerAddress = msg.sender;
            players[msg.sender].isActive = true;
        }
        
        emit GameCreated(gameId, msg.sender, _entryFee, _isPrivate);
        return gameId;
    }
    
    // Join an existing game
    function joinGame(uint256 _gameId) external payable {
        Game storage game = games[_gameId];
        require(game.state == GameState.WAITING, "Game not accepting players");
        require(game.players.length < MAX_PLAYERS, "Game is full");
        require(msg.value >= game.entryFee, "Insufficient entry fee");
        require(!_isPlayerInGame(_gameId, msg.sender), "Already in game");
        
        game.players.push(msg.sender);
        game.prizePool += msg.value;
        
        // Initialize player if not exists
        if (players[msg.sender].playerAddress == address(0)) {
            players[msg.sender].playerAddress = msg.sender;
            players[msg.sender].isActive = true;
        }
        
        emit PlayerJoined(_gameId, msg.sender);
        
        // Auto-start if we have enough players
        if (game.players.length >= MIN_PLAYERS) {
            _startGame(_gameId);
        }
    }
    
    // Join game with code (for private games)
    function joinGameWithCode(string memory _gameCode) external payable {
        uint256 gameId = gameCodeToId[_gameCode];
        require(gameId > 0, "Invalid game code");
        this.joinGame{value: msg.value}(gameId);
    }
    
    // Start a game manually (if creator wants to start with minimum players)
    function startGame(uint256 _gameId) external {
        Game storage game = games[_gameId];
        require(game.players[0] == msg.sender, "Only creator can start");
        require(game.players.length >= MIN_PLAYERS, "Need minimum players");
        require(game.state == GameState.WAITING, "Game already started");
        
        _startGame(_gameId);
    }
    
    // Internal function to start the game
    function _startGame(uint256 _gameId) internal {
        Game storage game = games[_gameId];
        game.state = GameState.ACTIVE;
        game.currentPlayer = game.players[0];
        game.currentPlayerIndex = 0;
        
        // Deal cards to players
        _dealCards(_gameId);
        
        // Set up initial discard pile
        uint256 initialCard = _drawRandomCard();
        gameDiscardPiles[_gameId].push(initialCard);
        game.lastPlayedCard = initialCard;
        
        // Update player stats
        for (uint256 i = 0; i < game.players.length; i++) {
            players[game.players[i]].gamesPlayed++;
        }
        
        emit GameStarted(_gameId, game.players);
    }
    
    // Deal cards to all players
    function _dealCards(uint256 _gameId) internal {
        Game storage game = games[_gameId];
        
        for (uint256 i = 0; i < game.players.length; i++) {
            address player = game.players[i];
            for (uint256 j = 0; j < CARDS_PER_PLAYER; j++) {
                uint256 cardId = _drawRandomCard();
                gamePlayerHands[_gameId][player].push(cardId);
                _safeTransferFrom(address(this), player, cardId, 1, "");
            }
        }
    }
    
    // Play a card
    function playCard(uint256 _gameId, uint256 _cardId) external {
        Game storage game = games[_gameId];
        require(game.state == GameState.ACTIVE, "Game not active");
        require(msg.sender == game.currentPlayer, "Not your turn");
        require(_hasCard(_gameId, msg.sender, _cardId), "Don't have this card");
        require(_isValidPlay(_gameId, _cardId), "Invalid card play");
        
        // Remove card from player's hand
        _removeCardFromHand(_gameId, msg.sender, _cardId);
        
        // Add to discard pile
        gameDiscardPiles[_gameId].push(_cardId);
        game.lastPlayedCard = _cardId;
        
        // Transfer card back to contract
        _safeTransferFrom(msg.sender, address(this), _cardId, 1, "");
        
        // Handle special card effects
        _handleSpecialCard(_gameId, _cardId);
        
        // Check for winner
        if (gamePlayerHands[_gameId][msg.sender].length == 0) {
            _endGame(_gameId, msg.sender);
            return;
        }
        
        // Move to next player
        _nextPlayer(_gameId);
        
        emit CardPlayed(_gameId, msg.sender, _cardId);
    }
    
    // Draw cards from pile
    function drawCard(uint256 _gameId, uint256 _amount) external {
        Game storage game = games[_gameId];
        require(game.state == GameState.ACTIVE, "Game not active");
        require(msg.sender == game.currentPlayer, "Not your turn");
        require(_amount > 0 && _amount <= 3, "Invalid draw amount");
        
        for (uint256 i = 0; i < _amount; i++) {
            uint256 cardId = _drawRandomCard();
            gamePlayerHands[_gameId][msg.sender].push(cardId);
            _safeTransferFrom(address(this), msg.sender, cardId, 1, "");
        }
        
        // Move to next player after drawing
        _nextPlayer(_gameId);
        
        emit CardDrawn(_gameId, msg.sender, _amount);
    }
    
    // Handle special card effects
    function _handleSpecialCard(uint256 _gameId, uint256 _cardId) internal {
        Game storage game = games[_gameId];
        CardType cardType = CardType(_cardId);
        
        if (cardType == CardType.PICK_TWO) {
            // Next player draws 2 cards
            _nextPlayer(_gameId);
            address nextPlayer = game.currentPlayer;
            for (uint256 i = 0; i < 2; i++) {
                uint256 cardId = _drawRandomCard();
                gamePlayerHands[_gameId][nextPlayer].push(cardId);
                _safeTransferFrom(address(this), nextPlayer, cardId, 1, "");
            }
        } else if (cardType == CardType.PICK_THREE) {
            // Next player draws 3 cards
            _nextPlayer(_gameId);
            address nextPlayer = game.currentPlayer;
            for (uint256 i = 0; i < 3; i++) {
                uint256 cardId = _drawRandomCard();
                gamePlayerHands[_gameId][nextPlayer].push(cardId);
                _safeTransferFrom(address(this), nextPlayer, cardId, 1, "");
            }
        } else if (cardType == CardType.SUSPENSION) {
            // Skip next player
            _nextPlayer(_gameId);
            _nextPlayer(_gameId);
        } else if (cardType == CardType.HOLD_ON) {
            // Reverse direction
            game.direction = game.direction == Direction.CLOCKWISE ? 
                Direction.COUNTERCLOCKWISE : Direction.CLOCKWISE;
            emit DirectionChanged(_gameId, game.direction);
        }
    }
    
    // Move to next player
    function _nextPlayer(uint256 _gameId) internal {
        Game storage game = games[_gameId];
        
        if (game.direction == Direction.CLOCKWISE) {
            game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
        } else {
            game.currentPlayerIndex = game.currentPlayerIndex == 0 ? 
                game.players.length - 1 : game.currentPlayerIndex - 1;
        }
        
        game.currentPlayer = game.players[game.currentPlayerIndex];
    }
    
    // End the game
    function _endGame(uint256 _gameId, address _winner) internal {
        Game storage game = games[_gameId];
        game.state = GameState.FINISHED;
        game.winner = _winner;
        
        // Update winner stats
        players[_winner].gamesWon++;
        
        // Calculate and distribute prize
        uint256 platformFee = (game.prizePool * platformFeePercentage) / 100;
        uint256 winnerPrize = game.prizePool - platformFee;
        
        // Transfer prize to winner
        payable(_winner).transfer(winnerPrize);
        
        // Transfer platform fee
        if (platformFee > 0) {
            payable(feeRecipient).transfer(platformFee);
        }
        
        emit GameFinished(_gameId, _winner, winnerPrize);
    }
    
    // Utility functions
    function _isPlayerInGame(uint256 _gameId, address _player) internal view returns (bool) {
        Game storage game = games[_gameId];
        for (uint256 i = 0; i < game.players.length; i++) {
            if (game.players[i] == _player) {
                return true;
            }
        }
        return false;
    }
    
    function _hasCard(uint256 _gameId, address _player, uint256 _cardId) internal view returns (bool) {
        uint256[] memory hand = gamePlayerHands[_gameId][_player];
        for (uint256 i = 0; i < hand.length; i++) {
            if (hand[i] == _cardId) {
                return true;
            }
        }
        return false;
    }
    
    function _removeCardFromHand(uint256 _gameId, address _player, uint256 _cardId) internal {
        uint256[] storage hand = gamePlayerHands[_gameId][_player];
        for (uint256 i = 0; i < hand.length; i++) {
            if (hand[i] == _cardId) {
                hand[i] = hand[hand.length - 1];
                hand.pop();
                break;
            }
        }
    }
    
    function _isValidPlay(uint256 _gameId, uint256 _cardId) internal view returns (bool) {
        Game storage game = games[_gameId];
        uint256 lastCard = game.lastPlayedCard;
        
        // WHOT cards can be played on anything
        if (_cardId == uint256(CardType.WHOT_20)) {
            return true;
        }
        
        // Same type cards can be played on each other
        if (_cardId == lastCard) {
            return true;
        }
        
        // Special cards can usually be played on each other
        if (_isSpecialCard(_cardId) && _isSpecialCard(lastCard)) {
            return true;
        }
        
        // Number cards of same value can be played
        if (_isNumberCard(_cardId) && _isNumberCard(lastCard)) {
            return _getCardNumber(_cardId) == _getCardNumber(lastCard);
        }
        
        return false;
    }
    
    function _isSpecialCard(uint256 _cardId) internal pure returns (bool) {
        return _cardId >= uint256(CardType.WHOT_20);
    }
    
    function _isNumberCard(uint256 _cardId) internal pure returns (bool) {
        return _cardId <= uint256(CardType.NUMBER_14);
    }
    
    function _getCardNumber(uint256 _cardId) internal pure returns (uint256) {
        if (_cardId <= uint256(CardType.NUMBER_5)) {
            return _cardId + 1;
        } else if (_cardId == uint256(CardType.NUMBER_7)) {
            return 7;
        } else if (_cardId == uint256(CardType.NUMBER_8)) {
            return 8;
        } else if (_cardId >= uint256(CardType.NUMBER_10) && _cardId <= uint256(CardType.NUMBER_14)) {
            return _cardId - uint256(CardType.NUMBER_10) + 10;
        }
        return 0;
    }
    
    function _drawRandomCard() internal view returns (uint256) {
        // Simple pseudo-random card selection
        uint256 randomNum = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            gameCounter
        )));
        return randomNum % (uint256(CardType.SUSPENSION) + 1);
    }
    
    // View functions
    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }
    
    function getPlayerHand(uint256 _gameId, address _player) external view returns (uint256[] memory) {
        return gamePlayerHands[_gameId][_player];
    }
    
    function getPlayerStats(address _player) external view returns (Player memory) {
        return players[_player];
    }
    
    function getActiveGames() external view returns (uint256[] memory) {
        uint256[] memory activeGames = new uint256[](gameCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].state == GameState.WAITING || games[i].state == GameState.ACTIVE) {
                activeGames[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeGames[i];
        }
        
        return result;
    }
    
    // Admin functions
    function setPlatformFee(uint256 _feePercentage) external {
        require(_canSetOwner(), "Not authorized");
        require(_feePercentage <= 10, "Fee too high");
        platformFeePercentage = _feePercentage;
    }
    
    function setFeeRecipient(address _feeRecipient) external {
        require(_canSetOwner(), "Not authorized");
        feeRecipient = _feeRecipient;
    }
    
    function emergencyWithdraw() external {
        require(_canSetOwner(), "Not authorized");
        payable(msg.sender).transfer(address(this).balance);
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}