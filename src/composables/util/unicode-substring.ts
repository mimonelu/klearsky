// SEE: https://zenn.dev/leaner_dev/articles/20221014-javascript-unicode-substring#%E7%B5%B5%E6%96%87%E5%AD%97%E5%AF%BE%E5%BF%9C%E3%81%AE-substring
export default (text: string, start: number, end: number): string => {
  const regexp = new RegExp(`^.{${start}}(.{0,${end - start}})`, 'u')
  return text.match(regexp)?.[1] ?? ""
}
