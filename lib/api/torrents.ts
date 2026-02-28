import { api, getApiBaseUrl } from '../api-client';
import type { Torrent, TorrentAdd, TorrentAddWithFile, TorrentsResponse, TorrentUpdate } from '../types/api';

export async function getTorrents(params?: {
  categories?: string[]
  hashes?: string[]
  names?: string[]
  limit?: number
  offset?: number
}): Promise<TorrentsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.categories?.length) {
    params.categories.forEach((cat) => searchParams.append('categories', cat));
  }
  if (params?.hashes?.length) {
    params.hashes.forEach((hash) => searchParams.append('hashes', hash));
  }
  if (params?.names?.length) {
    params.names.forEach((name) => searchParams.append('names', name));
  }
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const query = searchParams.toString();
  const endpoint = `/api/v1/torrents${query ? `?${query}` : ''}`;
  return api.get<TorrentsResponse>(endpoint);
}


export async function addTorrent(data: TorrentAdd | TorrentAddWithFile): Promise<Torrent> {
  if ('file' in data && data.file instanceof File) {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.title) {
      formData.append('title', data.title);
    }
    if (data.poster) {
      formData.append('poster', data.poster);
    }
    // Assuming `api.post` can handle FormData and will set the Content-Type to multipart/form-data
    return api.post<Torrent>('/api/v1/torrents', formData);
  } else {
    return api.post<Torrent>('/api/v1/torrents', data as TorrentAdd);
  }
}

export async function getTorrent(hash: string): Promise<Torrent> {
  return api.get<Torrent>(`/api/v1/torrents/${hash}`);
}

export async function updateTorrent(hash: string, data: TorrentUpdate): Promise<Torrent> {
  return api.patch<Torrent>(`/api/v1/torrents/${hash}`, data);
}

export async function deleteTorrent(hash: string): Promise<void> {
  return api.delete<void>(`/api/v1/torrents/${hash}`);
}

export function getTorrentStreamUrl(hash: string, filepath: string): string {
  return `${getApiBaseUrl()}/api/v1/stream/${hash}?filepath=${encodeURIComponent(filepath)}`;
}
