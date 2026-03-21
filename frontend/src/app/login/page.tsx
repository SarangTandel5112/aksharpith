import { Button } from "@/shared/components/ui/button";

export default function LoginPage(): React.JSX.Element {
  return (
    <main
      data-testid="login-page"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50"
    >
      <Button variant="default">Login</Button>

      <Button variant="secondary">Login</Button>

      <Button variant="outline">Login</Button>

      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        POS Login
      </h1>
      <p className="text-sm text-zinc-500">Login form coming soon.</p>
    </main>
  );
}
