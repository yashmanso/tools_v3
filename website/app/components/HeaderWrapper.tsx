import { getAllResources } from '../lib/markdown';
import { Header } from './Header';

export function HeaderWrapper() {
  const allResources = getAllResources();
  return <Header allResources={allResources} />;
}
