type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout(props: AuthLayoutProps): React.JSX.Element {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[linear-gradient(160deg,#050505_0%,#111111_38%,#070707_100%)] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-14rem] h-[32rem] w-[32rem] rounded-full bg-white/10 blur-[140px]" />
        <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-zinc-400/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-96 w-96 rounded-full bg-zinc-200/6 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      </div>
      <div className="relative mx-auto flex min-h-dvh w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-10">
        {props.children}
      </div>
    </main>
  );
}
