'use client';

import { App } from '@capacitor/app';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { addTorrent } from '@/lib/api/torrents';
import type { TorrentAdd, TorrentAddWithFile } from '@/lib/types/api';

interface AddTorrentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialUrl?: string | null;
}

export function AddTorrentDialog({ open, onOpenChange, onSuccess, initialUrl }: AddTorrentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('magnet');
  const [magnet, setMagnet] = useState('');
  const [hash, setHash] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [poster, setPoster] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (initialUrl) {
      if (initialUrl.startsWith('magnet:')) {
        setMagnet(initialUrl);
        setActiveTab('magnet');
      }
    }
  }, [initialUrl]);

  useEffect(() => {
    const listenerPromise = App.addListener('appUrlOpen', (data) => {
      if (data.url.startsWith('magnet:')) {
        setMagnet(data.url);
        setActiveTab('magnet');
        onOpenChange(true);
      }
    });

    return () => {
      const removeListener = async () => {
        const listener = await listenerPromise;
        await listener.remove();
      };
      void removeListener();
    };
  }, [onOpenChange]);

  const resetForm = () => {
    setMagnet('');
    setHash('');
    setFile(null);
    setTitle('');
    setPoster('');
    setCategory('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleSuccess = () => {
    toast.success('Torrent added', { description: 'The torrent has been added successfully' });
    onSuccess();
    handleOpenChange(false);
  };

  const handleMagnetSubmit = async () => {
    setLoading(true);
    try {
      if (magnet.startsWith('magnet:')) {
        const data: TorrentAdd = {
          magnet: magnet,
          ...(title && { title }),
          ...(poster && { poster }),
          ...(category && { category }),
        };
        await addTorrent(data);
      } else {
        throw new Error('Invalid input. Please provide a magnet link.');
      }
      handleSuccess();
    } catch (error) {
      toast.error('Error adding torrent', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHashSubmit = async () => {
    setLoading(true);
    try {
      const data: TorrentAdd = {
        hash,
        ...(title && { title }),
        ...(poster && { poster }),
        ...(category && { category }),
      };
      await addTorrent(data);
      handleSuccess();
    } catch (error) {
      toast.error('Error adding torrent', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data: TorrentAddWithFile = {
        file,
        ...(title && { title }),
        ...(poster && { poster }),
      };
      await addTorrent(data);
      handleSuccess();
    } catch (error) {
      toast.error('Error adding torrent', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Add New Torrent</DialogTitle>
          <DialogDescription>Add a torrent using a magnet, info hash, or torrent file</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='magnet'>Magnet</TabsTrigger>
            <TabsTrigger value='hash'>Info Hash</TabsTrigger>
            <TabsTrigger value='file'>File</TabsTrigger>
          </TabsList>

          <TabsContent value='magnet' className='space-y-4 pt-4'>
            <div className='space-y-2'>
              <Label htmlFor='magnet'>Magnet</Label>
              <Input
                id='magnet'
                placeholder='magnet:?xt=urn:btih:...'
                value={magnet}
                onChange={(e) => setMagnet(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='title-magnet'>Title (optional)</Label>
              <Input
                id='title-magnet'
                placeholder='My Torrent'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='category-magnet'>Category (optional)</Label>
              <Input
                id='category-magnet'
                placeholder='Movies, TV, Cartoons...'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='poster-magnet'>Poster URL (optional)</Label>
              <Input
                id='poster-magnet'
                placeholder='https://...'
                value={poster}
                onChange={(e) => setPoster(e.target.value)}
              />
            </div>

            <Button onClick={handleMagnetSubmit} disabled={!magnet || loading} className='w-full'>
              {loading ? 'Adding...' : 'Add Torrent'}
            </Button>
          </TabsContent>

          <TabsContent value='hash' className='space-y-4 pt-4'>
            <div className='space-y-2'>
              <Label htmlFor='hash'>Info Hash</Label>
              <Input
                id='hash'
                placeholder='1234567890abcdef...'
                value={hash}
                onChange={(e) => setHash(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='title-hash'>Title (optional)</Label>
              <Input
                id='title-hash'
                placeholder='My Torrent'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='category-hash'>Category (optional)</Label>
              <Input
                id='category-hash'
                placeholder='Movies, TV, Cartoons...'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='poster-hash'>Poster URL (optional)</Label>
              <Input
                id='poster-hash'
                placeholder='https://...'
                value={poster}
                onChange={(e) => setPoster(e.target.value)}
              />
            </div>

            <Button onClick={handleHashSubmit} disabled={!hash || loading} className='w-full'>
              {loading ? 'Adding...' : 'Add Torrent'}
            </Button>
          </TabsContent>

          <TabsContent value='file' className='space-y-4 pt-4'>
            <div className='space-y-2'>
              <Label htmlFor='file'>Torrent File</Label>
              <Input
                id='file'
                type='file'
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                accept='.torrent'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='title-file'>Title (optional)</Label>
              <Input
                id='title-file'
                placeholder='My Torrent'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='poster-file'>Poster URL (optional)</Label>
              <Input
                id='poster-file'
                placeholder='https://...'
                value={poster}
                onChange={(e) => setPoster(e.target.value)}
              />
            </div>

            <Button onClick={handleFileSubmit} disabled={!file || loading} className='w-full'>
              {loading ? 'Adding...' : 'Add Torrent'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
