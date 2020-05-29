import React from "react";
import App from "next/app";
import Head from "next/head";

import "zenn-css";

import "@styles/reset.css";
import "@styles/index.css";

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <link rel="icon shortcut" href="/favicon.png" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Noto+Sans+JP:400,700&display=swap"
          />
        </Head>
        <Component {...pageProps} />
      </>
    );
  }
}
