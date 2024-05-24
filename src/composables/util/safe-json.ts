export default {
  stringify (json: any): null | string {
    try {
      return JSON.stringify(json)
    } catch (error: any) {
      console.warn("[klearsky/safeJson/stringify]", error)
    }
    return null
  },

  parse (jsonString: null | string): null | any {
    if (jsonString != null) {
      try {
        return JSON.parse(jsonString)
      } catch (error: any) {
        console.warn("[klearsky/safeJson/parse]", error)
      }
    }
    return null
  },

  cloneJson (json: any): null | any {
    return this.parse(this.stringify(json))
  },
}
