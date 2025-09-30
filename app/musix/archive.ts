export interface ArchivedSong {
  week: string
  songName: string
  artist: string
  youtubeId: string
}

export function getArchivedSongs(): ArchivedSong[] {
  return [
    {
      week: "week 1",
      songName: "kilby girl",
      artist: "the backseat lovers",
      youtubeId: "oTwVce9eWb4"
    },
    {
      week: "week 2",
      songName: "dead girl in the pool.",
      artist: "girl in red",
      youtubeId: "Ra9KtiCMynE"
    },
    {
      week: "week 3",
      songName: "better",
      artist: "regina spektor",
      youtubeId: "eAR2iHYNIe4"
    },
    {
      week: "week 4",
      songName: "why this kolaveri di?",
      artist: "dhanush",
      youtubeId: "geIAO3PrE2g"
    },
    {
      week: "week 5",
      songName: "motels",
      artist: "royel otis",
      youtubeId: "_J3Lks5GVQs"
    },
    {
      week: "week 6",
      songName: "bloom",
      artist: "the paper kites",
      youtubeId: "Cyx2CWBVfDE"
    },
    {
      week: "week 7",
      songName: "brazil",
      artist: "declan mckenna",
      youtubeId: "sSUecTSYulM"
    },
    {
      week: "week 8",
      songName: "memoria (burnt edit)",
      artist: "philip mchale",
      youtubeId: "RREc6aKHk-M"
    },
    {
      week: "week 9",
      songName: "anything",
      artist: "adrianne lenker",
      youtubeId: "pftT6MhrtLE"
    },
    {
      week: "week 10",
      songName: "ode to the mets",
      artist: "the strokes",
      youtubeId: "CU0i9W_XkDI"
    }
  ]
}

/*
    {
      week: "Week",
      songName: "",
      artist: "",
      youtubeId: ""
    }
*/