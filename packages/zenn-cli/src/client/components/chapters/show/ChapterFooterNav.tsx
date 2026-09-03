import React from 'react';
import styled from 'styled-components';
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from 'react-icons/md';
import { ChapterMeta } from 'zenn-model';
import { LinkChapter } from '../../Routes';

type Props = {
  bookSlug: string;
  prev?: ChapterMeta;
  next?: ChapterMeta;
};

export const ChapterFooterNav: React.FC<Props> = ({ bookSlug, prev, next }) => {
  if (!prev && !next) return null;

  return (
    <StyledChapterFooterNav className="chapter-footer-nav">
      <div className="chapter-footer-nav__side">
        {prev && (
          <LinkChapter
            bookSlug={bookSlug}
            chapterFilename={prev.filename}
            className="chapter-footer-nav__link"
          >
            <span className="chapter-footer-nav__label">
              <MdOutlineArrowBackIos aria-hidden="true" />
              前のチャプター
            </span>
            <span className="chapter-footer-nav__title">
              {prev.title || prev.slug}
            </span>
          </LinkChapter>
        )}
      </div>
      <div className="chapter-footer-nav__side chapter-footer-nav__side--next">
        {next && (
          <LinkChapter
            bookSlug={bookSlug}
            chapterFilename={next.filename}
            className="chapter-footer-nav__link"
          >
            <span className="chapter-footer-nav__label">
              次のチャプター
              <MdOutlineArrowForwardIos aria-hidden="true" />
            </span>
            <span className="chapter-footer-nav__title">
              {next.title || next.slug}
            </span>
          </LinkChapter>
        )}
      </div>
    </StyledChapterFooterNav>
  );
};

const CHAPTER_FOOTER_NAV_LINK_WIDTH = '300px';

const StyledChapterFooterNav = styled.nav`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 3rem 0 0;
  border-top: solid 1px var(--c-gray-border, rgba(158, 186, 203, 0.4));
  padding-top: 1.6rem;

  .chapter-footer-nav__link {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    width: ${CHAPTER_FOOTER_NAV_LINK_WIDTH};
    max-width: 100%;
    padding: 0.8rem 1rem;
    border: solid 1px var(--c-gray-border, rgba(158, 186, 203, 0.4));
    border-radius: 8px;
    color: var(--c-body);
    &:hover {
      background: var(--c-gray-bg);
    }
  }
  .chapter-footer-nav__label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--c-gray);
  }
  .chapter-footer-nav__side--next .chapter-footer-nav__label {
    justify-content: flex-end;
  }
  .chapter-footer-nav__side--next .chapter-footer-nav__title {
    text-align: right;
  }
  .chapter-footer-nav__title {
    font-size: 14.5px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media screen and (max-width: 768px) {
    flex-direction: column;
    gap: 0.7rem;

    .chapter-footer-nav__link {
      width: 100%;
    }
    .chapter-footer-nav__side--next .chapter-footer-nav__label {
      justify-content: flex-start;
    }
    .chapter-footer-nav__side--next .chapter-footer-nav__title {
      text-align: left;
    }
  }
`;
