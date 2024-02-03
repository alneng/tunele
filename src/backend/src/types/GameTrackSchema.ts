export default interface GameTrackSchema {
  albumCover: string;
  artists: string[];
  createdAt?: string;
  date: string;
  externalUrl: string;
  id: number;
  song: string;
  stats: {
    [index: number]: number;
  };
  totalPlays: number;
  trackPreview: string;
}
