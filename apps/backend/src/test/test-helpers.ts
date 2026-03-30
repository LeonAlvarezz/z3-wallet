import app from "@/app";

export const authHelpers = {
  async signIn(email: string, password: string) {
    const response = await app.handle(
      new Request("http://localhost/v1/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }),
    );
    return response;
  },

  async signOut(sessionCookie: string) {
    return await app.handle(
      new Request("http://localhost/v1/auth/sign-out", {
        method: "POST",
        headers: {
          Cookie: sessionCookie,
          "Content-Type": "application/json",
        },
      }),
    );
  },

  extractCookie(response: Response) {
    const cookieHeader = response.headers.get("set-cookie");
    return cookieHeader ? cookieHeader.split(";")[0] : "";
  },

  getMe(sessionCookie: string) {
    return app.handle(
      new Request("http://localhost/v1/auth/me", {
        headers: { Cookie: sessionCookie },
      }),
    );
  },
};

export const userHelpers = {
  async getUsers(sessionCookie: string) {
    return await app.handle(
      new Request("http://localhost/v1/users/", {
        headers: { Cookie: sessionCookie },
      }),
    );
  },
};
