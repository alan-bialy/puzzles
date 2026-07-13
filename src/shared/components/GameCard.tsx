import { Link } from 'react-router'

type GameCardProps = {
  title: string
  description: string
  actionLabel: string
  to?: string
  disabled?: boolean
  imageSrc?: string
  imageAlt?: string
}

export function GameCard({
  title,
  description,
  actionLabel,
  to,
  disabled = false,
  imageSrc,
  imageAlt = '',
}: GameCardProps) {
  const cardClassName =
    'group flex min-h-52 flex-col justify-between rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left shadow-sm transition sm:min-h-60 sm:p-6'

  const content = (
    <>
      <div>
        {imageSrc ? (
          <div className="mb-4 grid h-44 place-items-center overflow-hidden rounded-2xl bg-black/95 sm:h-44">
            <img
              src={`${import.meta.env.BASE_URL}${imageSrc}`}
              alt={imageAlt}
              className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-110"
              draggable={false}
            />
          </div>
        ) : (
          <div className="mb-4 grid grid-cols-5 gap-1.5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className={[
                  'aspect-square rounded-lg border text-center text-xs font-black leading-none',
                  index % 5 === 0
                    ? 'border-(--color-correct) bg-(--color-correct)'
                    : index % 3 === 0
                      ? 'border-(--color-present) bg-(--color-present)'
                      : 'border-(--color-tile-border) bg-(--color-tile-empty)',
                ].join(' ')}
              />
            ))}
          </div>
        )}

        <h2 className="text-xl font-black tracking-tight">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-(--color-muted)">
          {description}
        </p>
      </div>

      <div className="mt-6">
        <span
          className={[
            'inline-flex rounded-full px-4 py-2 text-sm font-bold transition',
            disabled
              ? 'bg-(--color-surface-strong) text-(--color-muted)'
              : 'bg-(--color-text) text-(--color-bg) group-hover:scale-[1.02]',
          ].join(' ')}
        >
          {actionLabel}
        </span>
      </div>
    </>
  )

  if (disabled || !to) {
    return (
      <button
        disabled
        className={`${cardClassName} cursor-not-allowed opacity-70`}
      >
        {content}
      </button>
    )
  }

  return (
    <Link
      to={to}
      className={`${cardClassName} hover:-translate-y-1 hover:shadow-md`}
    >
      {content}
    </Link>
  )
}