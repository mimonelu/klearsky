export default {
  stringify (json: any): null | string {
    try {
      return JSON.stringify(json)
    } catch (error: any) {
      $warn("safeJson/stringify", error)
    }
    return null
  },

  parse (jsonString: null | string): null | any {
    if (jsonString != null) {
      try {
        return JSON.parse(jsonString)
      } catch (error: any) {
        $warn("safeJson/parse", error)
      }
    }
    return null
  },

  cloneJson (json: any): null | any {
    return this.parse(this.stringify(json))
  },
}
