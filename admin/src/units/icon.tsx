type IconProps = {
  url: string
  className?: string
}

export function Icon({ url, className }: IconProps) {
  return <img src={url} className={`${className} w-6`} />
}
