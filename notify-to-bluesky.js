import { AtpAgent } from "@atproto/api"

async function notifyToBluesky () {
  const BLUESKY_HANDLE = process.env.BLUESKY_HANDLE
  const BLUESKY_PASSWORD = process.env.BLUESKY_PASSWORD
  const EVENT_NAME = process.env.GITHUB_EVENT_NAME
  const REPOSITORY = process.env.GITHUB_REPOSITORY
  const ACTOR = process.env.GITHUB_ACTOR
  const EVENT_PAYLOAD = process.env.EVENT_PAYLOAD

  if (!BLUESKY_HANDLE || !BLUESKY_PASSWORD) {
    console.error("Error: BLUESKY_HANDLE and BLUESKY_PASSWORD must be set")
    process.exit(1)
  }

  try {
    const agent = new AtpAgent({ service: "https://bsky.social" })

    await agent.login({
      identifier: BLUESKY_HANDLE,
      password: BLUESKY_PASSWORD,
    })

    console.log("Successfully logged in to Bluesky")

    let message = ""
    let payload = {}

    try {
      payload = JSON.parse(EVENT_PAYLOAD || "{}")
    } catch (e) {
      console.error("Failed to parse EVENT_PAYLOAD:", e)
    }

    switch (EVENT_NAME) {
      case "issues":
        if (payload.action === "opened") {
          message = `📝 New issue opened in ${REPOSITORY}\n` +
                   `"${payload.issue?.title}"\n` +
                   `by ${ACTOR} cc @mimonelu.net\n` +
                   `${payload.issue?.html_url}`
        } else if (payload.action === "closed") {
          message = `✅ Issue closed in ${REPOSITORY}\n` +
                   `"${payload.issue?.title}"\n` +
                   `by ${ACTOR} cc @mimonelu.net\n` +
                   `${payload.issue?.html_url}`
        }
        break

      case "pull_request":
        if (payload.action === "opened") {
          message = `🔀 New PR opened in ${REPOSITORY}\n` +
                   `"${payload.pull_request?.title}"\n` +
                   `by ${ACTOR} cc @mimonelu.net\n` +
                   `${payload.pull_request?.html_url}`
        } else if (payload.action === "closed" && payload.pull_request?.merged) {
          message = `✅ PR merged in ${REPOSITORY}\n` +
                   `"${payload.pull_request?.title}"\n` +
                   `by ${ACTOR} cc @mimonelu.net\n` +
                   `${payload.pull_request?.html_url}`
        }
        break

      case "issue_comment":
        if (payload.action === "created") {
          message = `💬 New comment on issue in ${REPOSITORY}\n` +
                   `"${payload.issue?.title}"\n` +
                   `by ${ACTOR} cc @mimonelu.net\n` +
                   `${payload.comment?.html_url}`
        }
        break

      case "pull_request_review":
        if (payload.action === "submitted") {
          message = `👀 New review on PR in ${REPOSITORY}\n` +
                   `"${payload.pull_request?.title}"\n` +
                   `by ${ACTOR} cc @mimonelu.net\n` +
                   `${payload.review?.html_url}`
        }
        break

      case "push":
        const commits = payload.commits || []
        const commitCount = commits.length
        if (commitCount > 0) {
          message = `🚀 ${commitCount} commit${commitCount > 1 ? "s" : ""} pushed to ${REPOSITORY}\n` +
                   `by ${ACTOR} cc @mimonelu.net\n` +
                   `${payload.compare}`
        }
        break

      case "release":
        if (payload.action === "published") {
          message = `🎉 New release published in ${REPOSITORY}\n` +
                   `"${payload.release?.name || payload.release?.tag_name}"\n` +
                   `by ${ACTOR} cc @mimonelu.net\n` +
                   `${payload.release?.html_url}`
        }
        break

      default:
        message = `🔔 ${EVENT_NAME} event in ${REPOSITORY} by ${ACTOR} cc @mimonelu.net`
    }

    if (!message) {
      console.log("No message to post for this event")
      return
    }

    if (message.length > 300) {
      message = message.substring(0, 297) + "..."
    }

    const result = await agent.post({
      text: message,
      createdAt: new Date().toISOString(),
    })

    console.log("Successfully posted to Bluesky:", result)
  } catch (error) {
    console.error("Error posting to Bluesky:", error)
    process.exit(1)
  }
}

notifyToBluesky()
