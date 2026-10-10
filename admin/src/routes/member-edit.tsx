import { useQuery } from "@connectrpc/connect-query"
import { useParams } from "react-router"

import { MemberForm } from "../forms/member"
import { LightEventService } from "../lib/rpc"
import { memberRoute, membersRoute } from "../router"
import { Content } from "../units/layout"
import { PageTitle } from "../units/page-title"
import { Query } from "../units/query"
import NotFound from "./not-found"

export default function MemberEdit() {
  const { memberUid = "" } = useParams()
  const query = useQuery(LightEventService.method.getMember, { uid: memberUid }, { staleTime: 0 })
  return (
    <Query query={query} notFound={<NotFound what="member" back={{ to: membersRoute, label: "Back to members" }} />}>
      {(resp) =>
        resp.member && (
          <>
            <PageTitle title="Edit member" back={{ to: memberRoute(memberUid), label: resp.member.email }} />
            <Content>
              <MemberForm member={resp.member} />
            </Content>
          </>
        )
      }
    </Query>
  )
}
