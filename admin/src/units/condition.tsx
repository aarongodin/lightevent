type ConditionProps = {
  value: boolean
  items: React.ReactNode | [React.ReactNode, React.ReactNode]
}

export function Condition({ value, items }: ConditionProps) {
  if (Array.isArray(items)) {
    return value ? items[0] : items[1]
  }

  return value ? items : null
}
