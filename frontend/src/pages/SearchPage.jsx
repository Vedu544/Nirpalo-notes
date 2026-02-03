import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Edit, Trash2, Share2 } from 'lucide-react';
import { notesAPI } from '../api';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      const response = await notesAPI.search(query);
      setResults(response.data || []);
      setSearched(true);
    } catch (error) {
      toast.error('Search failed');
      console.error('Error searching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleEditNote = (noteId) => {
    navigate(`/dashboard/note/${noteId}`);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesAPI.delete(noteId);
        setResults(results.filter(note => note.id !== noteId));
        toast.success('Note deleted successfully');
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleShareNote = async (noteId) => {
    try {
      const shareUrl = `${window.location.origin}/share/${noteId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to create share link');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Search Notes</h1>
        <p className="page-subtitle">Find notes by title or content</p>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search in notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="form-input pl-10 w-full"
              />
            </div>
            <Button
              onClick={handleSearch}
              loading={loading}
              icon={Search}
              iconPosition="left"
            >
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <LoadingSpinner text="Searching..." />
      ) : searched ? (
        <>
          {results.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                No results found
              </h3>
              <p className="text-secondary-600">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-secondary-900">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setSearched(false);
                  }}
                >
                  Clear
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((note) => (
                  <Card key={note.id} hover className="group">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-secondary-900 line-clamp-2">
                          {note.title}
                        </h3>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(note.id)}
                            className="p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShareNote(note.id)}
                            className="p-1"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 text-error-600 hover:text-error-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                        {note.content || 'No content'}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-secondary-500">
                        <span>
                          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                        </span>
                        <span>
                          {note.content.length} characters
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Search your notes
          </h3>
          <p className="text-secondary-600 mb-6">
            Enter keywords to find notes by title or content
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
