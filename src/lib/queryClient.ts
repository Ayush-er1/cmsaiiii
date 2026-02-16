import { QueryClient, QueryFunction, QueryFunctionContext } from "@tanstack/react-query";
import api from "./api";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<any> {
  const res = await api({
    method,
    url,
    data,
  });
  return res.data;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }: QueryFunctionContext) => {
      try {
        const res = await api.get(queryKey.join("/"));
        return res.data;
      } catch (error: any) {
        if (unauthorizedBehavior === "returnNull" && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
