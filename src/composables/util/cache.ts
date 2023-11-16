class Cache {
  items: { [k: string]: Array<any> }
  defaultMaxNumber: number
  maxNumbers: { [k: string]: number }

  constructor (maxNumbers: { [k: string]: number }) {
    this.items = {}
    this.defaultMaxNumber = 32
    this.maxNumbers = maxNumbers
  }

  get (group: string, key: string): undefined | any {
    if (this.items[group] == null) this.items[group] = []
    for (const item of this.items[group]) {
      if (item.key !== key) continue
      return item.value
    }
    return
  }

  set (group: string, key: string, value: any) {
    if (this.items[group] == null) this.items[group] = []
    for (const item of this.items[group]) {
      if (item.key !== key) continue
      item.value = value
      return
    }
    this.items[group].push({
      key,
      value,
    })
    const diff = this.items[group].length - (this.maxNumbers[group] ?? this.defaultMaxNumber)
    if (diff > 0) this.items[group].splice(0, diff)
  }
}

export default new Cache({
  blob: 32,
  logAudit: 64,
})
