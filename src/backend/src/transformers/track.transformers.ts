import ClientAllTracks from "../types/ClientAllTracks";
import ClientGameTrack from "../types/ClientGameTrack";
import GameTrackSchema from "../types/GameTrackSchema";
import TrackSchema from "../types/TrackSchema";

export const clientGameTrackTransformer = (
  gameTrack: GameTrackSchema
): ClientGameTrack => {
  return {
    song: gameTrack.song,
    artists: gameTrack.artists,
    id: gameTrack.id,
    trackPreview: gameTrack.trackPreview,
    albumCover: gameTrack.albumCover,
    externalUrl: gameTrack.externalUrl,
  };
};

export const clientAllTracksTransformer = (
  tracks: TrackSchema[]
): ClientAllTracks[] => {
  const tracklist: ClientAllTracks[] = tracks.map(({ song, artists }) => ({
    song,
    artists,
  }));
  return tracklist;
};
