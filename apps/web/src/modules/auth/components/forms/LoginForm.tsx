import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import InputPassword from "@/components/input-password/InputPassword";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { useSignIn } from "../../hooks/use-sign-in";
import { AuthModel } from "@z3-wallet/types/auth";
import { useRouterState } from "@tanstack/react-router";
import { buildGithubStartUrl } from "../../lib/oauth";

export default function LoginForm() {
  const signInMutation = useSignIn();
  const {
    location: { searchStr },
  } = useRouterState();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: AuthModel.SignInSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await signInMutation.mutateAsync(value);
      formApi.reset();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="email"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10"
                    />
                    <Icon
                      icon="solar:letter-bold-duotone"
                      className="text-muted-foreground absolute top-1/2 left-3 size-5 -translate-y-1/2"
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </div>
              </Field>
            );
          }}
        />
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <InputPassword
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={isInvalid || undefined}
                    leadingIcon="solar:lock-password-bold-duotone"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </div>
              </Field>
            );
          }}
        />
      </FieldGroup>
      <div className="mt-6 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="border-border rounded" />
          <span className="text-muted-foreground">Remember me</span>
        </label>
        <a
          href="#"
          className="text-primary text-sm font-medium hover:underline"
        >
          Forgot password?
        </a>
      </div>
      <Button
        type="submit"
        className="mt-6 w-full"
        loading={signInMutation.isPending}
        disabled={signInMutation.isPending}
      >
        <Icon icon="solar:login-3-bold" className="mr-2 size-5" />
        Sign In
      </Button>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="border-border w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background text-muted-foreground px-2">
              Or continue with
            </span>
          </div>
        </div>
        <div className="mt-6">
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={() => {
              window.location.assign(
                buildGithubStartUrl({
                  source: "login",
                  searchStr,
                }),
              );
            }}
          >
            <Icon icon="mdi:github" className="size-5 text-white" />
            Login with GitHub
          </Button>
        </div>
      </div>
    </form>
  );
}
