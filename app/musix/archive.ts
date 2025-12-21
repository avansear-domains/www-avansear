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
      songName: "Fuzzybrain",
      artist: "Dayglow",
      youtubeId: "YbUpScl0BXQ"
    },
    {
      week: "week 02",
      songName: "False Art",
      artist: "Ben Kessler",
      youtubeId: "bLawR8gJaW8"
    },
    {
      week: "week 03",
      songName: "Long Nights",
      artist: "Moondoggy",
      youtubeId: "C0Z1e5dLm1s"
    },
    {
      week: "week 04",
      songName: "Side by Side",
      artist: "Jacklen Ro",
      youtubeId: "FFhAHf2cYeo"
    },
    {
      week: "week 05",
      songName: "Got Nuffin",
      artist: "Spoon",
      youtubeId: "GGMHzIbvdrY"
    },
    {
      week: "week 06",
      songName: "Chrissy",
      artist: "Feminine Feelings",
      youtubeId: "Jsb896uGYzM"
    },
    {
      week: "week 07",
      songName: "Kilby Girl",
      artist: "The Backseat Lovers",
      youtubeId: "oTwVce9eWb4"
    },
    {
      week: "week 08",
      songName: "dead girl in the pool.",
      artist: "girl in red",
      youtubeId: "Ra9KtiCMynE"
    },
    {
      week: "week 09",
      songName: "Better",
      artist: "Regina Spektor",
      youtubeId: "eAR2iHYNIe4"
    },
    {
      week: "week 10",
      songName: "Motels",
      artist: "Royel Otis",
      youtubeId: "_J3Lks5GVQs"
    },
    {
      week: "week 11",
      songName: "anything",
      artist: "Adrianne Lenker",
      youtubeId: "QuNFG3Zt4-Q"
    },
    {
      week: "week 12",
      songName: "Ode To The Mets",
      artist: "The Strokes",
      youtubeId: "CU0i9W_XkDI"
    },
    {
      week: "week 13",
      songName: "Easy Love",
      artist: "West 22nd",
      youtubeId: "xZhBtoEGyxI"
    },
    {
      week: "week 14",
      songName: "Old Car",
      artist: "Chrissy",
      youtubeId: "AOGR98rgwtQ"
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