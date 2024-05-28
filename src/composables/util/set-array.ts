export default function (a?: Array<any>, b?: Array<any>) {
  if (b == null) {
    return
  }
  a?.splice(0, b.length, ...b)
}
