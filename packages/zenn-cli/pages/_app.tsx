import React from "react";
import { AppProps } from "next/app";
import Head from "next/head";

import "zenn-content-css";
import "@styles/index.scss";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon shortcut" href="/favicon.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
