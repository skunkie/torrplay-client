'use client';

import { BarChart3, Edit, ImageOff, Play, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SafeImage from '@/components/ui/safe-image';
import { VIDEO_EXTENSIONS } from '@/lib/constants';
import { formatRelativeTime } from '@/lib/format-utils';
import type { Torrent } from '@/lib/types/api';

interface TorrentCardProps {
  torrent: Torrent
  onEdit: (torrent: Torrent) => void
  onViewStats: (torrent: Torrent) => void
  onDelete: (torrent: Torrent) => void
  onPlay: (torrent: Torrent) => void
}

export function TorrentCard({ torrent, onEdit, onViewStats, onDelete, onPlay }: TorrentCardProps) {
  const displayDate = torrent.updatedAt || torrent.createdAt;
  const hasVideoFiles = torrent.files.some((file) =>
    VIDEO_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext)),
  );

  return (
    <Card className='overflow-hidden hover:border-primary/50 transition-colors flex flex-col'>
      <div className='relative w-full pt-[133.33%] bg-muted group'>
        <div className='absolute inset-0'>
          {torrent.poster ? (
            <SafeImage fill src={torrent.poster} alt={torrent.title || 'Torrent'} className='object-cover' />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <ImageOff className='w-16 h-16 text-muted-foreground' />
            </div>
          )}
          {hasVideoFiles && (
            <div className='absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
              <Button
                variant='ghost'
                size='icon'
                className='w-16 h-16 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground'
                onClick={() => onPlay(torrent)}
                title='Play video'
              >
                <Play className='h-8 w-8' />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className='p-4 flex flex-col flex-grow'>
        <h3 className='font-semibold line-clamp-3 leading-snug flex-grow' title={torrent.title || torrent.name}>
          {torrent.title || torrent.name}
        </h3>

        <div className='flex items-center justify-between text-sm text-muted-foreground mt-2'>
          {torrent.category ? (
            <Badge variant='secondary'>{torrent.category}</Badge>
          ) : (
            <span className='text-xs'>No category</span>
          )}
          <span className='text-xs'>{formatRelativeTime(displayDate)}</span>
        </div>

        <div className='mt-4 grid grid-cols-3 gap-4'>
          <Button
            variant='secondary'
            size='sm'
            onClick={() => onViewStats(torrent)}
            className='group hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors'
          >
            <BarChart3 className='h-4 w-4 mr-1 group-hover:text-white' />
            Stats
          </Button>
          <Button
            variant='secondary'
            size='sm'
            onClick={() => onEdit(torrent)}
            className='group hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors'
          >
            <Edit className='h-4 w-4 mr-1 group-hover:text-white' />
            Edit
          </Button>
          <Button
            variant='secondary'
            size='sm'
            onClick={() => onDelete(torrent)}
            className='group hover:bg-destructive hover:text-destructive-foreground transition-colors'
          >
            <Trash2 className='h-4 w-4 mr-1 group-hover:text-destructive-foreground' />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
