'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Activity, Database, HardDrive, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getMemoryStats } from '@/lib/api/stats';
import { formatBytes } from '@/lib/format-utils';
import { MemoryStats } from '@/lib/types/api';

interface MetricsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MetricsDialog({ open, onOpenChange }: MetricsDialogProps) {
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);

  useEffect(() => {
    if (!open) {
      setMemoryStats(null);
      return;
    }

    let active = true;

    const fetchData = () => {
      getMemoryStats()
        .then((stats) => {
          if (active) {
            setMemoryStats(stats);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch memory stats', err);
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [open]);

  if (!open) return null;

  if (!memoryStats) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-[95vw] sm:max-w-2xl lg:max-w-4xl'>
          <VisuallyHidden>
            <DialogTitle>Loading...</DialogTitle>
          </VisuallyHidden>
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader className='flex-shrink-0'>
          <DialogTitle>System Metrics</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4 overflow-y-auto flex-1'>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            <Card className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-primary/10 flex-shrink-0'>
                  <HardDrive className='h-5 w-5 text-primary' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs text-muted-foreground'>Memory Usage</p>
                  <p className='text-lg font-semibold text-foreground truncate'>
                    {formatBytes(memoryStats.usedMemory || 0)}
                  </p>
                  <p className='text-xs text-muted-foreground truncate'>of {formatBytes(memoryStats.maxMemory || 0)}</p>
                </div>
              </div>
            </Card>

            <Card className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-accent/10 flex-shrink-0'>
                  <Database className='h-5 w-5 text-accent' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs text-muted-foreground'>Active Torrents</p>
                  <p className='text-lg font-semibold text-foreground'>{memoryStats.activeTorrents || 0}</p>
                  <p className='text-xs text-muted-foreground'>currently streaming</p>
                </div>
              </div>
            </Card>

            <Card className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-chart-3/10 flex-shrink-0'>
                  <Activity className='h-5 w-5 text-chart-3' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs text-muted-foreground'>Pieces in Memory</p>
                  <p className='text-lg font-semibold text-foreground'>
                    {(memoryStats.totalPieces || 0).toLocaleString()}
                  </p>
                  <p className='text-xs text-muted-foreground'>cached pieces</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
