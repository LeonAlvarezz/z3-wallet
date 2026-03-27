import { Link, useRouterState } from "@tanstack/react-router";
import RegisterForm from "../components/forms/RegisterForm";
import { getOAuthErrorMessage } from "../lib/oauth";

export default function RegisterPage() {
  const {
    location: { searchStr },
  } = useRouterState();
  const oauthErrorMessage = getOAuthErrorMessage(searchStr);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-y-auto p-6">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/10 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" />
      </div>
      <div className="border-border/50 bg-background/80 w-full max-w-md space-y-8 rounded-2xl border p-8 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-primary text-3xl font-bold tracking-tight">
            Create Account
          </h1>
          <p className="text-muted-foreground animate-in fade-in slide-in-from-top-2 mt-2 duration-700">
            Get started with your personal finance journey
          </p>
        </div>
        {oauthErrorMessage ? (
          <div className="bg-destructive/10 text-destructive rounded-lg border border-current/20 px-3 py-2 text-sm">
            {oauthErrorMessage}
          </div>
        ) : null}
        <RegisterForm />
        <div className="animate-in fade-in slide-in-from-bottom-2 mt-6 text-center text-sm duration-1000">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-primary font-semibold transition-all hover:tracking-wide hover:underline"
              preload={false}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
