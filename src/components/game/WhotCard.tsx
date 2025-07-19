import { cn } from '@/lib/utils';
import type { Card as CardType } from '@/lib/whot';
import { ShapeIcon } from '../icons/WhotShapes';
import { WhotJokerIcon } from '../icons/WhotJokerIcon';

interface WhotCardProps {
  card: CardType;
  isFaceDown?: boolean;
  className?: string;
}

const CenteredShapes = ({ card }: { card: CardType }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <ShapeIcon shape={card.shape} className="w-1/2 h-1/2" />
        </div>
    )
}

export function WhotCard({ card, isFaceDown = false, className }: WhotCardProps) {
  if (isFaceDown) {
    return (
      <div
        className={cn(
          'aspect-[5/7] w-full rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-2 flex items-center justify-center shadow-lg border-2 border-primary-foreground/50 transition-transform duration-300 group-hover:scale-105',
          className
        )}
      >
        <h2 className="text-primary-foreground font-headline font-bold text-3xl -rotate-45 opacity-70">FAAJI</h2>
      </div>
    );
  }

  const isWhotCard = card.shape === 'whot';

  return (
    <div
      className={cn(
        'aspect-[5/7] w-full rounded-xl bg-white dark:bg-zinc-800/90 p-1 flex flex-col justify-between shadow-lg relative overflow-hidden font-bold transition-transform duration-300 [transform-style:preserve-3d] group-hover:[transform:rotateY(5deg)_rotateX(-5deg)_scale(1.05)]',
        'border-2 border-zinc-200/50 dark:border-white/10',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-50', // subtle gradient for light effect
        'after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent', // edge highlight
        'shadow-black/20 dark:shadow-black/40',
        className
      )}
    >
        <div className="absolute inset-1 rounded-[0.5rem] bg-card shadow-inner-lg" />
        
        <div className="relative z-10">
            {/* Top Left Corner */}
            <div className="flex flex-col items-center p-1">
                <span className="text-xl leading-none">{isWhotCard ? '20' : card.number}</span>
                {!isWhotCard && <ShapeIcon shape={card.shape} small className="w-3.5 h-3.5" />}
            </div>
        </div>
      
        {/* Center Content */}
        <div className="absolute inset-0 z-0">
             {isWhotCard ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <WhotJokerIcon className="w-2/3 h-2/3" />
                </div>
            ) : (
                <CenteredShapes card={card} />
            )}
        </div>


        {/* Bottom Right Corner */}
       <div className="relative z-10 flex flex-col items-center p-1 self-end rotate-180">
            <span className="text-xl leading-none">{isWhotCard ? '20' : card.number}</span>
            {!isWhotCard && <ShapeIcon shape={card.shape} small className="w-3.5 h-3.5" />}
       </div>

       {isWhotCard && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10">
            <p className="font-bold text-xs bg-black text-white px-2 rounded-sm leading-tight">WHOT!</p>
        </div>
      )}
    </div>
  );
}
