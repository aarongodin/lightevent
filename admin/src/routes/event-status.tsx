import type { Event } from "../gen/lightevent/v1/service_pb"
import { isPast } from "../lib/format"
import { Badge } from "../units/badge"

export function EventStatusBadges({ event }: { event: Event }) {
  const upcoming = event.dates.some((d) => !d.cancelled && !isPast(d.value))
  return (
    <div className="flex flex-wrap gap-1">
      {event.archived && <Badge variant="gray">Archived</Badge>}
      {!event.archived && !upcoming && <Badge variant="gray">Past</Badge>}
      {event.hidden ? (
        <Badge variant="amber" title="Not listed for members">
          Hidden
        </Badge>
      ) : (
        <Badge variant="green" title="Listed for members">
          Visible
        </Badge>
      )}
      {event.closed ? (
        <Badge variant="red" title="Members cannot register">
          Registration closed
        </Badge>
      ) : (
        <Badge variant="sky" title="Members can register">
          Registration open
        </Badge>
      )}
    </div>
  )
}
