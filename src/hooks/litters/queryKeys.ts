
// Define query keys for better caching and invalidation
export const litterQueryKeys = {
  all: ['litters'] as const,
  lists: () => [...litterQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...litterQueryKeys.lists(), { filters }] as const,
  details: (id: string) => [...litterQueryKeys.all, 'detail', id] as const,
  puppies: (litterId: string) => [...litterQueryKeys.all, 'puppies', litterId] as const,
};
