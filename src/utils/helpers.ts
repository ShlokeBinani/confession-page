import { Confession, SearchFilters } from '../types';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

export const truncateText = (text: string, maxLength: number = 150): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const filterConfessions = (
  confessions: Confession[],
  filters: SearchFilters
): Confession[] => {
  return confessions.filter(confession => {
    // City filter
    if (filters.city && !confession.city.toLowerCase().includes(filters.city.toLowerCase())) {
      return false;
    }
    
    // Sex filter
    if (filters.sex && confession.sex !== filters.sex) {
      return false;
    }
    
    // Age range filter
    if (filters.ageMin && confession.age < parseInt(filters.ageMin)) {
      return false;
    }
    if (filters.ageMax && confession.age > parseInt(filters.ageMax)) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        confession.city.toLowerCase().includes(searchLower) ||
        confession.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
};

export const sortConfessions = (
  confessions: Confession[],
  sortBy: 'createdAt' | 'age' | 'city',
  sortOrder: 'asc' | 'desc'
): Confession[] => {
  return [...confessions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'age':
        comparison = a.age - b.age;
        break;
      case 'city':
        comparison = a.city.localeCompare(b.city);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

export const paginateArray = <T>(
  array: T[],
  page: number,
  limit: number
): { items: T[]; totalPages: number; total: number } => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    items: array.slice(startIndex, endIndex),
    totalPages: Math.ceil(array.length / limit),
    total: array.length
  };
};
