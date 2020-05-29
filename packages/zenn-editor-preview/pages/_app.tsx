import "../styles/reset.css";
import "../styles/index.css";

import "zenn-css";

import React from "react";
import App from "next/app";
import Head from "next/head";

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <link rel="icon shortcut" href="/favicon.png" />
        </Head>
        <Component {...pageProps} />
      </>
    );
  }
}
