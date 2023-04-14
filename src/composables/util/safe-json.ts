export default {
  stringify (json: any): null | string {
    try {
      return JSON.stringify(json)
    } catch (error: any) {
      console.error(error)
      return null
    }
  },

  parse (jsonString: string): null | any {
    try {
      return JSON.parse(jsonString)
    } catch (error: any) {
      console.error(error)
      return null
    }
  },
}
