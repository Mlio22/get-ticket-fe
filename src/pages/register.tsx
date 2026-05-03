import { RegisterForm } from "@/components/forms/RegisterForm";
import { ADMIN_ROUTES, APP_NAME, ORGANIZER_ROUTES, USER_ROUTES } from "@/constants";
import { AuthLayout } from "@/layouts/AuthLayout";
import { useAuthStore } from "@/stores/authStore";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const role = (router.query.role as "user" | "organizer") || "user";

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;

    if (user?.role === "organizer") {
      router.replace(ORGANIZER_ROUTES.DASHBOARD);
      return;
    }

    if (user?.role === "admin") {
      router.replace(ADMIN_ROUTES.DASHBOARD);
      return;
    }

    router.replace(USER_ROUTES.DASHBOARD);
  }, [hasHydrated, isAuthenticated, user, router]);

  const handleSuccess = () => {
    router.push(role === "organizer" ? ORGANIZER_ROUTES.DASHBOARD : USER_ROUTES.DASHBOARD);
  };

  if (!hasHydrated) return null;
  if (isAuthenticated) return null;

  return (
    <AuthLayout
      title="Create your account"
      subtitle={`Join ${APP_NAME} and never miss an event`}
    >
      <Head>
        <title>Sign up – {APP_NAME}</title>
      </Head>
      <RegisterForm defaultRole={role} onSuccess={handleSuccess} />
    </AuthLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
