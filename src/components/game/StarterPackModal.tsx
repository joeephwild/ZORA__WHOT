'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WhotCard } from './WhotCard';
import { STARTER_PACK } from '@/lib/whot';
import { Gift } from 'lucide-react';

interface StarterPackModalProps {
  isOpen: boolean;
  onClaim: () => void;
}

export default function StarterPackModal({ isOpen, onClaim }: StarterPackModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClaim()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-headline">Welcome to FAAJI!</DialogTitle>
          <DialogDescription className="text-center">
            Here's a starter pack of non-tradable cards to get you going. Good luck!
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 py-4">
          {STARTER_PACK.map((card, index) => (
             <div key={card.id} className="animate-card-in" style={{ animationDelay: `${index * 50}ms` }}>
                <WhotCard card={card} />
             </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold" onClick={onClaim}>
            Claim & Play
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
