class Cache {
  items: Array<any>
  max: number

  constructor (max: number) {
    this.items = []
    this.max = max
  }

  get (key: string): undefined | any {
    for (const item of this.items) {
      if (item.key !== key) continue
      return item.value
    }
    return
  }

  set (key: string, value: any) {
    for (const item of this.items) {
      if (item.key !== key) continue
      item.value = value
      return
    }
    this.items.push({
      key,
      value,
    })
    const diff = this.items.length - this.max
    if (diff > 0) this.items.splice(0, diff)
  }
}

export default new Cache(64)
