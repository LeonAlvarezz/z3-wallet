import BottomNav from "@/components/bottom-nav/BottomNav";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { guard } from "@/middleware/guard";

export const Route = createFileRoute("/_homeLayout")({
  beforeLoad: guard,
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-background relative mx-auto flex min-h-lvh w-full max-w-xl flex-col">
      <main className="h-[calc(100vh-var(--bottom-nav-total-h))] w-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
