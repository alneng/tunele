export type Track = {
  song: string;
  artists: string[];
};

export type FormattedTrack = {
  formattedString: string;
} & Track;

/**
 * Track metadata for the album cover, external URL, and preview.
 * Note that this backend type is in a detached state from the frontend type
 * because the backend enforces that a track preview is always available.
 */
export type TrackMetadata = {
  albumCover: string;
  externalUrl: string;
  trackPreview: string | null;
  nullPreview?: boolean; // Indicates if a preview is not available
};
