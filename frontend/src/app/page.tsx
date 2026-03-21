import { redirect } from "next/navigation";

// Root route — always redirect to login for now.
// Once next-auth session checks are wired up, replace this with:
//   const session = await getServerSession(authOptions)
//   if (session) redirect('/pos/checkout')
//   else redirect('/login')
export default function RootPage(): never {
  redirect("/login");
}
