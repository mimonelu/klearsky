export default function (duration: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}
