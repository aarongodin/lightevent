type PageTitleProps = {
  title: string
  // Local actions are placed next to the title and affect the current page.
  localActions?: JSX.Element
  // External actions are placed on the right of the title area and should be used to navigate or perform an
  // action external to the current page.
  externalActions?: JSX.Element
}

export function PageTitle({ title, localActions, externalActions }: PageTitleProps) {
  return (
    <div className="bg-white border-b p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="font-bold text-lg mr-8">{title}</h1>
          {localActions}
        </div>
        <div className="flex gap-4 items-center min-h-[36px]">{externalActions}</div>
      </div>
    </div>
  )
}
