"use client";

export default function LoginError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <div data-testid="login-error" role="alert">
      <p>Something went wrong.</p>
      <button type="button" onClick={props.reset}>
        Try again
      </button>
    </div>
  );
}
