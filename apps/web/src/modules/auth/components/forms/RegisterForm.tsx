import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import InputPassword from "@/components/input-password/InputPassword";
import PasswordStrengthMeter from "@/components/input-password/PasswordStrengthMeter";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { useSignUp } from "@/modules/auth/hooks/use-sign-up";
import { AuthModel } from "@z3-wallet/types/auth";
import z from "zod";

const formSchema = AuthModel.SignUpSchema.extend({
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export default function RegisterForm() {
  const signUpMutation = useSignUp();

  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await signUpMutation.mutateAsync(value);
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
          name="username"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10"
                    />
                    <Icon
                      icon="solar:user-circle-bold-duotone"
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
            const password = field.state.value;

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
                    autoComplete="new-password"
                    aria-invalid={isInvalid || undefined}
                    leadingIcon="solar:lock-password-bold-duotone"
                    className="duration-300"
                  />
                  <PasswordStrengthMeter password={password} />
                  <p className="text-muted-foreground mt-1 text-xs">
                    Must be at least 8 characters
                  </p>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </div>
              </Field>
            );
          }}
        />
        <form.Field
          name="confirm_password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                  <InputPassword
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={isInvalid || undefined}
                    leadingIcon="solar:shield-check-bold-duotone"
                    visibilityLabels={{
                      show: "Show confirmed password",
                      hide: "Hide confirmed password",
                    }}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </div>
              </Field>
            );
          }}
        />
      </FieldGroup>

      <Button
        type="submit"
        className="mt-6 w-full"
        loading={signUpMutation.isPending}
        disabled={signUpMutation.isPending}
      >
        <Icon icon="solar:user-plus-bold" className="mr-2 size-5" />
        Create Account
      </Button>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="border-border w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background text-muted-foreground px-2">
              Or sign up with
            </span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" type="button">
            <Icon icon="logos:google-icon" className="mr-2 size-5" />
            Google
          </Button>
          <Button variant="outline" type="button">
            <Icon icon="logos:github-icon" className="mr-2 size-5" />
            GitHub
          </Button>
        </div>
      </div>
    </form>
  );
}
