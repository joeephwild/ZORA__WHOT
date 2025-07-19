import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { WhotCard } from './WhotCard';
import type { Card } from '@/lib/whot';

interface GameInstructionsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const rules = [
    { 
        title: "Objective", 
        description: "Be the first player to get rid of all your cards." 
    },
    { 
        title: "Gameplay", 
        description: "On your turn, you must play a card from your hand that matches either the NUMBER or the SHAPE of the card at the top of the discard pile." 
    },
    { 
        title: "No Valid Card?", 
        description: "If you don't have a card you can play, you must draw one card from the draw pile. Your turn then ends." 
    },
];

const specialCards: { card: Card, title: string, description: string }[] = [
    { 
        card: { id: 'instr-1', shape: 'circle', number: 1 },
        title: "1 (Hold On)", 
        description: "The player who plays this card gets to play again immediately." 
    },
    { 
        card: { id: 'instr-2', shape: 'triangle', number: 2 },
        title: "2 (Pick Two)", 
        description: "The next player must pick two cards from the draw pile." 
    },
    { 
        card: { id: 'instr-5', shape: 'cross', number: 5 },
        title: "5 (Pick Three)", 
        description: "The next player must pick three cards from the draw pile." 
    },
    { 
        card: { id: 'instr-8', shape: 'square', number: 8 },
        title: "8 (Suspension)", 
        description: "The next player misses their turn (they are 'suspended')." 
    },
    { 
        card: { id: 'instr-14', shape: 'star', number: 14 },
        title: "14 (General Market)", 
        description: "Every other player must draw one card from the draw pile." 
    },
    { 
        card: { id: 'instr-20', shape: 'whot', number: 20 },
        title: "20 (WHOT!)", 
        description: "This is a wild card. The player who plays it can request any shape. The next player must then play a card of the requested shape, or another WHOT! card. The player who plays a WHOT! card also gets to play again." 
    },
]

export default function GameInstructionsModal({ isOpen, onOpenChange }: GameInstructionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-center">How to Play WHOT!</DialogTitle>
          <DialogDescription className="text-center">
            The classic Nigerian card game. Here are the rules.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] p-4 border rounded-md">
            <div className="space-y-8">
                <div>
                    <h3 className="font-bold text-lg mb-2 text-primary">Basic Rules</h3>
                    <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                        {rules.map(rule => (
                           <li key={rule.title}><strong>{rule.title}:</strong> {rule.description}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4 text-primary">Special Cards</h3>
                    <div className="space-y-6">
                        {specialCards.map(special => (
                            <div key={special.title} className="flex items-start gap-4">
                               <div className="w-24 flex-shrink-0">
                                    <WhotCard card={special.card} />
                               </div>
                               <div className="flex-grow">
                                    <h4 className="font-bold text-base">{special.title}</h4>
                                    <p className="text-muted-foreground text-sm">{special.description}</p>
                               </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
