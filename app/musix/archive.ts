export interface ArchivedSong {
  week: string
  songName: string
  artist: string
  youtubeId: string
}

export function getArchivedSongs(): ArchivedSong[] {
  return [
    {
      week: "week 01",
      songName: "kilby girl",
      artist: "the backseat lovers",
      youtubeId: "oTwVce9eWb4"
    },
    {
      week: "week 02",
      songName: "dead girl in the pool.",
      artist: "girl in red",
      youtubeId: "Ra9KtiCMynE"
    },
    {
      week: "week 03",
      songName: "better",
      artist: "regina spektor",
      youtubeId: "eAR2iHYNIe4"
    },
    {
      week: "week 04",
      songName: "why this kolaveri di?",
      artist: "dhanush",
      youtubeId: "geIAO3PrE2g"
    },
    {
      week: "week 05",
      songName: "motels",
      artist: "royel otis",
      youtubeId: "_J3Lks5GVQs"
    },
    {
      week: "week 06",
      songName: "bloom",
      artist: "the paper kites",
      youtubeId: "Cyx2CWBVfDE"
    },
    {
      week: "week 07",
      songName: "brazil",
      artist: "declan mckenna",
      youtubeId: "sSUecTSYulM"
    },
    {
      week: "week 08",
      songName: "memoria (burnt edit)",
      artist: "philip mchale",
      youtubeId: "RREc6aKHk-M"
    },
    {
      week: "week 09",
      songName: "anything",
      artist: "adrianne lenker",
      youtubeId: "pftT6MhrtLE"
    },
    {
      week: "week 10",
      songName: "ode to the mets",
      artist: "the strokes",
      youtubeId: "CU0i9W_XkDI"
    },
    {
      week: "week 11",
      songName: "now/before",
      artist: "german error message",
      youtubeId: "-5FLliixUqI"
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