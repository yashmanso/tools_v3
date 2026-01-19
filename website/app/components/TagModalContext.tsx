'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface TagModalContextType {
  openTag: string | null;
  setOpenTag: (tag: string | null) => void;
  openResourceTags: { title: string; tags: string[] } | null;
  setOpenResourceTags: (resource: { title: string; tags: string[] } | null) => void;
}

const TagModalContext = createContext<TagModalContextType | undefined>(undefined);

export function TagModalProvider({ children }: { children: ReactNode }) {
  const [openTag, setOpenTag] = useState<string | null>(null);
  const [openResourceTags, setOpenResourceTags] = useState<{ title: string; tags: string[] } | null>(null);

  return (
    <TagModalContext.Provider value={{ openTag, setOpenTag, openResourceTags, setOpenResourceTags }}>
      {children}
    </TagModalContext.Provider>
  );
}

export function useTagModal() {
  const context = useContext(TagModalContext);
  if (!context) {
    throw new Error('useTagModal must be used within TagModalProvider');
  }
  return context;
}
