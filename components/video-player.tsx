'use client';

// Import base CSS for custom layouts
import '@vidstack/react/player/styles/base.css';

import { Capacitor } from '@capacitor/core';
import { ActivityAction, IntentLauncher, IntentLauncherParams } from '@capgo/capacitor-intent-launcher';
import {
  Controls,
  MediaPlayer,
  type MediaPlayerInstance,
  MediaProvider,
  PlayButton,
  Spinner,
  Time,
  TimeSlider,
  type VideoSrc,
} from '@vidstack/react';
import {
  PauseIcon,
  PlayIcon,
  SeekBackward10Icon,
  SeekForward10Icon
} from '@vidstack/react/icons';
import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  options: {
    src: VideoSrc
    title?: string
    autoPlay?: boolean
  };
  onExit?: () => void;
}

const IS_NATIVE = Capacitor.isNativePlatform();

const VideoPlayer: React.FC<VideoPlayerProps> = ({ options, onExit }) => {
  const player = useRef<MediaPlayerInstance>(null);
  const intentLaunched = useRef(false);

  useEffect(() => {
    const openInExternalPlayer = () => {
      if (IS_NATIVE && options?.src && options.autoPlay && !intentLaunched.current) {
        intentLaunched.current = true;

        let url: string | undefined;
        if (typeof options.src === 'string') {
          url = options.src;
        } else if ('src' in options.src && typeof options.src.src === 'string') {
          url = options.src.src;
        }

        if (!url) {
          console.error('Video source is not a valid URL for an external player.');
          if (onExit) onExit();
          return;
        }

        try {
          const intentPayload: IntentLauncherParams = {
            action: ActivityAction.VIEW,
            data: url,
            type: 'video/*',
          };

          if (options.title) {
            intentPayload.extra = {
              'android.intent.extra.TITLE': options.title,
              'title': options.title,
            };
          }

          IntentLauncher.startActivityAsync(intentPayload);
          if (onExit) {
            setTimeout(onExit, 100);
          }
        } catch (error) {
          console.error('Failed to open URL with IntentLauncher', error);
          if (onExit) onExit();
        }
      }
    };

    openInExternalPlayer();
  }, [options, onExit]);

  const BufferingIndicator = () => {
    return (
      <div className='pointer-events-none absolute inset-0 z-50 flex h-full w-full items-center justify-center'>
        <Spinner.Root
          className='text-white opacity-0 transition-opacity duration-200 ease-linear media-buffering:animate-spin media-buffering:opacity-100'
          size={84}
        >
          <Spinner.Track className='opacity-25' width={8} />
          <Spinner.TrackFill className='opacity-75' width={8} />
        </Spinner.Root>
      </div>
    );
  };

  useEffect(() => {
    if (options.autoPlay && !IS_NATIVE) {
      player.current?.enterFullscreen();
    }
  }, [options.autoPlay]);

  const seek = (seconds: number) => {
      if (player.current) {
          player.current.currentTime += seconds;
      }
  };

  if (IS_NATIVE) {
    return null;
  }

  return (
    <MediaPlayer
      ref={player}
      className='group bg-black text-white font-sans rounded-lg'
      title={options.title}
      src={options.src}
      autoPlay={options.autoPlay}
      onFullscreenChange={(isFullscreen) => {
        if (!isFullscreen && onExit) {
          onExit();
        }
      }}
      playsInline
    >
      <MediaProvider />
      <BufferingIndicator />
      <div className='absolute inset-0 z-10 opacity-0 group-data-[controls]:opacity-100 transition-opacity'>
        <div className='absolute inset-0 flex items-center justify-center gap-x-12'>
          <div onClick={() => seek(-10)} className='flex h-24 w-24 items-center justify-center rounded-full bg-white/50 text-white ring-white/50 transition-all hover:bg-primary/70 focus:ring-4 disabled:hidden'>
            <SeekBackward10Icon className='h-14 w-14' />
          </div>
          <PlayButton className='flex h-28 w-28 items-center justify-center rounded-full bg-white/50 text-white ring-white/50 transition-all hover:bg-primary/70 focus-visible:ring-4 disabled:hidden outline-none'>
            <PlayIcon className='h-16 w-16 hidden group-data-[paused]:block' />
            <PauseIcon className='h-16 w-16 hidden group-data-[playing]:block' />
          </PlayButton>
          <div onClick={() => seek(10)} className='flex h-24 w-24 items-center justify-center rounded-full bg-white/50 text-white ring-white/50 transition-all hover:bg-primary/70 focus:ring-4 disabled:hidden'>
            <SeekForward10Icon className='h-14 w-14' />
          </div>
        </div>
        <div className='absolute inset-x-0 bottom-0 w-full h-2/5 bg-gradient-to-t from-black/50 to-transparent pointer-events-none' />
        <Controls.Group className='absolute bottom-3 lg:bottom-10 left-0 right-0 flex flex-col items-center px-2 py-4'>
          <TimeSlider.Root className='mx-2 media-slider group relative inline-flex h-10 w-full cursor-pointer select-none items-center outline-none'>
            <TimeSlider.Track className='relative ring-sky-400 z-0 h-2.5 w-full rounded-sm bg-white/20 group-data-[focus]:ring-[3px]'>
              <TimeSlider.TrackFill className='bg-white/70 absolute h-full w-[var(--slider-fill)] rounded-sm will-change-[width]' />
              <TimeSlider.Progress className='absolute z-10 h-full w-[var(--slider-progress)] rounded-sm bg-white/30 will-change-[width]' />
            </TimeSlider.Track>
            <TimeSlider.Thumb className='absolute left-[var(--slider-fill)] z-20 h-5 w-5 -translate-x-1/2 rounded-full border border-primary bg-white shadow-sm ring-white/40 will-change-[left] group-data-[active]:ring-4' />
          </TimeSlider.Root>
          <div className='w-full flex justify-between text-sm px-2'>
            <Time type='current' />
            <Time type='duration' />
          </div>
        </Controls.Group>
      </div>
    </MediaPlayer>
  );
};

export default VideoPlayer;
