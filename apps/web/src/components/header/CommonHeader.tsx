import BackButton from "@/components/back-button/BackButton";

export function CommonHeader({
  title,
  backLabel = true,
  backTo,
}: {
  title: string;
  backLabel?: boolean | string;
  backTo?: string;
}) {
  const shouldRenderBack = backLabel !== false && backLabel !== undefined;
  const backButtonLabel = typeof backLabel === "string" ? backLabel : undefined;

  return (
    <div className="mb-6 flex items-center gap-4">
      {shouldRenderBack && (
        <BackButton backTo={backTo} label={backButtonLabel} />
      )}
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}
