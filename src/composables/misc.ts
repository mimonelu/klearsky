// TODO: mainState に移行すること
export function blurElement () {
  (document.activeElement as null | HTMLElement)?.blur()
}
