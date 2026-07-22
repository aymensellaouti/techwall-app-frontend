export interface Category {
  id: string;
  key: string;
  label: string;
  description?: string;
  _count?: { playlists: number };
}

export interface Playlist {
  id: string;
  youtubePlaylistId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoCount: number;
  categoryId?: string;
  category?: Category;
  videos?: Video[];
  _count?: { videos: number };
}

export interface Video {
  id: string;
  youtubeVideoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  viewCount: number;
  publishedAt?: string;
  position: number;
  playlistId: string;
}

export interface Founder {
  id: string;
  name: string;
  role: string;
  bio: string;
  linkedin: string;
  photoUrl?: string;
}
