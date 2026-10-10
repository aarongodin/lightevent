import { useQuery } from "@connectrpc/connect-query"
import { useEffect, useState } from "react"
import { Link } from "react-router"

import type { Member } from "../gen/lightevent/v1/service_pb"
import { formatDate, formatName } from "../lib/format"
import { useDebouncedValue, usePageParams } from "../lib/hooks"
import { LightEventService } from "../lib/rpc"
import { memberRoute, newMemberRoute } from "../router"
import { Badge } from "../units/badge"
import { LinkButton } from "../units/button"
import { inputClassName } from "../units/field"
import { Content } from "../units/layout"
import { PageTitle } from "../units/page-title"
import { Pagination } from "../units/pagination"
import { Query } from "../units/query"
import { EmptyState, Table, Td } from "../units/table"

const PAGE_SIZE = 50

function MembersTable({ members }: { members: Member[] }) {
  return (
    <Table headers={[{ label: "Email" }, { label: "Name" }, { label: "Verified" }, { label: "Joined" }]}>
      {members.map((member) => (
        <tr key={member.uid} className="hover:bg-gray-50">
          <Td>
            <Link to={memberRoute(member.uid)} className="font-medium text-blue-700 hover:underline">
              {member.email}
            </Link>
          </Td>
          <Td>{formatName(member.firstName, member.lastName) || <span className="text-gray-400">—</span>}</Td>
          <Td>
            {member.verified ? <Badge variant="green">Verified</Badge> : <Badge variant="gray">Unverified</Badge>}
          </Td>
          <Td className="text-gray-600">{formatDate(member.createdAt)}</Td>
        </tr>
      ))}
    </Table>
  )
}

export default function Members() {
  const { offset, search, update } = usePageParams()
  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebouncedValue(searchInput)

  // biome-ignore lint/correctness/useExhaustiveDependencies: only sync when the debounced input changes
  useEffect(() => {
    if (debouncedSearch !== search) {
      update({ q: debouncedSearch, offset: null })
    }
  }, [debouncedSearch])

  const query = useQuery(
    LightEventService.method.listMembers,
    { search, limit: PAGE_SIZE, offset },
    { placeholderData: (prev) => prev },
  )

  return (
    <>
      <PageTitle title="Members" actions={<LinkButton to={newMemberRoute}>New member</LinkButton>} />
      <Content>
        <div className="mb-4 flex justify-end">
          <label className="w-full sm:w-72">
            <span className="sr-only">Search members</span>
            <input
              type="search"
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={inputClassName}
            />
          </label>
        </div>
        <Query query={query}>
          {(resp) =>
            resp.members.length === 0 ? (
              <EmptyState action={!search ? <LinkButton to={newMemberRoute}>Add a member</LinkButton> : undefined}>
                {search ? `No members match “${search}”.` : "No members yet."}
              </EmptyState>
            ) : (
              <>
                <MembersTable members={resp.members} />
                <Pagination
                  offset={offset}
                  limit={PAGE_SIZE}
                  total={resp.total}
                  onChange={(o) => update({ offset: o })}
                />
              </>
            )
          }
        </Query>
      </Content>
    </>
  )
}
