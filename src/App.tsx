import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/common/SearchBar';
import FilterBar from './components/common/FilterBar';
import ConfessionCard from './components/confession/ConfessionCard';
import ConfessionForm from './components/confession/ConfessionForm';
import Pagination from './components/common/Pagination';
import LoadingSpinner from './components/common/LoadingSpinner';
import EmptyState from './components/common/EmptyState';
import { useConfessions } from './hooks/useConfessions';
import { SearchFilters, ConfessionFormData, PaginationData } from './types';

const initialFilters: SearchFilters = {
  city: '',
  sex: '',
  ageMin: '',
  ageMax: '',
  search: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [paginationData, setPaginationData] = useState<PaginationData>({
    confessions: [],
    totalPages: 0,
    currentPage: 1,
    total: 0
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { fetchConfessions, createConfession, loading, error } = useConfessions();

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadConfessions(1, { ...filters, search: searchQuery });
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line
  }, [searchQuery]);

  // Load confessions function
  const loadConfessions = useCallback(async (
    page: number = 1,
    currentFilters: SearchFilters = filters
  ) => {
    try {
      const data = await fetchConfessions(page, 10, currentFilters);
      setPaginationData(data);
    } catch (err) {
      console.error('Error loading confessions:', err);
    }
  }, [fetchConfessions, filters]);

  // Initial load
  useEffect(() => {
    loadConfessions();
    // eslint-disable-next-line
  }, []);

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    loadConfessions(1, { ...filters, search: searchQuery });
  };

  const handleResetFilters = () => {
    const resetFilters = { ...initialFilters, search: searchQuery };
    setFilters(resetFilters);
    loadConfessions(1, resetFilters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    loadConfessions(page, { ...filters, search: searchQuery });
  };

  // Handle confession submission (now supports FormData for audio)
  const handleSubmitConfession = async (data: FormData | ConfessionFormData) => {
    try {
      await createConfession(data);
      setIsFormOpen(false);
      setShowSuccessMessage(true);
      loadConfessions(1, { ...filters, search: searchQuery }); // Refresh the list
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error submitting confession:', error);
      alert('Failed to submit confession. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confession submitted successfully!
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Anonymous Confessions</h1>
              <p className="text-gray-600 mt-1">Share your thoughts anonymously with the world</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-primary whitespace-nowrap flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Confession
            </button>
          </div>
          <div className="mt-6">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Filters */}
          <FilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
          />

          {/* Results Info */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Confessions
              {paginationData.total > 0 && (
                <span className="text-gray-500 font-normal text-base ml-2">
                  ({paginationData.total} total)
                </span>
              )}
            </h2>
          </div>

          {/* Loading State */}
          {loading && <LoadingSpinner text="Loading confessions..." />}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => loadConfessions()}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && paginationData.confessions.length === 0 && (
            <EmptyState
              title="No confessions found"
              description="Be the first to share an anonymous confession, or try adjusting your search filters."
              actionText="Create First Confession"
              onActionClick={() => setIsFormOpen(true)}
            />
          )}

          {/* Confessions List */}
          {!loading && !error && paginationData.confessions.length > 0 && (
            <div className="grid gap-6">
              {paginationData.confessions.map((confession) => (
                <ConfessionCard
                  key={confession.id}
                  confession={confession}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && paginationData.totalPages > 1 && (
            <Pagination
              currentPage={paginationData.currentPage}
              totalPages={paginationData.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 Anonymous Confessions. All confessions are anonymous and secure.</p>
          </div>
        </div>
      </footer>

      {/* Confession Form Modal */}
      <ConfessionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitConfession}
        isLoading={loading}
      />
    </div>
  );
};

export default App;
