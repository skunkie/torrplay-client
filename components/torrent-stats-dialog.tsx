'use client';

import { useCallback, useEffect, useState } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTorrentStats } from '@/lib/api/stats';
import { formatBytes } from '@/lib/format-utils';
import type { Torrent, TorrentStats } from '@/lib/types/api';

interface TorrentStatsDialogProps {
  torrent: Torrent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TorrentStatsDialog({ torrent, open, onOpenChange }: TorrentStatsDialogProps) {
  const [stats, setStats] = useState<TorrentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!torrent) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getTorrentStats(torrent.infohash);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [torrent]);

  useEffect(() => {
    if (open && torrent) {
      loadStats();
      const interval = setInterval(loadStats, 2000);
      return () => clearInterval(interval);
    }
  }, [open, torrent, loadStats]);

  if (!torrent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md sm:max-w-lg md:max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Statistics - {torrent.title || 'Untitled'}</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {error && <div className='p-3 bg-destructive/10 text-destructive rounded-lg text-sm'>{error}</div>}

          {loading && !stats && <div className='text-center py-8 text-muted-foreground'>Loading statistics...</div>}

          {stats && (
            <>
              {/* Torrent Overview */}
              <div className='space-y-3'>
                <h4 className='text-sm font-medium'>Torrent Overview</h4>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <div className='space-y-1'>
                    <div className='text-xs text-muted-foreground'>Total Size</div>
                    <div className='text-lg font-semibold'>{formatBytes(stats.totalSize || 0)}</div>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-xs text-muted-foreground'>Completed Size</div>
                    <div className='text-lg font-semibold text-green-600'>{formatBytes(stats.completedSize || 0)}</div>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-xs text-muted-foreground'>In Memory Size</div>
                    <div className='text-lg font-semibold text-blue-600'>{formatBytes(stats.inMemorySize || 0)}</div>
                  </div>
                </div>
              </div>

              {/* Completion Progress */}
              <div className='space-y-3'>
                <h4 className='text-sm font-medium'>Completion Progress</h4>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Completion</span>
                    <span className='font-medium'>
                      {stats.totalSize > 0 ? ((stats.completedSize / stats.totalSize) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={stats.totalSize > 0 ? (stats.completedSize / stats.totalSize) * 100 : 0}
                    className='h-2'
                  />
                </div>
              </div>

              {/* Piece Statistics */}
              <div className='space-y-3'>
                <h4 className='text-sm font-medium'>Piece Statistics</h4>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <div className='space-y-1'>
                    <div className='text-xs text-muted-foreground'>Total Pieces</div>
                    <div className='text-lg font-semibold'>{stats.totalPieces || 0}</div>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-xs text-muted-foreground'>Completed Pieces</div>
                    <div className='text-lg font-semibold text-green-600'>
                      {stats.pieces.filter((p) => p.complete).length}
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-xs text-muted-foreground'>In Memory Pieces</div>
                    <div className='text-lg font-semibold text-blue-600'>{stats.inMemory || 0}</div>
                  </div>
                </div>
              </div>

              {/* Torrent Memory Usage */}
              <div className='space-y-3'>
                <h4 className='text-sm font-medium'>Torrent Memory Usage</h4>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Usage Percentage</span>
                    <span className='font-medium'>{stats.memoryUsagePercentage.toFixed(2)}%</span>
                  </div>
                  <Progress value={stats.memoryUsagePercentage} className='h-2' />
                </div>
              </div>

              {/* Global Memory Statistics */}
              <div className='space-y-3'>
                <h4 className='text-sm font-medium'>Global Memory Statistics</h4>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='space-y-1'>
                    <div className='text-xs text-muted-foreground'>Active Torrents</div>
                    <div className='text-lg font-semibold'>{stats.memoryStats.activeTorrents || 0}</div>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-xs text-muted-foreground'>Total Pieces in Memory</div>
                    <div className='text-lg font-semibold'>{stats.memoryStats.totalPieces || 0}</div>
                  </div>
                </div>
                <div className='space-y-2 pt-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>System Memory Usage</span>
                    <span className='font-medium'>
                      {formatBytes(stats.memoryStats.usedMemory || 0)} /{' '}
                      {formatBytes(stats.memoryStats.maxMemory || 0)}
                    </span>
                  </div>
                  <Progress
                    value={
                      stats.memoryStats.maxMemory > 0
                        ? (stats.memoryStats.usedMemory / stats.memoryStats.maxMemory) * 100
                        : 0
                    }
                    className='h-2'
                  />
                </div>
              </div>

              {/* Pieces List (if not too many) */}
              {stats.pieces && stats.totalPieces <= 50 && (
                <Accordion type='single' collapsible>
                  <AccordionItem value='pieces'>
                    <AccordionTrigger className='text-sm font-medium'>Detailed Pieces ({stats.totalPieces})</AccordionTrigger>
                    <AccordionContent>
                      <div className='overflow-x-auto'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Index</TableHead>
                              <TableHead>Size</TableHead>
                              <TableHead>Complete</TableHead>
                              <TableHead>In Memory</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stats.pieces
                              .sort((a, b) => a.index - b.index)
                              .map((piece) => (
                                <TableRow key={piece.index}>
                                  <TableCell>{piece.index}</TableCell>
                                  <TableCell>{formatBytes(piece.size)}</TableCell>
                                  <TableCell>{piece.complete ? 'Yes' : 'No'}</TableCell>
                                  <TableCell>{piece.inMemory ? 'Yes' : 'No'}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
              {stats.totalPieces > 50 && (
                <div className='text-sm text-muted-foreground'>Piece list not shown (too many pieces: {stats.totalPieces})</div>
              )}
            </>
          )}
          {!stats?.totalPieces && (
            <div className='text-center py-8 text-muted-foreground'>No piece statistics available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
