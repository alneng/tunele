export type Track = {
  song: string;
  artists: string[];
};

export type FormattedTrack = {
  formattedString: string;
} & Track;

/**
 * Track metadata for the album cover, external URL, and preview.
 */
export type TrackMetadata = {
  albumCover: string;
  externalUrl: string;
  trackPreview: string;
};
