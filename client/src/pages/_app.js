import { useEffect } from 'react';
import Head from 'next/head';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import AppShell from '../components/AppShell/AppShell';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  const initAuth = useAuthStore((state) => state.initAuth);
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
    initAuth();
  }, [initAuth, initTheme]);

  // Allow pages to define custom layout or use default AppShell
  const getLayout = Component.getLayout || ((page) => <AppShell>{page}</AppShell>);

  return (
    <>
      <Head>
        <title>CampusResolve | College Complaint Management</title>
        <meta name="description" content="CampusResolve – Full-stack platform for campus grievance reporting, AI-powered triage, and real-time resolution tracking." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {getLayout(<Component {...pageProps} />)}
    </>
  );
}
