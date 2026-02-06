// API Types based on OpenAPI specification

interface MemoryStats {
  activeTorrents: number;
  maxMemory: number;
  totalPieces: number;
  usedMemory: number;
}

interface PieceInfo {
  complete: boolean;
  inMemory: boolean;
  index: number;
  size: number;
}

interface Settings {
  enableDlna: boolean
  friendlyName: string
  maxMemory: number
}

interface SystemInfo {
  buildDate: string;
  commit: string;
  uptime: number;
  version: string;
}

interface Torrent {
  category?: string
  createdAt: string
  files: TorrentFile[]
  infohash: string
  name: string
  pieceCount: number
  pieceSize: number
  poster?: string
  title?: string
  totalSize: number
  updatedAt: string
}

interface TorrentFile {
  length: number
  name: string
  path: string
}

interface TorrentAdd {
  category?: string
  infohash?: string
  magnet?: string
  poster?: string
  title?: string
}

interface TorrentAddWithFile {
  file: File;
  title?: string;
  poster?: string;
};

interface TorrentStats {
  completedSize: number;
  inMemory: number;
  inMemorySize: number;
  memoryStats: MemoryStats;
  memoryUsagePercentage: number;
  pieces: PieceInfo[];
  totalPieces: number;
  totalSize: number;
}

interface TorrentsResponse {
  limit: number
  offset: number
  torrents: Torrent[]
  total: number
}

interface TorrentUpdate {
  category?: string
  poster?: string
  title?: string
}

export type {
  MemoryStats,
  PieceInfo,
  Settings,
  SystemInfo,
  Torrent,
  TorrentAdd,
  TorrentAddWithFile,
  TorrentFile,
  TorrentsResponse,
  TorrentStats,
  TorrentUpdate
};
