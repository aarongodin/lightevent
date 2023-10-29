import { createContext, PropsWithChildren, useContext, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { Button } from "./units/button"

type PromptKind = "confirm"

type PromptStackItem = {
  // kind represents variations of prompts
  kind: PromptKind
  element: JSX.Element
}

type PromptContextValue = {
  stack: PromptStackItem[]
  setStack: (stack: PromptStackItem[]) => void
}

type ConfirmationResponse = {
  ok: boolean
}

type Prompt = {
  // confirm shows the user a confirm/deny prompt and returns a promise for the resulting user action.
  confirm(message: string): Promise<ConfirmationResponse>
}

const PromptContext = createContext({
  stack: [],
  setStack: () => {
    // noop
  },
} as PromptContextValue)

// PromptProvider wraps the normal provider with state tracking for the value
export function PromptProvider({ children }: PropsWithChildren) {
  const [stack, setStack] = useState<PromptContextValue["stack"]>([])
  return <PromptContext.Provider value={{ stack, setStack }}>{children}</PromptContext.Provider>
}

// confirm accepts the prompt context and pushes a new confirm item onto the stack.
function confirm(ctx: PromptContextValue, message: string): Promise<ConfirmationResponse> {
  let resolve = (_: ConfirmationResponse) => {
    // noop
  }
  const result = new Promise<ConfirmationResponse>((res, _) => {
    resolve = res
  })

  function popAndResolve(resp: ConfirmationResponse) {
    ctx.setStack([...ctx.stack.slice(0, ctx.stack.length - 1)])
    resolve(resp)
  }

  ctx.setStack([
    ...ctx.stack,
    {
      kind: "confirm",
      element: (
        <>
          <span>{message}</span>
          <div className="flex flex-row-reverse gap-4 mt-4">
            <Button onClick={() => popAndResolve({ ok: true })}>Confirm</Button>
            <Button color="white" onClick={() => popAndResolve({ ok: false })}>
              Cancel
            </Button>
          </div>
        </>
      ),
    },
  ])
  return result
}

// usePrompt gives accces to the Prompt object for controlling the prompt stack.
export function usePrompt(): Prompt {
  const prompt = useContext(PromptContext)

  return {
    confirm: confirm.bind(null, prompt),
  }
}

interface PromptContainerProps extends PropsWithChildren {
  kind: PromptKind
}

// PromptContainer renders the dialog for the given prompt, based on the kind of prompt being rendered
function PromptContainer({ kind, children }: PromptContainerProps) {
  // TODO(aarongodin): allow "kind" to control things like the size of the dialog
  const ctx = useContext(PromptContext)

  const handleBackdropClick: React.MouseEventHandler = (event) => {
    if (event.target instanceof Element && event.target.id === "prompt-backdrop") {
      ctx.setStack([...ctx.stack.slice(0, ctx.stack.length - 1)])
    }
  }

  return (
    <dialog
      open
      id="prompt-backdrop"
      onClick={handleBackdropClick}
      className="fixed top-0 left-0 bg-transparent backdrop-blur w-screen h-screen"
    >
      <div className="fixed top-32 m-auto inset-x-0 z-10 w-96 p-4 bg-white drop-shadow rounded-lg">{children}</div>
    </dialog>
  )
}

// PromptView pulls the last prompt off the stack and renders it (in a portal).
export function PromptView() {
  const prompt = useContext(PromptContext)

  if (prompt.stack.length === 0) {
    return null
  }

  const item = prompt.stack[prompt.stack.length - 1]
  return createPortal(<PromptContainer kind={item.kind}>{item.element}</PromptContainer>, document.body)
}
