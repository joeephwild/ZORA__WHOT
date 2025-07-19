import GameBoard from '@/components/game/GameBoard';

export default function PlayPage({ params }: { params: { gameMode: string } }) {
    return <GameBoard gameMode={params.gameMode} />;
}
