import { RegisterForm } from "@/components/forms/RegisterForm";
import { APP_NAME, ORGANIZER_ROUTES, USER_ROUTES } from "@/constants";
import { AuthLayout } from "@/layouts/AuthLayout";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

export default function RegisterPage() {
  const router = useRouter();
  const role = (router.query.role as "user" | "organizer") || "user";

  const handleSuccess = () => {
    router.push(role === "organizer" ? ORGANIZER_ROUTES.DASHBOARD : USER_ROUTES.DASHBOARD);
  };

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
