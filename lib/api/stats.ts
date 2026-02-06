import { api } from '../api-client';
import type { MemoryStats, TorrentStats } from '../types/api';

export async function getMemoryStats(): Promise<MemoryStats> {
  return api.get<MemoryStats>('/api/stats/memory');
}

export async function getTorrentStats(infohash: string): Promise<TorrentStats> {
  return api.get<TorrentStats>(`/api/stats/torrents/${infohash}`);
}
