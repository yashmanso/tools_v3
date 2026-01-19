'use client';

import { PanelLink } from './PanelLink';
import { cn } from '@/lib/utils';
import { cardBaseClass } from './cardStyles';

interface CardLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  openInPanel?: boolean;
}

export function CardLink({ href, children, className, openInPanel }: CardLinkProps) {
  return (
    <PanelLink
      href={href}
      openInPanel={openInPanel}
      className={cn('block', cardBaseClass, className)}
    >
      {children}
    </PanelLink>
  );
}
