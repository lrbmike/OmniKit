'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/ui/copy-button';
import { Plus, Search, Tag, Edit, Trash2, X, ChevronLeft, ChevronRight, Clipboard, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  getNotes,
  getAllTags,
  createNote,
  updateNote,
  deleteNote,
  type ClipboardNote,
  type GetNotesParams,
} from '@/actions/clipboard';

export function ClipboardNotes() {
  const t = useTranslations('Tools.ClipboardNotes');
  
  const [notes, setNotes] = useState<ClipboardNote[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'order'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Tag expansion state
  const [showAllTags, setShowAllTags] = useState(false);
  const MAX_VISIBLE_TAGS = 10;
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ClipboardNote | null>(null);
  
  // Form states
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');

  // Load notes
  const loadNotes = async () => {
    try {
      setLoading(true);
      const params: GetNotesParams = {
        page: currentPage,
        pageSize,
        search: searchQuery,
        tags: selectedTags,
        sortBy,
        sortOrder,
      };
      const result = await getNotes(params);
      setNotes(result.notes);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Load all tags
  const loadTags = async () => {
    try {
      const tags = await getAllTags();
      setAllTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadNotes();
    loadTags();
  }, [currentPage, searchQuery, selectedTags, sortBy, sortOrder]);

  // Handle create note
  const handleCreateNote = async () => {
    if (!newContent.trim()) {
      toast.error(t('contentRequired'));
      return;
    }

    try {
      await createNote(newContent, newTags);
      toast.success(t('createSuccess'));
      setIsCreateDialogOpen(false);
      setNewContent('');
      setNewTags([]);
      setNewTagInput('');
      setCurrentPage(1);
      loadNotes();
      loadTags();
    } catch (error) {
      toast.error(t('createError'));
    }
  };

  // Handle update note
  const handleUpdateNote = async () => {
    if (!editingNote || !editContent.trim()) {
      toast.error(t('contentRequired'));
      return;
    }

    try {
      await updateNote(editingNote.id, {
        content: editContent,
        tags: editTags,
      });
      toast.success(t('updateSuccess'));
      setIsEditDialogOpen(false);
      setEditingNote(null);
      loadNotes();
      loadTags();
    } catch (error) {
      toast.error(t('updateError'));
    }
  };

  // Handle delete note
  const handleDeleteNote = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      await deleteNote(id);
      toast.success(t('deleteSuccess'));
      loadNotes();
      loadTags();
    } catch (error) {
      toast.error(t('deleteError'));
    }
  };

  // Handle paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setNewContent(text);
        toast.success(t('pasteSuccess'));
      } else {
        toast.error(t('pasteEmpty'));
      }
    } catch (error) {
      toast.error(t('pasteError'));
    }
  };

  // Handle add tag (for create)
  const handleAddNewTag = () => {
    const tag = newTagInput.trim();
    if (!tag) return;
    if (newTags.length >= 3) {
      toast.error(t('maxTagsError'));
      return;
    }
    if (newTags.includes(tag)) {
      toast.error(t('duplicateTagError'));
      return;
    }
    setNewTags([...newTags, tag]);
    setNewTagInput('');
  };

  // Handle add tag (for edit)
  const handleAddEditTag = () => {
    const tag = editTagInput.trim();
    if (!tag) return;
    if (editTags.length >= 3) {
      toast.error(t('maxTagsError'));
      return;
    }
    if (editTags.includes(tag)) {
      toast.error(t('duplicateTagError'));
      return;
    }
    setEditTags([...editTags, tag]);
    setEditTagInput('');
  };

  // Open edit dialog
  const openEditDialog = (note: ClipboardNote) => {
    setEditingNote(note);
    setEditContent(note.content);
    setEditTags(note.tags);
    setEditTagInput('');
    setIsEditDialogOpen(true);
  };

  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search with Button */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setSearchQuery(searchInput);
                    setCurrentPage(1);
                  }
                }}
                className="pl-10 bg-background border-2 border-input hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm transition-colors"
              />
            </div>
            <Button
              onClick={() => {
                setSearchQuery(searchInput);
                setCurrentPage(1);
              }}
            >
              <Search className="h-4 w-4 mr-2" />
              {t('search')}
            </Button>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">{t('sortByUpdated')}</SelectItem>
                <SelectItem value="order">{t('sortByOrder')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">{t('descending')}</SelectItem>
                <SelectItem value="asc">{t('ascending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Create Button */}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('createNote')}
          </Button>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">{t('filterByTag')}:</span>
            {(showAllTags ? allTags : allTags.slice(0, MAX_VISIBLE_TAGS)).map(tag => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleTagFilter(tag)}
              >
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </Button>
            ))}
            {allTags.length > MAX_VISIBLE_TAGS && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllTags(!showAllTags)}
              >
                {showAllTags ? (
                  <>
                    <ChevronUp className="mr-1 h-3 w-3" />
                    {t('showLess')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-3 w-3" />
                    {t('showMore', { count: allTags.length - MAX_VISIBLE_TAGS })}
                  </>
                )}
              </Button>
            )}
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTags([]);
                  setCurrentPage(1);
                }}
              >
                {t('clearFilters')}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{t('loading')}</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery || selectedTags.length > 0 ? t('noResultsFound') : t('noNotes')}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notes.map(note => (
              <Card key={note.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex-1 flex flex-col">
                  {/* Content */}
                  <div className="flex-1 mb-3">
                    <p className="text-sm whitespace-pre-wrap break-words line-clamp-6">
                      {note.content}
                    </p>
                  </div>

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary"
                        >
                          <Tag className="mr-1 h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <CopyButton value={note.content} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('pageInfo', { current: currentPage, total: totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('createNote')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t('content')}</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePasteFromClipboard}
                >
                  <Clipboard className="mr-2 h-4 w-4" />
                  {t('paste')}
                </Button>
              </div>
              <Textarea
                placeholder={t('contentPlaceholder')}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('tags')} ({newTags.length}/3)</label>
              <div className="flex gap-2">
                <Input
                  placeholder={t('tagPlaceholder')}
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewTag()}
                />
                <Button onClick={handleAddNewTag} disabled={newTags.length >= 3}>
                  {t('addTag')}
                </Button>
              </div>
              {newTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-sm"
                    >
                      {tag}
                      <button onClick={() => setNewTags(newTags.filter(t => t !== tag))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleCreateNote}>{t('create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('editNote')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('content')}</label>
              <Textarea
                placeholder={t('contentPlaceholder')}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('tags')} ({editTags.length}/3)</label>
              <div className="flex gap-2">
                <Input
                  placeholder={t('tagPlaceholder')}
                  value={editTagInput}
                  onChange={(e) => setEditTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEditTag()}
                />
                <Button onClick={handleAddEditTag} disabled={editTags.length >= 3}>
                  {t('addTag')}
                </Button>
              </div>
              {editTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-sm"
                    >
                      {tag}
                      <button onClick={() => setEditTags(editTags.filter(t => t !== tag))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleUpdateNote}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
