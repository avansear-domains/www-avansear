export interface ArchivedSong {
  week: string
  songName: string
  artist: string
  youtubeId: string
}

export function getArchivedSongs(): ArchivedSong[] {
  return [
    {
      week: "Week 1",
      songName: "Kilby Girl",
      artist: "The Backseat Lovers",
      youtubeId: "oTwVce9eWb4"
    },
    {
      week: "Week 2",
      songName: "dead girl in the pool.",
      artist: "girl in red",
      youtubeId: "Ra9KtiCMynE"
    },
    {
      week: "Week 3",
      songName: "better",
      artist: "regina spektor",
      youtubeId: "eAR2iHYNIe4"
    },
    {
      week: "Week 4",
      songName: "why this kolaveri di?",
      artist: "dhanush",
      youtubeId: "geIAO3PrE2g"
    },
    {
      week: "Week 5",
      songName: "motels",
      artist: "royel otis",
      youtubeId: "_J3Lks5GVQs"
    },
    {
      week: "Week 6",
      songName: "bloom",
      artist: "the paper kites",
      youtubeId: "Cyx2CWBVfDE"
    },
    {
      week: "Week 7",
      songName: "brazil",
      artist: "declan mckenna",
      youtubeId: "sSUecTSYulM"
    },
    {
      week: "Week 8",
      songName: "memoria (burnt edit)",
      artist: "philip mchale",
      youtubeId: "RREc6aKHk-M"
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