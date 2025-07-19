import GameBoard from '@/components/game/GameBoard';

export default function PlayPage({ params }: { params: { gameId: string } }) {
    // This page is now exclusively for multiplayer games identified by a UUID.
    return <GameBoard gameId={params.gameId} />;
}
