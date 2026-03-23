import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";

import InputPassword from "@/components/input-password/InputPassword";
import PasswordStrengthMeter from "@/components/input-password/PasswordStrengthMeter";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AuthModel } from "@z3-wallet/types";
import { useChangePassword } from "../../hooks/use-change-password";

const changePasswordSchema = AuthModel.ChangePasswordSchema.extend({
  confirm_password: z
    .string()
    .min(8, { error: "Please confirm your new password" }),
})
  .refine((data) => data.new_password !== data.current_password, {
    message: "New password must be different from your current password",
    path: ["new_password"],
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export function ChangePasswordForm() {
  const mutation = useChangePassword();
  const form = useForm({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    validators: {
      onBlurAsync: changePasswordSchema,
    },
    onSubmit: async ({ formApi }) => {
      await mutation.mutateAsync({
        current_password: formApi.getFieldValue("current_password"),
        new_password: formApi.getFieldValue("new_password"),
      });
      toast.success("Change password successful");
      formApi.reset();
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="current_password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor={field.name}>Current Password</FieldLabel>
                  <InputPassword
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    aria-invalid={isInvalid || undefined}
                    visibilityLabels={{
                      show: "Show current password",
                      hide: "Hide current password",
                    }}
                  />
                </div>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="new_password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const password = field.state.value;

            return (
              <Field data-invalid={isInvalid}>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                  <InputPassword
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Create a new password"
                    autoComplete="new-password"
                    aria-invalid={isInvalid || undefined}
                    visibilityLabels={{
                      show: "Show new password",
                      hide: "Hide new password",
                    }}
                  />
                  <PasswordStrengthMeter password={password} />
                  <FieldDescription>
                    Your new password should be at least 8 characters long.
                  </FieldDescription>
                </div>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    aria-invalid={isInvalid || undefined}
                    visibilityLabels={{
                      show: "Show confirmed password",
                      hide: "Hide confirmed password",
                    }}
                  />
                </div>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>

      {/* <section className="bg-card/40 border-input/50 rounded-xl border p-4">
        <div className="mb-3 flex items-center gap-2">
          <Icon
            icon="solar:lock-keyhole-minimalistic-bold-duotone"
            className="text-primary size-5"
          />
          <p className="text-sm font-medium">Password tips</p>
        </div>

        <ul className="text-muted-foreground space-y-2 text-sm">
          {passwordTips.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <Icon
                icon="solar:check-circle-bold"
                className="text-primary mt-0.5 size-4 shrink-0"
              />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section> */}

      <Button
        className="w-full"
        type="submit"
        loading={form.state.isSubmitting}
        disabled={form.state.isSubmitting}
      >
        Update password
      </Button>
    </form>
  );
}
