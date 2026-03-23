/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from "@z3-wallet/api-client";

// import { useAppConfig } from "@vben/hooks";
// import { preferences } from "@vben/preferences";
import {
  //   authenticateResponseInterceptor,
  defaultResponseInterceptor,
  RequestClient,
} from "@z3-wallet/api-client";
import { errorMessageResponseInterceptor } from "@z3-wallet/api-client";
import type { ApiFail } from "@z3-wallet/types";
import { toast } from "sonner";

let isRedirectingToLogin = false;

function isAuthPage(pathname: string) {
  return (
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")
  );
}

function redirectToLogin() {
  if (isRedirectingToLogin) return;
  if (typeof window === "undefined") return;

  const currentPath = `${window.location.pathname}${window.location.search}`;

  // Avoid redirect loops on auth pages
  if (isAuthPage(window.location.pathname)) {
    return;
  }

  isRedirectingToLogin = true;
  const redirect = encodeURIComponent(currentPath);
  window.location.assign(`/auth/login?redirect=${redirect}`);
}

// const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  // /**
  //  * 重新认证逻辑
  //  */
  //   async function doReAuthenticate() {
  // console.warn("Access token or refresh token is invalid or expired. ");
  // const accessStore = useAccessStore();
  // const authStore = useAuthStore();
  // accessStore.setAccessToken(null);
  // if (
  //   preferences.app.loginExpiredMode === "modal" &&
  //   accessStore.isAccessChecked
  // ) {
  //   accessStore.setLoginExpired(true);
  // } else {
  //   await authStore.logout();
  // }
  //   }

  /**
   * 刷新token逻辑
   */
  // async function doRefreshToken() {
  //   const accessStore = useAccessStore();
  //   const resp = await refreshTokenApi();
  //   const newToken = resp.data;
  //   accessStore.setAccessToken(newToken);
  //   return newToken;
  // }

  //   function formatToken(token: null | string) {
  //     return token ? `Bearer ${token}` : null;
  //   }

  // 请求头处理
  // client.addRequestInterceptor({
  //   fulfilled: async () => {
  //       const accessStore = useAccessStore();
  //       config.headers.Authorization = formatToken(accessStore.accessToken);
  //       return config;
  //   },
  // });

  // 处理返回的响应数据格式
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: "code",
      dataField: "data",
      successCode: 0,
    }),
  );

  // If backend says unauthorized, force navigation to login.
  client.addResponseInterceptor({
    rejected: async (error) => {
      const status = error?.response?.status;
      const responseData: ApiFail = error?.response?.data ?? {};
      const url: string | undefined = error?.config?.url;
      // Let route-level guards decide how to handle the auth bootstrap check.
      if (
        responseData.error.code === "UNAUTHORIZED" &&
        url?.includes("/auth/me")
      ) {
        throw error;
      }
      if (status === "UNAUTHORIZED") {
        redirectToLogin();
      }
      throw error;
    },
  });

  //   // token过期的处理
  //   client.addResponseInterceptor(
  //     authenticateResponseInterceptor({
  //       client,
  //       doReAuthenticate,
  //       enableRefreshToken: preferences.app.enableRefreshToken,
  //       formatToken,
  //     }),
  //   );

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      const responseData: ApiFail = error?.response?.data ?? {};
      const url: string | undefined = error?.config?.url;

      // /auth/me is used as a bootstrap/auth-check endpoint by route guards.
      // A 401 here is expected when logged out; don't show a toast.
      console.log("error:", error);
      console.log("error.response:", error.response);
      if (
        responseData.error.code === "UNAUTHORIZED" &&
        url?.includes("/auth/me")
      ) {
        return;
      }
      if (
        responseData.error.code === "UNAUTHORIZED" &&
        typeof window !== "undefined" &&
        !isAuthPage(window.location.pathname)
      ) {
        return;
      }
      toast.error(responseData.error.message || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(import.meta.env.VITE_API_URL, {
  responseReturn: "raw",
  withCredentials: true,
});

export const baseRequestClient = new RequestClient({
  baseURL: import.meta.env.VITE_API_URL,
});
