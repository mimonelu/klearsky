function traverseJson(
  json: any,
  callback: (key: string, value: any, parent: any, deep: number) => void,
  deep = 0
) {
  for (const key in json) {
    callback(key, json[key], json, deep)
    if (json[key] instanceof Object) {
      traverseJson(json[key], callback, deep + 1)
    }
  }
}

export default traverseJson
