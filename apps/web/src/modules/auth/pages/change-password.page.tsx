import { CommonHeader } from "@/components/header/CommonHeader";
import { ChangePasswordForm } from "../components/forms/ChangePasswordForm";

export function ChangePasswordPage() {
  return (
    <div className="app-page-compact flex h-full flex-col gap-6 overflow-y-auto px-4 py-4 pb-[calc(var(--bottom-nav-total-h)+1rem)] lg:px-6 xl:px-8">
      <CommonHeader title="Change Password" />
      <ChangePasswordForm />
    </div>
  );
}
