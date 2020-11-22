import React, { useEffect } from "react";
import { AppProps } from "next/app";
import Head from "next/head";

import "zenn-content-css";
import "@styles/index.scss";

declare global {
  interface Window {
    io: any;
  }
}

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const { body } = document;
    const script = document.createElement("script");
    script.src = "/socket.io/socket.io.js";

    script.onerror = () => {
      console.log("Hot reload disabled.");
      return true;
    };

    script.onload = () => {
      const socket = (window.io as any).connect(location.origin, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 99999,
      });
      socket.on("reload", () => {
        location.reload();
      });
    };
    body.append(script);
  }, []);

  return (
    <>
      <Head>
        <link rel="icon shortcut" href="/favicon.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
