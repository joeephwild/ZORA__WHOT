import { cn } from '@/lib/utils';
import type { Card as CardType } from '@/lib/whot';
import { ShapeIcon } from '../icons/WhotShapes';
import { WhotJokerIcon } from '../icons/WhotJokerIcon';

interface WhotCardProps {
  card: CardType;
  isFaceDown?: boolean;
  className?: string;
}

export function WhotCard({ card, isFaceDown = false, className }: WhotCardProps) {
  if (isFaceDown) {
    return (
      <div
        className={cn(
          'aspect-[5/7] w-full rounded-lg bg-primary p-2 flex items-center justify-center shadow-md border-2 border-primary-foreground/50',
          className
        )}
      >
        <h2 className="text-primary-foreground font-headline font-bold text-2xl -rotate-45">FAAJI</h2>
      </div>
    );
  }

  const isWhotCard = card.shape === 'whot';

  return (
    <div
      className={cn(
        'aspect-[5/7] w-full rounded-lg bg-card p-1 flex flex-col justify-between shadow-md border relative overflow-hidden',
        className
      )}
    >
      <div className="flex justify-start">
        <span className="font-bold text-lg">{isWhotCard ? '' : card.number}</span>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        {isWhotCard ? (
          <WhotJokerIcon className="w-1/2 h-1/2" />
        ) : (
          <ShapeIcon shape={card.shape} className="w-1/2 h-1/2" />
        )}
      </div>

       <div className="absolute inset-4 flex items-center justify-center opacity-10">
         {!isWhotCard && <span className="text-8xl font-black">{card.number}</span>}
      </div>


      <div className="flex justify-end rotate-180">
        <span className="font-bold text-lg">{isWhotCard ? '' : card.number}</span>
      </div>
       {isWhotCard && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
            <p className="font-bold text-sm bg-black text-white px-2 rounded">WHOT!</p>
        </div>
      )}
    </div>
  );
}
