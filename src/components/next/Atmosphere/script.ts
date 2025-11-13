export default {
  lexicons: {
    "frontpage": "fyi.unravel.frontpage.post",
    "linkat": "blue.linkat.board",
    "skybemoreblue": "com.skybemoreblue.intro.introduction",
    "smokesignal": "events.smokesignal.calendar.event",
    "whitewind": "com.whtwnd.blog.entry",
  } as { [k: string]: string },

  includes (lexicon: string, profile?: null | TTProfile): boolean {
    return profile?.__repo?.collections?.includes(this.lexicons[lexicon]) ?? false
  },

  some (profile?: null | TTProfile): boolean {
    return Object.values(this.lexicons).some((lexicon) => {
      return profile?.__repo?.collections?.includes(lexicon) ?? false
    })
  },
}
