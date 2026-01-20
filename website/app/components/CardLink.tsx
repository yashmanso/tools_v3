'use client';

import { PanelLink } from './PanelLink';
import { cn } from '@/lib/utils';
import { cardBaseClass } from './cardStyles';
import type { MouseEventHandler, ReactNode } from 'react';

interface CardLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  openInPanel?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function CardLink({ href, children, className, openInPanel, onClick }: CardLinkProps) {
  return (
    <PanelLink
      href={href}
      openInPanel={openInPanel}
      onClick={onClick}
      className={cn('block', cardBaseClass, className)}
    >
      {children}
    </PanelLink>
  );
}
