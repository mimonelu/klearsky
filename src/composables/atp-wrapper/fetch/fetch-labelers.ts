import type { AppBskyLabelerGetServices } from "@atproto/api"
import CONSTS from "@/consts/consts.json"

export default async function (
  this: TIAtpWrapper,
  dids: string[],
  detailed?: boolean
): Promise<Error | Array<TILabeler>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyLabelerGetServices.QueryParams = { dids }
  if (detailed != null) {
    query.detailed = detailed
  }
  const response: Error | AppBskyLabelerGetServices.Response =
    await this.agent.app.bsky.labeler.getServices(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/fetchLabelers]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  const labelers = response.data.views as unknown as Array<TILabeler>

  // SEE: https://github.com/bluesky-social/atproto/blob/main/packages/api/definitions/labels.json
  const officialLabeler = labelers.find((labeler) => {
    return labeler.creator.did === CONSTS.OFFICIAL_LABELER_DID
  })
  if (officialLabeler != null) {
    CONSTS.OFFICIAL_SPECIAL_LABELERS.forEach((identifier: string) => {
      officialLabeler.policies.labelValueDefinitions?.unshift({
        adultOnly: false,
        blurs: "media",
        defaultSetting: "warn",
        identifier,
        locales: [
          {
            description: "",
            lang: "en",
            name: "",
          },
        ],
        severity: "alert",
      })
    })
  }

  return labelers
}
