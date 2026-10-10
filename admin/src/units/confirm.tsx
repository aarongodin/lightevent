import { createContext, type PropsWithChildren, useCallback, useContext, useRef, useState } from "react"

import { Button } from "./button"
import { Checkbox } from "./field"
import { Modal } from "./modal"

type ConfirmOptions = {
  title: string
  message: string
  confirmLabel?: string
  // danger styles the confirm button for destructive actions.
  danger?: boolean
  // checkbox adds an option to the dialog, e.g. "Email the member".
  checkbox?: { label: string; defaultChecked: boolean }
}

export type ConfirmResult = { ok: boolean; checked: boolean }

type ConfirmFn = (options: ConfirmOptions) => Promise<ConfirmResult>

const ConfirmContext = createContext<ConfirmFn | null>(null)

// ConfirmProvider renders a single confirmation dialog that any component can open with useConfirm().
export function ConfirmProvider({ children }: PropsWithChildren) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [checked, setChecked] = useState(false)
  const resolver = useRef<((r: ConfirmResult) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts)
    setChecked(opts.checkbox?.defaultChecked ?? false)
    return new Promise((resolve) => {
      resolver.current = resolve
    })
  }, [])

  function finish(ok: boolean) {
    resolver.current?.({ ok, checked })
    resolver.current = null
    setOptions(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={options !== null}
        title={options?.title ?? ""}
        onClose={() => finish(false)}
        footer={
          <>
            <Button color={options?.danger ? "danger" : "primary"} onClick={() => finish(true)} autoFocus>
              {options?.confirmLabel ?? "Confirm"}
            </Button>
            <Button color="white" onClick={() => finish(false)}>
              Cancel
            </Button>
          </>
        }
      >
        <p>{options?.message}</p>
        {options?.checkbox && (
          <div className="mt-4">
            <Checkbox
              id="confirm-checkbox"
              label={options.checkbox.label}
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext)
  if (!confirm) {
    throw new Error("useConfirm must be used within ConfirmProvider")
  }
  return confirm
}
