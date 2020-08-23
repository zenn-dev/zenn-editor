import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { MainContainer } from "@components/MainContainer";
import { ContentWrapper } from "@components/ContentWrapper";
import { NavCollections } from "@types";
import { getAllContentsNavCollections } from "@utils/nav-collections";

type Props = {
  allContentsNavCollections: NavCollections;
};

const Page: NextPage<Props> = ({ allContentsNavCollections }) => {
  return (
    <>
      <Head>
        <title>Welcome to Zenn Editor!</title>
      </Head>
      <div>
        <MainContainer navCollections={allContentsNavCollections}>
          <ContentWrapper>
            <article className="home">
              <div className="home__content">
                <h1 className="home__title">
                  <img
                    src="/logo.svg"
                    alt="Zenn Editor"
                    width={480}
                    height={56}
                  />
                </h1>
                <p className="home__description">
                  ローカルのテキストエディターでZennのコンテンツを編集しましょう
                </p>
                <a
                  href="https://zenn.dev/zenn/how-to-use-zenn-cli"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="home__link"
                >
                  使い方を知る
                </a>
              </div>
            </article>
          </ContentWrapper>
        </MainContainer>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const allContentsNavCollections = getAllContentsNavCollections();
  return {
    props: { allContentsNavCollections },
  };
};

export default Page;
