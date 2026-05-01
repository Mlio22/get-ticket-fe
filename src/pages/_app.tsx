import { Toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/stores/authStore";
import { initTheme, useThemeStore } from "@/stores/themeStore";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const theme = useThemeStore((s) => s.theme);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  // Sync theme with DOM on first render
  useEffect(() => {
    initTheme(theme);
  }, [theme]);

  // Re-validate stored JWT on app mount
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}
