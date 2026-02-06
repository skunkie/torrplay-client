'use client';

import { ImageOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateTorrent } from '@/lib/api/torrents';
import type { Torrent } from '@/lib/types/api';

interface EditTorrentDialogProps {
  torrent: Torrent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditTorrentDialog({ torrent, open, onOpenChange, onSuccess }: EditTorrentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [poster, setPoster] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (torrent) {
      setTitle(torrent.title || '');
      setPoster(torrent.poster || '');
      setCategory(torrent.category || '');
    }
  }, [torrent]);

  const handleSubmit = async () => {
    if (!torrent) return;

    setLoading(true);

    try {
      await updateTorrent(torrent.infohash, {
        title: title || undefined,
        poster: poster || undefined,
        category: category || undefined,
      });

      toast.success('Torrent updated', {
        description: 'The torrent metadata has been updated successfully',
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update torrent',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!torrent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Edit Torrent Metadata</DialogTitle>
          <DialogDescription>Update the title, poster, and category for this torrent</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='edit-title'>Title</Label>
            <Input id='edit-title' placeholder='Enter title' value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='edit-category'>Category</Label>
            <Input
              id='edit-category'
              placeholder='Movies, TV, Cartoons...'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='edit-poster'>Poster URL</Label>
            <Input
              id='edit-poster'
              placeholder='https://...'
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
            />
          </div>

          <div className='rounded-lg border border-border p-2'>
            <p className='text-xs text-muted-foreground mb-2'>Preview:</p>
            {poster ? (
              <Image
                src={poster}
                alt='Poster preview'
                width={128}
                height={192}
                className='w-32 h-48 object-cover rounded-md bg-muted'
              />
            ) : (
              <div className='w-32 h-48 flex items-center justify-center bg-muted rounded-md'>
                <ImageOff className='w-12 h-12 text-muted-foreground' />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
