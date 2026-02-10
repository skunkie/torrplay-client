'use client';

// Import base CSS for custom layouts
import '@vidstack/react/player/styles/base.css';

import { Capacitor } from '@capacitor/core';
import { ActivityAction, IntentLauncher, type IntentLauncherParams } from '@capgo/capacitor-intent-launcher';
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
import { useCallback, useEffect, useRef,useState } from 'react';

interface VideoPlayerProps {
  options: {
    src: VideoSrc;
    title?: string;
    autoPlay?: boolean;
  };
  onExit?: () => void;
}

type WebOSEnvironment = 'pending' | 'packaged' | 'browser' | 'none';

// Base WebOS response
interface WebOSResponse {
  returnValue: boolean;
  [key: string]: unknown;
}

// Types for the com.webos.app.mediadiscovery launch method
interface DLNAInfo {
  flagVal: number;
  cleartextSize: string;
  contentLength: string;
  opVal: number;
  protocolInfo: string;
  duration: number;
}

interface MediaPayload {
  fullPath: string;
  artist: string;
  subtitle: string;
  dlnaInfo: DLNAInfo;
  mediaType: 'VIDEO' | 'AUDIO';
  thumbnail: string;
  deviceType: 'DMR';
  album: string;
  fileName: string;
  lastPlayPosition: number;
}

interface AppManagerLaunchParams {
  id: string;
  params: {
    payload: MediaPayload[];
  };
}

interface WebOSAppManagerRequestParams {
  method: 'launch';
  parameters: AppManagerLaunchParams;
  onSuccess: () => void;
  onFailure: (res: WebOSResponse) => void;
}

interface WebOS {
  service: {
    request: (uri: string, params: WebOSAppManagerRequestParams) => void;
  };
}

declare global {
  interface Window {
    webOS: WebOS;
  }
}

const IS_NATIVE = Capacitor.isNativePlatform();

const VideoPlayer: React.FC<VideoPlayerProps> = ({ options, onExit }) => {
  const { src, autoPlay, title } = options;
  const player = useRef<MediaPlayerInstance>(null);
  const intentLaunched = useRef(false);
  const [webOSEnvironment, setWebOSEnvironment] = useState<WebOSEnvironment>('pending');

  useEffect(() => {
    const userAgentContainsWebOS = typeof window !== 'undefined' && window.navigator.userAgent.includes('Web0S');
    if (userAgentContainsWebOS) {
      if (window.webOS && window.webOS.service && typeof window.webOS.service.request === 'function') {
        setWebOSEnvironment('packaged');
      } else {
        setWebOSEnvironment('browser');
      }
    } else {
      setWebOSEnvironment('none');
    }
  }, []);

  useEffect(() => {
    if (autoPlay && !IS_NATIVE) {
      player.current?.enterFullscreen();
    }
  }, [autoPlay]);

  const playOnWebOSPackaged = useCallback((url: string, mediaTitle?: string, mimeType?: string) => {
    const payload: MediaPayload = {
      fullPath: url,
      fileName: mediaTitle || ' ',
      mediaType: 'VIDEO',
      dlnaInfo: {
        flagVal: 4096,
        cleartextSize: '-1',
        contentLength: '-1',
        opVal: 1,
        protocolInfo: `http-get:*:${mimeType || 'video/mp4'}:DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000`,
        duration: 0
      },
      artist: '',
      subtitle: '',
      thumbnail: '',
      deviceType: 'DMR',
      album: '',
      lastPlayPosition: -1
    };

    const params: WebOSAppManagerRequestParams = {
      method: 'launch',
      parameters: {
        id: 'com.webos.app.mediadiscovery',
        params: {
          payload: [payload]
        }
      },
      onSuccess: () => {
        console.log('Media Discovery app launched successfully on WebOS');
        if (onExit) onExit();
      },
      onFailure: (res: WebOSResponse) => {
        console.error('Failed to launch Media Discovery app on WebOS', res);
        if (onExit) onExit();
      }
    };

    window.webOS.service.request('luna://com.webos.applicationManager', params);
  }, [onExit]);

  useEffect(() => {
    if (webOSEnvironment === 'pending' || !src || !autoPlay || intentLaunched.current) return;

    let url: string | undefined;
    let mimeType: string | undefined;

    if (typeof src === 'string') {
      url = src;
    } else if (src && 'src' in src && typeof src.src === 'string') {
      url = src.src;
      if (typeof src.type === 'string') {
        mimeType = src.type;
      }
    }

    if (!url) {
      if (onExit) onExit();
      return;
    }

    intentLaunched.current = true;

    if (webOSEnvironment === 'packaged') {
      playOnWebOSPackaged(url, title, mimeType);
    } else if (webOSEnvironment === 'browser') {
      window.location.href = url;
      if (onExit) setTimeout(onExit, 100);
    } else if (IS_NATIVE) {
      try {
        const intentPayload: IntentLauncherParams = {
          action: ActivityAction.VIEW,
          data: url,
          type: mimeType || 'video/*',
        };
        if (title) {
          intentPayload.extra = { 'android.intent.extra.TITLE': title, title: title };
        }
        IntentLauncher.startActivityAsync(intentPayload);
        if (onExit) setTimeout(onExit, 100);
      } catch (error) {
        console.error('Failed to open URL with IntentLauncher', error);
        if (onExit) onExit();
      }
    }
  }, [src, autoPlay, title, onExit, webOSEnvironment, playOnWebOSPackaged]);

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

  const seek = (seconds: number) => {
      if (player.current) {
          player.current.currentTime += seconds;
      }
  };

  if (IS_NATIVE || webOSEnvironment === 'packaged' || webOSEnvironment === 'browser') {
    return null;
  }

  return (
    <MediaPlayer
      ref={player}
      className='group bg-black text-white font-sans rounded-lg'
      title={title}
      src={src}
      autoPlay={autoPlay}
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
