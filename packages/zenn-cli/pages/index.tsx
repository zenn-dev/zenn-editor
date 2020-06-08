import Head from "next/head";
import MainContainer from "@components/MainContainer";
import { NavCollections } from "@types";
import { getAllContentsNavCollections } from "@utils/nav-collections";

type IndexPageProps = {
  allContentsNavCollections: NavCollections;
};

const IndexPage = ({ allContentsNavCollections }: IndexPageProps) => {
  return (
    <div>
      <Head>
        <title>Welcome!</title>
      </Head>

      <MainContainer navCollections={allContentsNavCollections}>
        Welcome!
      </MainContainer>
    </div>
  );
};

export const getServerSideProps = () => {
  const allContentsNavCollections = getAllContentsNavCollections();
  return {
    props: { allContentsNavCollections },
  };
};

export default IndexPage;
