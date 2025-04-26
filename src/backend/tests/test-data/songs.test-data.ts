export const gameTrackDocumentExtras = {
  date: "2024-01-27",
  stats: {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  },
  totalPlays: 0,
};

export const NeverGonna = {
  song: "Never Gonna",
  artists: ["Rick Astley"],
  id: 1,
  trackPreview:
    "https://p.scdn.co/mp3-preview/b4c682084c3fd05538726d0a126b7e14b6e92c83?cid=b63841da22464ed5bc604e9230cb1b9d",
  albumCover:
    "https://i.scdn.co/image/ab67616d0000b27315ebbedaacef61af244262a8",
  externalUrl: "https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8",
};

export const TalkThatTalk = {
  song: "Talk that Talk",
  artists: ["TWICE"],
  id: 2,
  trackPreview:
    "https://p.scdn.co/mp3-preview/706c768ce6ae81c68fc557c326f4933b1c30f822?cid=b63841da22464ed5bc604e9230cb1b9d",
  albumCover:
    "https://i.scdn.co/image/ab67616d0000b273c3040848e6ef0e132c5c8340",
  externalUrl: "https://open.spotify.com/track/0RDqNCRBGrSegk16Avfzuq",
};

export const allTracks = {
  createdAt: "2024-01-26 23:27:00",
  snapshotId: "snapshot-2e1e16c0",
  spotifySnapshotId: "1234567890",
  resetHistory: [],
  tracklist: [
    {
      ...NeverGonna,
      playedBefore: true,
      spotifyUri: "4PTG3Z6ehGkBFwjybzWkR8",
    },
    {
      ...TalkThatTalk,
      playedBefore: false,
      spotifyUri: "0RDqNCRBGrSegk16Avfzuq",
    },
  ],
};
