import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import markdownToHtml from "zenn-markdown-html";

import { ContentBody } from "@components/ContentBody";
import { ProfileHeader } from "@components/ProfileHeader"
import { MainContainer } from "@components/MainContainer";
import { getAllContentsNavCollections } from "@utils/nav-collections";
import { getProfile } from "@utils/api/profile";
import { Profile, NavCollections } from "@types";

type Props = {
  profile: Profile;
  allContentsNavCollections: NavCollections;
};

const Page: NextPage<Props> = (props) => {
  const { profile } = props;
  return (
    <>
      <Head>
        <title>Profileのプレビュー</title>
      </Head>
      <MainContainer navCollections={props.allContentsNavCollections}>
        <article>
          <div>
            <ProfileHeader profile={profile} />
            <ContentBody content={profile.content} />
          </div>
        </article>
      </MainContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  res,
}) => {
  const profile = getProfile();
  if (!profile) {
    if (res) {
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(`PROFILE.mdが見つかりませんでした`);
      return {
        props: {} as any,
      };
    }
  }
  const content = markdownToHtml(profile.content);
  const allContentsNavCollections = getAllContentsNavCollections();
  return {
    props: {
      profile: {
        ...profile,
        content
      },
      allContentsNavCollections
    },
  };
;}

export default Page