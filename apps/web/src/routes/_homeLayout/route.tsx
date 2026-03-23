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
    <>
      {/* <h1>Pathless layout</h1> */}
      <main className="h-[calc(100vh-var(--bottom-nav-total-h))]">
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}
