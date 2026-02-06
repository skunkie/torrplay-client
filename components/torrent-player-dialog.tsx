'use client';

import { type VideoMimeType } from '@vidstack/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getTorrentStreamUrl } from '@/lib/api/torrents';
import { VIDEO_EXTENSIONS } from '@/lib/constants';
import { type Torrent, type TorrentFile } from '@/lib/types/api';

import { Button } from './ui/button';
import VideoPlayer from './video-player';

interface TorrentPlayerDialogProps {
  torrent: Torrent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Set type to video/mp4 only for .mkv files.
const getVideoType = (filename: string) => {
  return filename.toLowerCase().endsWith('.mkv') ? ('video/mp4' as VideoMimeType) : '';
};

export const TorrentPlayerDialog = ({ torrent, open, onOpenChange }: TorrentPlayerDialogProps) => {
  const [videoFiles, setVideoFiles] = useState<TorrentFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<TorrentFile | null>(null);

  useEffect(() => {
    if (open && torrent) {
      const files = torrent.files
        .filter((f) => VIDEO_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext)))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      setVideoFiles(files);

      if (files.length === 1) {
        setSelectedFile(files[0]);
      }
    } else {
      setVideoFiles([]);
      setSelectedFile(null);
    }
  }, [open, torrent]);

  const handleExit = useCallback(() => {
    onOpenChange(false);
    setSelectedFile(null);
  }, [onOpenChange]);

  const videoPlayerOptions = useMemo(() => {
    if (selectedFile && torrent) {
      return {
        src: {
          src: getTorrentStreamUrl(torrent.infohash, selectedFile.path),
          type: getVideoType(selectedFile.name) as VideoMimeType,
        },
        title: selectedFile.name,
        autoPlay: true,
      };
    }
    return null;
  }, [selectedFile, torrent]);

  const isPlayerVisible = !!videoPlayerOptions;

  const renderContent = () => {
    if (isPlayerVisible) {
      return <>{open && <VideoPlayer options={videoPlayerOptions} onExit={handleExit} />}</>;
    }

    if (videoFiles.length > 1) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Select a video to play</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-2 max-h-[60vh] overflow-y-auto py-4'>
            {videoFiles.map((file) => (
              <Button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                variant='outline'
                className='whitespace-normal h-auto text-left'
              >
                {file.name}
              </Button>
            ))}
          </div>
        </>
      );
    }

    if (videoFiles.length === 0 && open) {
      return (
        <DialogHeader>
          <DialogTitle>No Playable Files</DialogTitle>
          <DialogDescription>No playable video files were found in this torrent.</DialogDescription>
        </DialogHeader>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={isPlayerVisible ? 'p-0 bg-transparent border-0 max-w-4xl aspect-video overflow-hidden' : 'sm:max-w-lg'}
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};