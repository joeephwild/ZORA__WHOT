import { cn } from "@/lib/utils";
import { Shape } from "@/lib/whot";
import { SVGProps } from "react";

const shapeColors: Record<Shape, string> = {
    circle: "text-blue-500",
    triangle: "text-red-500",
    cross: "text-green-600",
    square: "text-gray-800",
    star: "text-yellow-500",
    whot: ""
};

const Circle = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}><circle cx="50" cy="50" r="45" fill="currentColor" /></svg>
);

const Triangle = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}><path d="M50 5 L95 95 L5 95 Z" fill="currentColor" /></svg>
);

const Cross = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}><path d="M85 5 L95 15 L60 50 L95 85 L85 95 L50 60 L15 95 L5 85 L40 50 L5 15 L15 5 L50 40 Z" fill="currentColor" /></svg>
);

const Square = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}><rect x="10" y="10" width="80" height="80" fill="currentColor" /></svg>
);

const Star = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}><path d="M50 5 L61.8 38.2 L98.2 38.2 L68.2 59.5 L79.5 92.7 L50 71 L20.5 92.7 L31.8 59.5 L1.8 38.2 L38.2 38.2 Z" fill="currentColor" /></svg>
);

export const ShapeIcon = ({ shape, className, ...props }: { shape: Shape, className?: string } & SVGProps<SVGSVGElement>) => {
    const colorClass = shapeColors[shape];
    const baseClass = cn(colorClass, className);

    switch (shape) {
        case 'circle':
            return <Circle className={baseClass} {...props} />;
        case 'triangle':
            return <Triangle className={baseClass} {...props} />;
        case 'cross':
            return <Cross className={baseClass} {...props} />;
        case 'square':
            return <Square className={baseClass} {...props} />;
        case 'star':
            return <Star className={baseClass} {...props} />;
        default:
            return null;
    }
}
