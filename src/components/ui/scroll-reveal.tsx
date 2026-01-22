import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    animation?: "fade-up" | "fade-in" | "scale-in" | "slide-in-right" | "slide-in-left";
    delay?: number;
    duration?: number;
    viewOffset?: number; // 0 to 1, percentage of viewport height to trigger
}

export const ScrollReveal = ({
    children,
    className,
    animation = "fade-up",
    delay = 0,
    duration = 0.5,
    viewOffset = 0.2,
    ...props
}: ScrollRevealProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0,
                rootMargin: `0px 0px -${viewOffset * 100}% 0px`,
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [viewOffset]);

    const getAnimationClass = () => {
        switch (animation) {
            case "fade-up":
                return "animate-fade-up";
            case "fade-in":
                return "animate-fade-in";
            case "scale-in":
                return "animate-scale-in";
            case "slide-in-right":
                return "animate-slide-in-right";
            case "slide-in-left":
                return "animate-slide-in-left";
            default:
                return "animate-fade-up";
        }
    };

    return (
        <div
            ref={ref}
            className={cn(
                "transition-opacity duration-1000",
                isVisible ? "opacity-100" : "opacity-0",
                isVisible && getAnimationClass(),
                className
            )}
            style={{
                animationDelay: `${delay}ms`,
                animationDuration: `${duration}s`,
                animationFillMode: "both",
            }}
            {...props}
        >
            {children}
        </div>
    );
};
