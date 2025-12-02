import { useState } from 'react';
import { useSavedSearches, SavedSearch } from '@/hooks/useSavedSearches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bookmark, Trash2, Search, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SavedSearchesProps {
  currentFilters: SavedSearch['filters'];
  onApplySearch: (filters: SavedSearch['filters']) => void;
}

export function SavedSearches({ currentFilters, onApplySearch }: SavedSearchesProps) {
  const { savedSearches, loading, saveSearch, deleteSearch } = useSavedSearches();
  const [searchName, setSearchName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSave = async () => {
    if (!searchName.trim()) return;
    await saveSearch(searchName.trim(), currentFilters);
    setSearchName('');
    setDialogOpen(false);
  };

  const hasActiveFilters = Object.values(currentFilters).some(v => v !== undefined && v !== '');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Saved Searches
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                disabled={!hasActiveFilters}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Save Current
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Search</DialogTitle>
                <DialogDescription>
                  Save your current filters for quick access later
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Search name (e.g., 'Cleaning jobs near me')"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Current filters:</p>
                  <div className="flex flex-wrap gap-1">
                    {currentFilters.query && (
                      <Badge variant="secondary">Search: {currentFilters.query}</Badge>
                    )}
                    {currentFilters.category && (
                      <Badge variant="secondary">Category: {currentFilters.category}</Badge>
                    )}
                    {currentFilters.location && (
                      <Badge variant="secondary">Location: {currentFilters.location}</Badge>
                    )}
                    {(currentFilters.minBudget || currentFilters.maxBudget) && (
                      <Badge variant="secondary">
                        Budget: ${currentFilters.minBudget || 0} - ${currentFilters.maxBudget || '∞'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!searchName.trim()}>
                  Save Search
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : savedSearches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No saved searches yet
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent group"
              >
                <button
                  onClick={() => onApplySearch(search.filters)}
                  className="flex items-center gap-2 text-sm text-left flex-1"
                >
                  <Search className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{search.name}</span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => deleteSearch(search.id)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
