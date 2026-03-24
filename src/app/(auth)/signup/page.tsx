import { AuthShell, SignupForm } from "@/presentation/components/auth";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="A few details and you’re ready to build consistency."
    >
      <SignupForm />
    </AuthShell>
  );
}
