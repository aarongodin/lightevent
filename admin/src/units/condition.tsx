type ConditionProps = {
  value: boolean
  children: React.ReactNode | [React.ReactNode, React.ReactNode]
}

export function Condition({ value, children }: ConditionProps) {
  if (Array.isArray(children)) {
    return value ? children[0] : children[1]
  }

  return value ? children : null
}
