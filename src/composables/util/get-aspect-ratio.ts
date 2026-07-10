export default (
  aspectRatio: undefined | TTAspectRatio,
  imageMaxHeightRatio: undefined | number
): undefined | string => {
  if (aspectRatio?.width == null || aspectRatio?.height == null) {
    return undefined
  }
  const aspectHeight = aspectRatio.height / aspectRatio.width
  if (!imageMaxHeightRatio) {
    return `1 / ${aspectHeight}`
  }
  const computedHeight = Math.min(aspectHeight, imageMaxHeightRatio)
  return `1 / ${computedHeight}`
}
