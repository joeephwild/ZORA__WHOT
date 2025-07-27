# WHOT Game Smart Contract

A comprehensive smart contract for the WHOT card game built on Base blockchain, featuring ERC1155 tokens for game cards, multiplayer gameplay, and prize pools.

## Features

### Game Mechanics
- **Multiplayer Support**: 2-4 players per game
- **Card Types**: Number cards (1-14) and special cards (WHOT, Pick Two, Pick Three, etc.)
- **Game States**: Waiting, Active, Finished
- **Turn Management**: Clockwise/counterclockwise direction with special card effects
- **Prize Pools**: Entry fees collected into prize pools for winners

### Special Cards
- **WHOT (20)**: Can be played on any card
- **Pick Two**: Next player draws 2 cards
- **Pick Three**: Next player draws 3 cards  
- **Suspension**: Skip next player's turn
- **Hold On**: Reverse game direction
- **General Market**: All players draw cards

### Smart Contract Features
- **ERC1155 Token Standard**: Each card type is a unique token
- **Signature Minting**: Secure card distribution
- **Game Management**: Create, join, and manage games
- **Player Statistics**: Track wins and games played
- **Platform Fees**: Configurable fee system
- **Private Games**: Create games with access codes

## Deployment

### Prerequisites
1. Node.js and npm installed
2. Hardhat development environment
3. Base Sepolia testnet ETH for deployment
4. Private key for deployment wallet

### Setup
1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Add your private key to `.env`:
```
PRIVATE_KEY=your_private_key_without_0x_prefix
```

### Deploy to Base Sepolia Testnet
```bash
npx hardhat run scripts/deploy-base.js --network baseSepolia
```

### Deploy using ThirdWeb
```bash
npm run deploy
```

## Contract Interface

### Core Functions

#### Game Management
- `createGame(uint256 entryFee, bool isPrivate, string gameCode)` - Create a new game
- `joinGame(uint256 gameId)` - Join an existing game
- `joinGameWithCode(string gameCode)` - Join private game with code
- `startGame(uint256 gameId)` - Manually start a game

#### Gameplay
- `playCard(uint256 gameId, uint256 cardId)` - Play a card
- `drawCard(uint256 gameId, uint256 amount)` - Draw cards from pile

#### View Functions
- `getGame(uint256 gameId)` - Get game details
- `getPlayerHand(uint256 gameId, address player)` - Get player's cards
- `getPlayerStats(address player)` - Get player statistics
- `getActiveGames()` - Get list of active games

### Events
- `GameCreated(uint256 gameId, address creator, uint256 entryFee, bool isPrivate)`
- `PlayerJoined(uint256 gameId, address player)`
- `GameStarted(uint256 gameId, address[] players)`
- `CardPlayed(uint256 gameId, address player, uint256 cardId)`
- `GameFinished(uint256 gameId, address winner, uint256 prizeAmount)`

## Game Rules

### Setup
1. Each player starts with 6 cards
2. One card is placed in the discard pile to start
3. Players take turns clockwise (unless reversed)

### Playing
1. Players must play a card that matches the last played card by:
   - Same card type/number
   - Special card rules
   - WHOT card (can be played anytime)
2. If unable to play, draw cards from pile
3. First player to empty their hand wins

### Special Card Effects
- **Pick Two/Three**: Next player draws cards and loses turn
- **Suspension**: Next player loses turn
- **Hold On**: Reverses play direction
- **WHOT**: Can be played on any card

## Network Configuration

### Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org

### Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Explorer**: https://basescan.org

## Security Features

- **Access Control**: Admin functions protected
- **Input Validation**: All user inputs validated
- **Reentrancy Protection**: Safe transfer patterns
- **Emergency Functions**: Admin can withdraw in emergencies

## Testing

Run the test suite:
```bash
npx hardhat test
```

## Verification

Verify contract on Basescan:
```bash
npx hardhat verify --network baseSepolia CONTRACT_ADDRESS "constructor_arg1" "constructor_arg2"
```

## License

Apache-2.0 License