import Head from "next/head";
import MainContainer from "@components/MainContainer";
import { NavCollections } from "@types";
import { getAllContentsNavCollection } from "@utils/navCollections";

type IndexPageProps = {
  allContentsNavCollection: NavCollections;
};

const IndexPage = ({ allContentsNavCollection }: IndexPageProps) => {
  return (
    <div>
      <Head>
        <title>Welcome!</title>
      </Head>

      <MainContainer navCollections={allContentsNavCollection}>
        Welcome!
      </MainContainer>
    </div>
  );
};

export const getServerSideProps = () => {
  const allContentsNavCollection = getAllContentsNavCollection();
  return {
    props: { allContentsNavCollection },
  };
};

export default IndexPage;
