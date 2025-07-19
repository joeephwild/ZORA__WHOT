import { cn } from "@/lib/utils";
import { Shape } from "@/lib/whot";
import { SVGProps } from "react";

const shapeColors: Record<Shape, string> = {
    circle: "text-blue-500",
    triangle: "text-red-500",
    cross: "text-green-600",
    square: "text-gray-800 dark:text-gray-400",
    star: "text-yellow-500",
    whot: ""
};

const smallShapeColors: Record<Shape, string> = {
    circle: "fill-blue-500",
    triangle: "fill-red-500",
    cross: "fill-green-600",
    square: "fill-gray-800 dark:fill-gray-400",
    star: "fill-yellow-500",
    whot: ""
}

const Circle = ({ small, ...props }: SVGProps<SVGSVGElement> & {small?: boolean}) => (
    <svg viewBox="0 0 100 100" {...props}><circle cx="50" cy="50" r={small ? 50: 45} fill="currentColor" /></svg>
);

const Triangle = ({ small, ...props }: SVGProps<SVGSVGElement>  & {small?: boolean}) => (
    <svg viewBox="0 0 100 100" {...props}><path d="M50 5 L95 95 L5 95 Z" fill="currentColor" /></svg>
);

const Cross = ({ small, ...props }: SVGProps<SVGSVGElement>  & {small?: boolean}) => (
    <svg viewBox="0 0 100 100" {...props}><path d="M85 5 L95 15 L60 50 L95 85 L85 95 L50 60 L15 95 L5 85 L40 50 L5 15 L15 5 L50 40 Z" fill="currentColor" /></svg>
);

const Square = ({ small, ...props }: SVGProps<SVGSVGElement>  & {small?: boolean}) => (
    <svg viewBox="0 0 100 100" {...props}><rect x="10" y="10" width="80" height="80" fill="currentColor" /></svg>
);

const Star = ({ small, ...props }: SVGProps<SVGSVGElement>  & {small?: boolean}) => (
    <svg viewBox="0 0 100 100" {...props}><path d="M50 5 L61.8 38.2 L98.2 38.2 L68.2 59.5 L79.5 92.7 L50 71 L20.5 92.7 L31.8 59.5 L1.8 38.2 L38.2 38.2 Z" fill="currentColor" /></svg>
);

export const ShapeIcon = ({ shape, className, small = false, ...props }: { shape: Shape, className?: string, small?: boolean } & SVGProps<SVGSVGElement>) => {
    const colorClass = small ? smallShapeColors[shape] : shapeColors[shape];
    const baseClass = cn(small ? colorClass.replace('text-','fill-') : colorClass, className);

    const componentProps = { ...props, small };

    switch (shape) {
        case 'circle':
            return <Circle className={baseClass} {...componentProps} />;
        case 'triangle':
            return <Triangle className={baseClass} {...componentProps} />;
        case 'cross':
            return <Cross className={baseClass} {...componentProps} />;
        case 'square':
            return <Square className={baseClass} {...componentProps} />;
        case 'star':
            return <Star className={baseClass} {...componentProps} />;
        default:
            return null;
    }
}
