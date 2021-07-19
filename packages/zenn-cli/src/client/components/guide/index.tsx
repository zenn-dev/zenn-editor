import React, { useEffect } from 'react';
import styled from 'styled-components';
import { BodyContent } from '../BodyContent';
import { ContentContainer } from '../ContentContainer';
import { Loading } from '../Loading';
import { useFetch } from '../../hooks/useFetch';
import { useTitle } from '../../hooks/useTitle';

type GuideProps = {
  hash?: string;
  slug: string;
};

export const Guide: React.VFC<GuideProps> = ({ hash, slug }) => {
  const { data, error } = useFetch<{ html: string; title?: string }>(
    `/api/cli-guide/${slug}`,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
    }
  );
  const html = data?.html;
  const title = data?.title;

  useTitle(title || 'CLIリファレンス');

  useEffect(() => {
    if (!hash || !html) return;
    const target = document.getElementById(hash);
    if (!target) {
      console.error(`Couldn't find elements with id="${hash}"`);
      return;
    }
    target.scrollIntoView();
    window.scrollBy(0, -30); // adjust scroll position
  }, [html, hash]);

  if (error) return <div>{error.message}</div>;

  if (!html) return <Loading margin="5rem auto" />;

  return (
    <>
      <ContentContainer>
        <StyledGuide className="guide">
          <h1 className="guide__title">{title || 'Zenn CLI Reference'}</h1>
          <div className="guide__content">
            <BodyContent rawHtml={html} />
          </div>
        </StyledGuide>
      </ContentContainer>
    </>
  );
};

const StyledGuide = styled.div`
  padding: 3rem 0;
  font-size: 0.94rem;
  .guide__title {
    font-size: 2rem;
  }
  .guide__content {
    padding: 1.5rem 0;
  }
`;
