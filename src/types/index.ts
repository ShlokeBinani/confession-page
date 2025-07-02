export interface Confession {
  id: number;
  city: string;
  sex: 'Male' | 'Female' | 'Other';
  age: number;
  description: string;
  created_at: string;
}

export interface ConfessionFormData {
  city: string;
  sex: 'Male' | 'Female' | 'Other' | '';
  age: string;
  description: string;
}

export interface SearchFilters {
  city: string;
  sex: 'Male' | 'Female' | 'Other' | '';
  ageMin: string;
  ageMax: string;
  search: string;
  sortBy: 'created_at' | 'age' | 'city';
  sortOrder: 'asc' | 'desc';
}

export interface PaginationData {
  confessions: Confession[];
  totalPages: number;
  currentPage: number;
  total: number;
}
