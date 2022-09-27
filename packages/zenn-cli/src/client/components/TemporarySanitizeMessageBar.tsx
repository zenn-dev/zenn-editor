import React from 'react';
import { MdError, MdOutlineCallMade } from 'react-icons/md';
import styled from 'styled-components';

export const TemporarySanitizeMessageBar: React.VFC = () => {
  return (
    <StyledTemporarySanitizeMessageBar className="message-bar">
      <div className="message-bar__inner">
        <div className="message-bar__title">
          プレビューで不具合を見つけた場合
        </div>
        <div className="message-bar__content">
          <MdError className="message-bar__icon" />
          <div className="message-bar__text">
            セキュリティ向上のため、マークダウン変換処理をアップデートしました。お気づきの点があれば
            <a
              className="message-bar__link"
              href="https://github.com/zenn-dev/zenn-community"
              target="_blank"
              rel="nofollow noreferrer"
            >
              zenn-community
              <MdOutlineCallMade className="validation-error-row__link-icon" />
            </a>
            でフィードバックをお願いします。
          </div>
        </div>
      </div>
    </StyledTemporarySanitizeMessageBar>
  );
};

const StyledTemporarySanitizeMessageBar = styled.div`
  padding: 1.2rem 1.4rem 1.3rem;
  background: #fff;
  border-radius: 10px;
  .message-bar__content {
    display: flex;
    align-items: flex-start;
    margin-top: 0.5rem;
  }
  .message-bar__title {
    font-size: 0.95rem;
  }
  .message-bar__icon {
    color: #fff;
    font-size: 12px;
    width: 26px;
    height: 26px;
    color: var(--c-primary);
    flex-shrink: 0;
    transform: translateY(-0.1em);
  }
  .message-bar__text {
    flex: 1;
    color: var(--c-gray);
    font-size: 14px;
    margin-left: 7px;
  }
  .message-bar__link {
    margin-left: 6px;
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-color: var(--c-gray-border);
    display: inline-flex;
    align-items: center;
    &:hover {
      color: var(--c-body);
    }
  }
`;
