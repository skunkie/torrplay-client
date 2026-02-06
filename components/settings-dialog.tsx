'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

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
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { getSettings, updateSettings } from '@/lib/api/settings';
import { API_BASE_URL } from '@/lib/constants';
import { formatBytes } from '@/lib/format-utils';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { data: settings, error, mutate } = useSWR(open ? '/api/v1/settings' : null, getSettings, {
    shouldRetryOnError: false, // Prevent retrying if the backend is down
  });

  const [dlnaEnabled, setDlnaEnabled] = useState(false);
  const [friendlyName, setFriendlyName] = useState('');
  const [maxMemory, setMaxMemory] = useState(512);
  const [apiUrl, setApiUrl] = useState('');
  const [initialApiUrl, setInitialApiUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const isLoadingSettings = open && !settings && !error;

  useEffect(() => {
    if (open) {
      const storedApiUrl = localStorage.getItem('NEXT_PUBLIC_API_URL') || API_BASE_URL;
      setApiUrl(storedApiUrl);
      setInitialApiUrl(storedApiUrl);
    }

    if (settings) {
      setDlnaEnabled(settings.enableDlna ?? false);
      setFriendlyName(settings.friendlyName || 'TorrPlay DLNA');
      setMaxMemory(settings.maxMemory / (1024 * 1024)); // Convert bytes to MB
    }
  }, [settings, open]);

  const handleSave = async () => {
    setSaving(true);

    // If the API URL has changed, ONLY update that and reload.
    if (apiUrl !== initialApiUrl) {
      localStorage.setItem('NEXT_PUBLIC_API_URL', apiUrl);
      toast.info('API URL updated', {
        description: 'The page will now reload to apply the new URL.',
        duration: 2500,
      });
      setTimeout(() => window.location.reload(), 2500); 
      return; // IMPORTANT: Exit here to prevent trying to save other settings
    }

    // If API URL is unchanged, proceed with saving other settings.
    if (!settings) {
      toast.error('Cannot save settings', {
        description: 'The backend is offline. Please verify your API URL.',
      });
      setSaving(false);
      return;
    }

    try {
      await updateSettings({
        enableDlna: dlnaEnabled,
        friendlyName: friendlyName,
        maxMemory: maxMemory * 1024 * 1024, // Convert MB to bytes
      });

      toast.success('Settings saved', {
        description: 'Your server settings have been updated successfully',
      });

      mutate();
      onOpenChange(false);
    } catch (error) {
      toast.error('Error saving settings', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setApiUrl(initialApiUrl);
    if (settings) {
      setDlnaEnabled(settings.enableDlna ?? false);
      setFriendlyName(settings.friendlyName || 'TorrPlay DLNA');
      setMaxMemory(settings.maxMemory / (1024 * 1024));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure your TorrPlay server and application settings</DialogDescription>
        </DialogHeader>

        <div className='grid gap-y-6 py-4 max-h-[60vh] overflow-y-auto pr-3 -mr-3'>
          {/* API Configuration - Always visible */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold text-foreground'>API Configuration</h3>
            <div className='space-y-2'>
              <Label htmlFor='api-url'>API URL</Label>
              <Input
                id='api-url'
                placeholder='http://localhost:8090'
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
              <p className='text-xs text-muted-foreground'>
                The URL of your TorrPlay server. The page will now reload if you change this.
              </p>
            </div>
          </div>

          {/* Server-Side Settings - Conditionally rendered */}
          <>
            {isLoadingSettings && (
              <div className='flex flex-col items-center justify-center gap-2 text-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>Loading server settings...</p>
              </div>
            )}

            {error && !isLoadingSettings && (
              <div className='rounded-md bg-destructive/10 border border-destructive/20 p-3'>
                <div className='flex items-start gap-3'>
                  <AlertTriangle className='h-5 w-5 text-destructive flex-shrink-0 mt-0.5' />
                  <div>
                    <h4 className='font-semibold text-destructive'>Failed to load server settings</h4>
                    <p className='text-xs text-destructive/80 mt-1'>
                      Could not connect to the backend. Please verify your API URL is correct and the server is running.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {settings && (
              <div className='space-y-6'>
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-foreground'>DLNA Configuration</h3>

                  <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='dlna-enabled'>Enable DLNA</Label>
                      <p className='text-xs text-muted-foreground'>Allow media streaming via DLNA protocol</p>
                    </div>
                    <Switch id='dlna-enabled' checked={dlnaEnabled} onCheckedChange={setDlnaEnabled} />
                  </div>

                  {dlnaEnabled && (
                    <div className='space-y-2'>
                      <Label htmlFor='friendly-name'>Friendly Name</Label>
                      <Input
                        id='friendly-name'
                        placeholder='TorrPlay DLNA'
                        value={friendlyName}
                        onChange={(e) => setFriendlyName(e.target.value)}
                        maxLength={64}
                      />
                      <p className='text-xs text-muted-foreground'>Display name for DLNA devices (1-64 characters)</p>
                    </div>
                  )}
                </div>

                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-foreground'>Memory Management</h3>

                  <div className='space-y-3'>
                    <div className='flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between'>
                      <Label htmlFor='max-memory'>Maximum Memory</Label>
                      <span className='text-sm font-mono text-muted-foreground'>
                        {formatBytes(maxMemory * 1024 * 1024)}
                      </span>
                    </div>

                    <Slider
                      id='max-memory'
                      min={32}
                      max={2048}
                      step={32}
                      value={[maxMemory]}
                      onValueChange={(value) => setMaxMemory(value[0])}
                      className='py-4'
                    />

                    <div className='flex justify-between text-xs text-muted-foreground'>
                      <span>32 MB</span>
                      <span>2 GB</span>
                    </div>

                    <p className='text-xs text-muted-foreground'>
                      Memory limit for piece storage. Lower values reduce memory usage but may impact streaming
                      performance.
                    </p>

                    {maxMemory < 128 && (
                      <div className='rounded-md bg-destructive/10 border border-destructive/20 p-3'>
                        <p className='text-xs text-destructive'>
                          Warning: Low memory settings may cause poor streaming performance for large files.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleReset} disabled={saving}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving || (isLoadingSettings && apiUrl === initialApiUrl)}>
            {saving ? (
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
