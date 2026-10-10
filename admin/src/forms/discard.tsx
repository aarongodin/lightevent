import { useNavigate } from "react-router"

import { Button } from "../units/button"
import { useConfirm } from "../units/confirm"

// DiscardButton leaves a form, asking for confirmation only when there are unsaved changes.
export function DiscardButton({ to, dirty }: { to: string; dirty: boolean }) {
  const navigate = useNavigate()
  const confirm = useConfirm()
  async function onClick() {
    if (dirty) {
      const { ok } = await confirm({
        title: "Discard changes?",
        message: "Your unsaved changes will be lost.",
        confirmLabel: "Discard",
        danger: true,
      })
      if (!ok) {
        return
      }
    }
    navigate(to)
  }
  return (
    <Button color="white" onClick={onClick}>
      Cancel
    </Button>
  )
}
