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
    if (card.number > 10) { // For 11, 12, 13, 14, just show one big icon
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <ShapeIcon shape={card.shape} className="w-1/2 h-1/2" />
            </div>
        )
    }

    const shapeArray = Array.from({ length: card.number });

    // Simple grid layout for shapes
    const gridClass = () => {
        switch(card.number) {
            case 1: return 'grid-cols-1 justify-center';
            case 2:
            case 3: return 'grid-cols-1 justify-center gap-y-4';
            case 4: return 'grid-cols-2 justify-center';
            case 5:
            case 6: return 'grid-cols-2 justify-center';
            case 7:
            case 8: return 'grid-cols-3 justify-center items-center';
            case 9:
            case 10: return 'grid-cols-3 justify-center items-center';
            default: return 'grid-cols-3';
        }
    }
    
    // Some manual adjustments for better layouts
    const getStyleForIndex = (index: number) => {
        if (card.number === 5 && index === 4) return { gridColumn: 'span 2' };
        if (card.number === 7) {
            if(index === 0) return {gridColumn: 'span 3', marginBottom: '-1rem'}
            if(index === 6) return {gridColumn: 'span 3', marginTop: '-1rem'}
        }
        if (card.number === 8) {
             if(index === 0 || index === 7) return {gridColumn: 'span 3'}
        }
        if (card.number === 9 && (index === 0 || index === 4 || index === 8)) return { alignSelf: 'center'}
        if (card.number === 10) {
            if(index === 0 || index === 9) return {gridColumn: 'span 3'}
        }
        return {};
    }

    return (
        <div className={cn("absolute inset-0 flex items-center justify-center p-4", )}>
            <div className={cn("grid w-full h-full", gridClass())}>
                 {shapeArray.map((_, i) => (
                    <div key={i} className="flex items-center justify-center" style={getStyleForIndex(i)}>
                        <ShapeIcon shape={card.shape} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                 ))}
            </div>
        </div>
    )

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
        'aspect-[5/7] w-full rounded-lg bg-card p-1 flex flex-col justify-between shadow-md border relative overflow-hidden font-bold',
        className
      )}
    >
        {/* Top Left Corner */}
        <div className="flex flex-col items-center p-1">
            <span className="text-lg leading-none">{isWhotCard ? '20' : card.number}</span>
            {!isWhotCard && <ShapeIcon shape={card.shape} small className="w-3 h-3" />}
        </div>
      
        {/* Center Content */}
        <div className="absolute inset-0">
             {isWhotCard ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <WhotJokerIcon className="w-2/3 h-2/3" />
                </div>
            ) : (
                <CenteredShapes card={card} />
            )}
        </div>


        {/* Bottom Right Corner */}
       <div className="flex flex-col items-center p-1 self-end rotate-180">
            <span className="text-lg leading-none">{isWhotCard ? '20' : card.number}</span>
            {!isWhotCard && <ShapeIcon shape={card.shape} small className="w-3 h-3" />}
       </div>

       {isWhotCard && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
            <p className="font-bold text-xs bg-black text-white px-2 rounded-sm leading-tight">WHOT!</p>
        </div>
      )}
    </div>
  );
}
