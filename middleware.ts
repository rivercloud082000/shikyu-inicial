import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/" },
  callbacks: {
    authorized({ token }) {
      return !!token?.email && token?.isAllowed === true;
    },
  },
});

export const config = {
  matcher: ["/app", "/app/:path*", "/admin", "/api/generar"],
};
