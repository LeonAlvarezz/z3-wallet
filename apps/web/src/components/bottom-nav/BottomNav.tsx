import BottomNavItem, { type BottomNavItemData } from "./BottomNavItem";

export default function BottomNav() {
  const bottomNavItems: BottomNavItemData[] = [
    {
      title: "Dashboard",
      to: "/dashboard",
      icon: "solar:home-2-line-duotone",
    },
    {
      title: "Transaction",
      to: "/transaction",
      icon: "solar:bill-list-line-duotone",
    },
    {
      title: "Add",
      to: "/transaction/add",
      icon: "solar:add-circle-line-duotone",
    },
    {
      title: "Profile",
      to: "/profile",
      icon: "solar:user-circle-line-duotone",
    },
  ];
  return (
    <div
      id="bottom-nav"
      style={{
        height: "var(--bottom-nav-total-h)",
        paddingBottom: "var(--safe-area-bottom)",
      }}
      className="bg-secondary max-w-mobile fixed inset-x-0 bottom-0 m-auto flex items-center justify-between sm:px-4"
    >
      {bottomNavItems.map((item) => (
        <BottomNavItem key={item.to} {...item} />
      ))}
    </div>
  );
}
