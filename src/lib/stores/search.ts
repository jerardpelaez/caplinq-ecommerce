import { atom } from 'nanostores';
import type { SearchResult } from '../types/product';

export const searchQuery = atom('');
export const searchResults = atom<SearchResult[]>([]);
export const isSearchOpen = atom(false);
export const isSearching = atom(false);
