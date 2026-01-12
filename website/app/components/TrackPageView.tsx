'use client';

import { useEffect } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { addRecentView } from '../lib/recentViews';

interface TrackPageViewProps {
  resource: ResourceMetadata;
}

export function TrackPageView({ resource }: TrackPageViewProps) {
  useEffect(() => {
    if (resource) {
      addRecentView(resource);
    }
  }, [resource]);

  return null;
}
