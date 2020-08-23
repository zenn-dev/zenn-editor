import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { MainContainer } from "@components/MainContainer";
import { ContentWrapper } from "@components/ContentWrapper";
import { NavCollections } from "@types";
import { getAllContentsNavCollections } from "@utils/nav-collections";

type Props = {
  allContentsNavCollections: NavCollections;
};

const Page: NextPage<Props> = (props) => {
  return (
    <>
      <Head>
        <title>Zenn Editor</title>
      </Head>
      <div>
        <MainContainer navCollections={props.allContentsNavCollections}>
          <article className="home">
            <ContentWrapper>
              <h1 className="home__title">
                <img
                  src="/logo.svg"
                  alt="Zenn Editor"
                  width={300}
                  height={35}
                />
              </h1>
              <div className="home__container">
                <p>
                  ローカルのテキストエディターでZennのコンテンツを編集しましょう。
                </p>
                <h2>
                  <img
                    src="https://twemoji.maxcdn.com/2/svg/\1f4dd.svg"
                    width="23"
                    height="23"
                  />
                  記事の作成
                </h2>
                <pre>
                  <code>$ npx zenn new:article</code>
                </pre>
                <p>
                  記事のURLの一部となるslugを指定して作成することもできます。
                </p>
                <pre>
                  <code>$ npx zenn new:article --slug my-awesome-article</code>
                </pre>
                <h2>
                  <img
                    src="https://twemoji.maxcdn.com/2/svg/\1f4d8.svg"
                    width="23"
                    height="23"
                  />
                  本の作成
                </h2>
                <pre>
                  <code>$ npx zenn new:book</code>
                </pre>
                <p>本のURLの一部となるslugを指定して作成することもできます。</p>
                <pre>
                  <code>$ npx zenn new:book --slug my-awesome-book</code>
                </pre>
                <h2>
                  <img
                    src="https://twemoji.maxcdn.com/2/svg/\1f4a1.svg"
                    width="23"
                    height="23"
                  />
                  Learn More
                </h2>
                <p>
                  詳しくは、
                  <a
                    href="https://zenn.dev/zenn/how-to-use-zenn-cli"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Zenn CLIの使い方
                  </a>
                  をご覧ください。
                </p>
              </div>
            </ContentWrapper>
          </article>
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
