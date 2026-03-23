import { api } from "@/api";
import { queryKey } from "@/api/keys";
import { useGetMe } from "@/modules/auth/hooks/use-get-me";
import type { TransactionModel } from "@z3-wallet/types";
import { useInfiniteQuery } from "@tanstack/react-query";

// export function useInfiniteTransactions() {
//   const me = useGetMe();
//   return useInfiniteQuery({
//     queryKey: queryKey.transaction.paginate(me.data?.public_id),
//     queryFn: ({ pageParam }) => {
//       const result = await api.transaction.cPaginate({
//         page_size: 10,
//         cursor: pageParam,
//         query: "",
//       });
//       result.meta.next_cursor

//     },
//     getNextPageParam: (lastPage, pages) => lastPage.,
//   });
// }

export function useInfiniteTransactions(
  options: TransactionModel.TransactionFilterDto,
) {
  const { page_size, query, time_frame } = options;
  const me = useGetMe();

  return useInfiniteQuery({
    queryKey: queryKey.transaction.paginate(me.data?.public_id, {
      page_size,
      query,
      time_frame,
    }),
    initialPageParam: null as string | null,
    enabled: !!me.data?.public_id,
    queryFn: async ({ pageParam }) => {
      //   await new Promise((resolve) => setTimeout(resolve, 2000));
      return api.transaction.cPaginate({
        page_size,
        cursor: pageParam,
        query,
        time_frame,
      });
    },
    getNextPageParam: (lastPage) => lastPage.meta.next_cursor ?? undefined,
  });
}
