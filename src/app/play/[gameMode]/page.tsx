import GameBoard from '@/components/game/GameBoard';

export default function PlayPage({ params }: { params: { gameId: string } }) {
    return <GameBoard gameId={params.gameId} />;
}
