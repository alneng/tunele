export default interface GameTrackSchema {
  albumCover: string;
  artists: string[];
  createdAt?: string;
  date: string;
  externalUrl: string;
  id: number;
  song: string;
  stats: {
    0: number;
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
  };
  totalPlays: number;
  trackPreview: string;
}
