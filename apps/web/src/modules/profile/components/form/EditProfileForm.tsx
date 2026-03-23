import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useGetMe } from "@/modules/auth/hooks/use-get-me";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useUpdateMe } from "../../hooks/use-update-me";
import AvatarSelectDrawer from "@/components/system-avatar/AvatarSelectDrawer";
import { useState } from "react";
import { Icon } from "@iconify/react";
import SystemAvatar from "@/components/system-avatar/SystemAvatar";
import { UserModel } from "@z3-wallet/types";

export function EditProfileForm() {
  const { data: me } = useGetMe();
  const [openAvatarSelect, setOpenAvatarSelect] = useState(false);

  const updateMeMutation = useUpdateMe();

  const form = useForm({
    defaultValues: {
      username: me?.username ?? "",
      avatar_url: me?.avatar_url ?? null,
    },
    validators: {
      onSubmit: UserModel.UpdateProfileSchema.required(),
    },
    onSubmit: async ({ value }) => {
      await updateMeMutation.mutateAsync({
        username: value.username.trim(),
        avatar_url: value.avatar_url?.trim() ?? null,
      });
      toast.success("Profile updated");
    },
  });

  //   if (!me) {
  //     return <Empty />;
  //   }

  return (
    <form className="space-y-6">
      <AvatarSelectDrawer
        open={openAvatarSelect}
        onOpenChange={(open) => setOpenAvatarSelect(open)}
        value={form.getFieldValue("avatar_url") || undefined}
        onChange={(value) => form.setFieldValue("avatar_url", value ?? "1")}
      />

      <section className="flex flex-col items-center justify-center gap-2">
        <div className="relative size-16">
          {/* <Avatar className="h-full w-full">
            <AvatarImage
              src={form.getFieldValue("avatar_url") || undefined}
              alt={`${form.getFieldValue("username")}-avatar`}
            />
            <AvatarFallback>
              {form.getFieldValue("username")?.slice(0, 1) || "?"}
            </AvatarFallback>
          </Avatar> */}

          <SystemAvatar
            id={form.getFieldValue("avatar_url") || "1"}
            alt={`${form.getFieldValue("username")}-avatar`}
            fallback={form.getFieldValue("username")[0]}
            className="size-16"
          />

          <Button
            type="button"
            variant="simple"
            className="bg-card absolute -right-1 bottom-0 z-50 rounded-full border"
            onClick={() => setOpenAvatarSelect(true)}
          >
            <Icon icon="solar:pen-bold" className="size-4" />
          </Button>
        </div>

        {/* <p>Change profile</p> */}
      </section>
      <section className="space-y-3">
        <form.Field
          name="username"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Your username"
                  />
                </div>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </section>

      <Button
        className="w-full"
        type="button"
        loading={updateMeMutation.isPending}
        disabled={!form.state.isValid || updateMeMutation.isPending}
        onClick={() => {
          //   e.preventDefault();
          console.log("Hello");
          form.handleSubmit();
        }}
      >
        Save changes
      </Button>
    </form>
  );
}
