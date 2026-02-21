import { FirebaseGameTrack, FirebaseTrack, GameTrack, Track } from "@/types";

export const gameTrackTransformer = (
  gameTrack: FirebaseGameTrack
): GameTrack => {
  return {
    song: gameTrack.song,
    artists: gameTrack.artists,
    id: gameTrack.id,
    trackPreview: gameTrack.trackPreview,
    albumCover: gameTrack.albumCover,
    externalUrl: gameTrack.externalUrl,
  };
};

export const tracksTransformer = (tracks: FirebaseTrack[]): Track[] => {
  const tracklist: Track[] = tracks.map(({ song, artists }) => ({
    song,
    artists,
  }));
  return tracklist;
};
