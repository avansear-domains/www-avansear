export interface WeeklingEntry {
  week: string
  title: string
  description: string
  url: string
  publishedAt: string
}

export function getWeeklingEntries(): WeeklingEntry[] {
  return [
    {
      week: "week 01",
      title: "musix",
      description: "music archive and playlists",
      url: "/musix",
      publishedAt: "2024-12-15"
    },
    {
      week: "week 02",
      title: "mi favorita fonts",
      description: "my favorite fonts",
      url: "/mifavoritafonts",
      publishedAt: "2025-01-27"
    }
  ]
}

/*
    {
      week: "Week",
      title: "",
      description: "",
      url: "",
      publishedAt: ""
    }
*/
