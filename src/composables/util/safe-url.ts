export default function (url: string): undefined | URL {
  try {
    return new URL(url)
  } catch (error) { /**/ }
}
