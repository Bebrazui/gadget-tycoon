
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
  title: string;
  description?: string | ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionTitle({ title, description, className, titleClassName, descriptionClassName }: SectionTitleProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h2 className={cn("text-2xl font-semibold font-headline tracking-tight", titleClassName)}>{title}</h2>
      {description && <p className={cn("text-muted-foreground mt-1", descriptionClassName)}>{description}</p>}
    </div>
  );
}
