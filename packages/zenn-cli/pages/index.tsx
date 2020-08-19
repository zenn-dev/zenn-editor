import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { MainContainer } from "@components/MainContainer";
import { NavCollections } from "@types";
import { getAllContentsNavCollections } from "@utils/nav-collections";

type Props = {
  allContentsNavCollections: NavCollections;
};

const Page: NextPage<Props> = ({ allContentsNavCollections }) => {
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

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const allContentsNavCollections = getAllContentsNavCollections();
  return {
    props: { allContentsNavCollections },
  };
};

export default Page;
