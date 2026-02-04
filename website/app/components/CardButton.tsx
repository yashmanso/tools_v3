'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cardBaseClass } from './cardStyles';

interface CardButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function CardButton({ children, className, onClick }: CardButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        'w-full h-auto whitespace-normal text-left flex flex-col items-start justify-start',
        cardBaseClass,
        className
      )}
    >
      {children}
    </Button>
  );
}
