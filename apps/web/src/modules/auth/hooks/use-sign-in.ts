import { api } from "@/api";
import { queryKey } from "@/api/keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";

export const useSignIn = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    location: { searchStr },
  } = useRouterState();

  const redirectToRaw = new URLSearchParams(searchStr).get("redirect");
  const redirectTo = redirectToRaw?.startsWith("/") ? redirectToRaw : null;
  return useMutation({
    mutationFn: api.auth.signIn,
    onSuccess: async ({ user }) => {
      await queryClient.invalidateQueries({ queryKey: queryKey.auth.me });
      toast.success("Login successful", {
        description: `Welcome back, ${user.username}`,
      });
      navigate({
        to: redirectTo || "/dashboard",
      });
    },
  });
};
