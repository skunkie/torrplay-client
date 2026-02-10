'use client';

import { AlertTriangle, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AddTorrentDialog } from '@/components/add-torrent-dialog';
import { EditTorrentDialog } from '@/components/edit-torrent-dialog';
import { Header } from '@/components/header';
import { MetricsDialog } from '@/components/metrics-dialog';
import { SettingsDialog } from '@/components/settings-dialog';
import { TorrentCard } from '@/components/torrent-card';
import { TorrentStatsDialog } from '@/components/torrent-stats-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deleteTorrent, getTorrent, getTorrents } from '@/lib/api/torrents';
import { getApiBaseUrl } from '@/lib/api-client';
import type { Torrent, TorrentsResponse } from '@/lib/types/api';

const TorrentPlayerDialog = dynamic(
  () => import('@/components/torrent-player-dialog').then((mod) => mod.TorrentPlayerDialog),
  {
    ssr: false,
  },
);

export default function HomePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [titleFilter, setTitleFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [page, setPage] = useState(1);
  const [torrentsPerPage, setTorrentsPerPage] = useState(0);
  const [selectedTorrent, setSelectedTorrent] = useState<Torrent | null>(null);
  const [statsTorrent, setStatsTorrent] = useState<Torrent | null>(null);
  const [playingTorrent, setPlayingTorrent] = useState<Torrent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [torrentToDelete, setTorrentToDelete] = useState<Torrent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Manual data fetching state
  const [torrentsData, setTorrentsData] = useState<TorrentsResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    try {
      const data = await getTorrents({});
      setTorrentsData(data);
      setError(null);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Failed to fetch torrents');
      setError(fetchError);
      toast.error(fetchError.message);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => {
      if (!isPaused) {
        fetchData(false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const categories = useMemo(() => {
    if (!torrentsData?.torrents) return [];
    const allCategories = torrentsData.torrents.map((t) => t.category).filter(Boolean) as string[];
    return Array.from(new Set(allCategories)).sort();
  }, [torrentsData]);

  const handleTitleFilterChange = (query: string) => {
    setTitleFilter(query);
    setPage(1);
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value === 'all' ? '' : value);
    setPage(1);
  };

  const handleTorrentsPerPageChange = (value: string) => {
    setTorrentsPerPage(Number(value));
    setPage(1);
  };

  const openDeleteDialog = (torrent: Torrent) => {
    setTorrentToDelete(torrent);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (isDeleting) return;
    setDeleteDialogOpen(false);
    setTimeout(() => setTorrentToDelete(null), 200);
  };

  const handleDelete = async () => {
    if (!torrentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTorrent(torrentToDelete.infohash);
      toast.success('Torrent deleted', {
        description: `Successfully deleted ${torrentToDelete.title || torrentToDelete.infohash}`,
      });
      fetchData();
      closeDeleteDialog();
    } catch (error) {
      toast.error('Delete failed', {
        description: error instanceof Error ? error.message : 'Failed to delete torrent',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlay = async (torrent: Torrent) => {
    const toastId = toast.loading('Fetching torrent details...', {
      description: 'Please wait while we load the video files.',
    });
    try {
      const fullTorrentDetails = await getTorrent(torrent.infohash);
      setPlayingTorrent(fullTorrentDetails);
      toast.dismiss(toastId);
    } catch (error) {
      toast.error('Failed to load torrent details', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Could not load video files.',
      });
    }
  };

  const filteredAndSortedTorrents = useMemo(() => {
    const filtered = torrentsData?.torrents
      ? torrentsData.torrents.filter((torrent) => {
          const titleMatch =
            !titleFilter || (torrent.title || torrent.name || '').toLowerCase().includes(titleFilter.toLowerCase());
          const categoryMatch = !categoryFilter || (torrent.category || '') === categoryFilter;
          return titleMatch && categoryMatch;
        })
      : [];

    return filtered.slice().sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.title || a.name || '').localeCompare(b.title || b.name || '');
        case 'size':
          return (b.totalSize || 0) - (a.totalSize || 0);
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [torrentsData, titleFilter, categoryFilter, sortBy]);

  const totalPages = torrentsPerPage > 0 ? Math.ceil(filteredAndSortedTorrents.length / torrentsPerPage) : 1;

  const paginatedTorrents = useMemo(() => {
    if (torrentsPerPage === 0) {
      return filteredAndSortedTorrents;
    }
    const start = (page - 1) * torrentsPerPage;
    const end = start + torrentsPerPage;
    return filteredAndSortedTorrents.slice(start, end);
  }, [filteredAndSortedTorrents, page, torrentsPerPage]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  return (
    <div className='min-h-screen bg-background'>
      <Header
        onSettingsClick={() => setSettingsOpen(true)}
        onMetricsClick={() => setMetricsOpen(true)}
        onTitleSearch={handleTitleFilterChange}
        isPaused={isPaused}
        onPauseClick={() => setIsPaused(!isPaused)}
      />

      <main className='container mx-auto px-4 py-8'>
        <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
          <div className='flex flex-wrap items-center gap-4'>
            <AddTorrentDialog onSuccess={fetchData} />

            <div className='flex items-center gap-2'>
              <Label htmlFor='category-select' className='text-sm text-muted-foreground shrink-0'>
                Category:
              </Label>
              <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                <SelectTrigger id='category-select' className='w-full sm:w-[240px]'>
                  <SelectValue placeholder='Filter by category...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center gap-2'>
              <Label htmlFor='sort-select' className='text-sm text-muted-foreground shrink-0'>
                Sort by:
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id='sort-select' className='w-full sm:w-[180px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='date'>Date Added</SelectItem>
                  <SelectItem value='updated'>Date Updated</SelectItem>
                  <SelectItem value='name'>Name</SelectItem>
                  <SelectItem value='size'>Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {torrentsData && (
            <div className='flex items-center gap-4'>
              <span className='text-sm text-muted-foreground'>
                {filteredAndSortedTorrents.length} {filteredAndSortedTorrents.length === 1 ? 'torrent' : 'torrents'}
              </span>
              <Select value={String(torrentsPerPage)} onValueChange={handleTorrentsPerPageChange}>
                <SelectTrigger className='w-[120px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>All</SelectItem>
                  <SelectItem value='12'>12 / page</SelectItem>
                  <SelectItem value='24'>24 / page</SelectItem>
                  <SelectItem value='48'>48 / page</SelectItem>
                  <SelectItem value='96'>96 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {isLoading && !torrentsData && (
          <div className='text-center py-16'>
            <p className='text-muted-foreground'>Loading torrents...</p>
          </div>
        )}

        {error && (
          <div className='text-center py-16'>
            <p className='text-destructive mb-2'>Failed to load torrents</p>
            <p className='text-xs text-muted-foreground mt-2'>API URL: {getApiBaseUrl()}</p>
          </div>
        )}

        {!error && !isLoading && paginatedTorrents.length === 0 ? (
          <div className='text-center py-16 space-y-4'>
            <div className='mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
              <Plus className='h-8 w-8 text-primary' />
            </div>
            <div>
              <h3 className='text-lg font-semibold mb-2'>
                {titleFilter || categoryFilter ? 'No torrents found' : 'No torrents yet'}
              </h3>
              <p className='text-muted-foreground text-sm mb-6'>
                {titleFilter || categoryFilter
                  ? 'Try adjusting your filters or add a new torrent'
                  : 'Get started by adding your first torrent using a magnet link, info hash or torrent file.'}
              </p>
            </div>
            <AddTorrentDialog onSuccess={fetchData} />
          </div>
        ) : (
          !error &&
          !isLoading && (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {paginatedTorrents.map((torrent) => (
                <TorrentCard
                  key={torrent.infohash}
                  torrent={torrent}
                  onEdit={(t) => setSelectedTorrent(t)}
                  onViewStats={(t) => setStatsTorrent(t)}
                  onDelete={openDeleteDialog}
                  onPlay={handlePlay}
                />
              ))}
            </div>
          )
        )}

        {torrentsPerPage > 0 && totalPages > 1 && (
          <div className='flex justify-center items-center gap-4 mt-8'>
            <Button onClick={() => setPage(page - 1)} disabled={page === 1} variant='outline'>
              Previous
            </Button>
            <span className='text-sm text-muted-foreground'>
              Page {page} of {totalPages}
            </span>
            <Button onClick={() => setPage(page + 1)} disabled={page === totalPages} variant='outline'>
              Next
            </Button>
          </div>
        )}
      </main>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <MetricsDialog open={metricsOpen} onOpenChange={setMetricsOpen} />
      <EditTorrentDialog
        torrent={selectedTorrent}
        open={!!selectedTorrent}
        onOpenChange={(open) => !open && setSelectedTorrent(null)}
        onSuccess={fetchData}
      />
      <TorrentStatsDialog
        torrent={statsTorrent}
        open={!!statsTorrent}
        onOpenChange={(open) => !open && setStatsTorrent(null)}
      />
      <TorrentPlayerDialog
        torrent={playingTorrent}
        open={!!playingTorrent}
        onOpenChange={(open) => !open && setPlayingTorrent(null)}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-destructive' />
              Delete Torrent
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this torrent? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className='py-4'>
            {torrentToDelete && (
              <p className='text-center font-medium break-words'>
                &quot;{torrentToDelete.title || torrentToDelete.name || torrentToDelete.infohash}&quot;
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={closeDeleteDialog} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
