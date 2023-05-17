export default async function (uri: string): Promise<{
  uri: string,
  title: string,
  description: string
}> {
  const response =
    await fetch(`https://mimonelu.net:4649/${uri}`, {
      headers: { "user-agent": "Klearsky" },
    })
    .then((response: Response) => {
      if (!response.ok) throw `Fetch error: ${response.statusText}`
      return response
    })
    .catch((error: any) => {
      throw error
    })
  const htmlString: string = await response.text()
  const parser = new DOMParser()
  const html = parser.parseFromString(htmlString, "text/html")
  const titleElement = html.querySelector("title")
  const ogTitleElement = html.querySelector("meta[property='og:title']")
  const descriptionElement = html.querySelector("meta[name='description']")
  const ogDescriptionElement = html.querySelector("meta[property='og:description']")
  const title = titleElement?.innerHTML ?? ""
  const ogTitle = ogTitleElement?.getAttribute("content") ?? ""
  const description = descriptionElement?.getAttribute("content") ?? ""
  const ogDscription = ogDescriptionElement?.getAttribute("content") ?? ""
  return {
    uri,
    title: ogTitle || title || "",
    description: ogDscription || description || "",
  }
}
