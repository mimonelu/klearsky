import format from "date-fns/format"
import intlFormatDistance from "date-fns/intlFormatDistance"
import isSameYear from "date-fns/isSameYear"
import endOfYesterday from "date-fns/endOfYesterday"

export default function (dateString?: string): string {
  if (dateString == null) return ""
  const now = new Date()
  const the = new Date(dateString)
  if (endOfYesterday() < the) return intlFormatDistance(the, now, { numeric: "always" })
  if (isSameYear(now, the)) return format(the, "MM/dd HH:mm")
  return format(the, "P")
}
