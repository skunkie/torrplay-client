import { api, HttpError } from '../api-client';
import type { MemoryStats, TorrentStats } from '../types/api';

export async function getMemoryStats(): Promise<MemoryStats> {
  return api.get<MemoryStats>('/api/stats/memory');
}

export async function getTorrentStats(hash: string): Promise<TorrentStats | null> {
  try {
    return await api.get<TorrentStats>(`/api/stats/torrents/${hash}`);
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) {
      return null;
    }
    throw err;
  }
}
