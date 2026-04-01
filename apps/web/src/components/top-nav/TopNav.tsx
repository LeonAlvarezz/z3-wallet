import BackButton from "../back-button/BackButton";
type TopNavProps = {
  title: string;
  back?: boolean | { backTo?: string; label?: string };
};
export default function TopNav({ title, back }: TopNavProps) {
  const backProps =
    back && typeof back === "object"
      ? { backTo: back.backTo, label: back.label }
      : undefined;

  return (
    <header className="sticky grid w-full grid-cols-3 p-2">
      <div className="flex items-center">
        {back && <BackButton {...backProps} />}
      </div>
      <h1 className="place-self-center text-lg font-semibold">{title}</h1>
    </header>
  );
}
