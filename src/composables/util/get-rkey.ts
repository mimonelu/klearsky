const regexp = /\/([^\/]+)$/

export default function (text?: string): string {
  return (text?.match(regexp) ?? ["", ""])[1]
}
