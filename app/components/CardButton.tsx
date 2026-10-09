'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cardBaseClass } from './cardStyles';

interface CardButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  children: React.ReactNode;
  className?: string;
}

export function CardButton({ children, className, onClick, ...rest }: CardButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        'w-full h-auto whitespace-normal text-left flex flex-col items-start justify-start',
        cardBaseClass,
        className
      )}
      {...rest}
    >
      {children}
    </Button>
  );
}
