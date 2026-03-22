// src/app/(auth)/login/error.tsx
'use client'

type LoginErrorProps = {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function LoginError(props: LoginErrorProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-sm text-[var(--color-danger)]">
        Something went wrong loading the login page.
      </p>
      <button
        type="button"
        onClick={props.reset}
        className="text-sm text-[var(--primary-500)] underline"
      >
        Try again
      </button>
    </div>
  )
}
