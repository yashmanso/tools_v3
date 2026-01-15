'use client';

import { useEffect } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { addRecentView } from '../lib/recentViews';
import { incrementViewCount } from '../lib/viewCounter';

interface TrackPageViewProps {
  resource: ResourceMetadata;
}

export function TrackPageView({ resource }: TrackPageViewProps) {
  useEffect(() => {
    if (resource) {
      addRecentView(resource);
      // Increment view count on server
      incrementViewCount(resource).catch(error => {
        console.error('Failed to increment view count:', error);
      });
    }
  }, [resource]);

  return null;
}
