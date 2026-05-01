import { LoginForm } from "@/components/forms/LoginForm";
import { ADMIN_ROUTES, APP_NAME, ORGANIZER_ROUTES, USER_ROUTES } from "@/constants";
import { AuthLayout } from "@/layouts/AuthLayout";
import { useAuthStore } from "@/stores/authStore";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const redirect = router.query.redirect as string | undefined;

  const handleSuccess = () => {
    const user = useAuthStore.getState().user;

    if (redirect) {
      router.replace(redirect);
      return;
    }

    if (user?.role === "organizer") {
      router.replace(ORGANIZER_ROUTES.DASHBOARD);
      return;
    }

    if (user?.role === "admin") {
      router.replace(ADMIN_ROUTES.DASHBOARD);
      return;
    }

    router.replace(USER_ROUTES.DASHBOARD);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={`Log in to your ${APP_NAME} account`}
    >
      <Head>
        <title>Log in – {APP_NAME}</title>
      </Head>
      <LoginForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Optionally read cookie-based auth here for SSR redirect.
  // For now we rely on client-side auth store rehydration.
  return { props: {} };
};
