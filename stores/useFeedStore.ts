import { create } from 'zustand';
import { GenerationRow } from '@/lib/supabase';

interface FeedState {
  posts: GenerationRow[];
  likedPostIds: Set<string>;
  isRefreshing: boolean;
  hasMore: boolean;
  setPosts: (posts: GenerationRow[]) => void;
  appendPosts: (posts: GenerationRow[]) => void;
  toggleLike: (postId: string) => void;
  setRefreshing: (refreshing: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  reset: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  likedPostIds: new Set(),
  isRefreshing: false,
  hasMore: true,

  setPosts: (posts) => set({ posts }),
  appendPosts: (posts) => set((state) => ({ posts: [...state.posts, ...posts] })),

  toggleLike: (postId) =>
    set((state) => {
      const liked = new Set(state.likedPostIds);
      if (liked.has(postId)) {
        liked.delete(postId);
      } else {
        liked.add(postId);
      }
      return { likedPostIds: liked };
    }),

  setRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
  setHasMore: (hasMore) => set({ hasMore }),
  reset: () => set({ posts: [], likedPostIds: new Set(), hasMore: true }),
}));
