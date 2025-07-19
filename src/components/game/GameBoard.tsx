'use client';
import { WhotCard } from "./WhotCard";
import { PLAYER_HAND, AI_HAND, DISCARD_PILE_TOP_CARD } from "@/lib/whot";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Swords, Bot, Clock } from "lucide-react";


export default function GameBoard() {
  return (
    <div className="bg-background min-h-screen w-full flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-primary/5"></div>
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full filter blur-3xl"></div>

        <div className="relative w-full max-w-7xl h-[95vh] flex flex-col justify-between">
            {/* Opponent Area */}
            <div className="w-full flex flex-col items-center">
                <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm p-2 rounded-lg shadow-md mb-3">
                    <Avatar>
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold">AI Player</h3>
                        <p className="text-xs text-muted-foreground">Thinking...</p>
                    </div>
                     <Badge variant="destructive">OPPONENT</Badge>
                </div>
                <div className="flex justify-center items-end h-28">
                    {AI_HAND.map((card, index) => (
                        <div key={card.id} className="w-16 -mx-3 transform transition-transform duration-300 hover:-translate-y-2">
                            <WhotCard card={card} isFaceDown />
                        </div>
                    ))}
                </div>
            </div>

            {/* Center Piles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-4 sm:gap-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-24 sm:w-28 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                        <WhotCard card={{id: 99, shape: 'whot', number: 20}} isFaceDown />
                    </div>
                     <Button variant="outline" size="sm">Draw Card</Button>
                </div>
                <Swords className="w-8 h-8 text-muted-foreground/50" />
                <div className="flex flex-col items-center gap-2">
                    <div className="w-24 sm:w-28 transform-gpu transition-transform duration-500">
                        <WhotCard card={DISCARD_PILE_TOP_CARD} />
                    </div>
                     <p className="text-xs font-semibold text-muted-foreground">Play Pile</p>
                </div>
            </div>
            
            {/* Player Area */}
            <div className="w-full flex flex-col items-center">
                <div className="flex justify-center items-start h-40">
                    {PLAYER_HAND.map((card, index) => (
                        <div key={card.id} className="w-20 sm:w-24 -mx-4 sm:-mx-6 transform transition-transform duration-300 hover:-translate-y-4 hover:z-10 cursor-pointer">
                            <WhotCard card={card} />
                        </div>
                    ))}
                </div>
                 <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm p-2 rounded-lg shadow-md mt-3">
                    <Avatar>
                        <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold">You</h3>
                        <p className="text-xs text-muted-foreground">Your turn</p>
                    </div>
                    <Badge variant="default" className="bg-accent text-accent-foreground">YOUR TURN</Badge>
                </div>
            </div>
        </div>
    </div>
  );
}
