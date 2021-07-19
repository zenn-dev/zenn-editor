import React from 'react';
import styled, { keyframes } from 'styled-components';
import { BodyContent } from '../BodyContent';
import { ContentContainer } from '../ContentContainer';
import { LinkGuide } from '../Routes';
import { useFetch } from '../../hooks/useFetch';
import { useTitle } from '../../hooks/useTitle';

const UpdateNotificationBar: React.VFC = () => {
  const { data } = useFetch<{
    latest: 'string';
    current: 'string';
    updateAvailable: boolean;
  }>('/api/cli-version', {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  if (!data) return null;
  if (data.updateAvailable === false) return null;

  return (
    <StyledUpdateNotificationBar className="update-notification-bar">
      <ContentContainer>
        <div className="update-notification-bar__inner">
          <div className="update-notification-bar__icon">!</div>
          <div className="update-notification-bar__text">
            新しいバージョンがリリースされています。
            <code>npm install zenn-cli@latest</code>で更新してください
          </div>
        </div>
      </ContentContainer>
    </StyledUpdateNotificationBar>
  );
};

const popin = keyframes`
  from {
   opacity: 0;
   transform: translateY(-40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledUpdateNotificationBar = styled.div`
  .update-notification-bar__inner {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 1.3rem;
    padding: 0.9rem;
    background: var(--c-primary-bg);
    color: #364757;
    border-radius: 10px;
    animation: ${popin} 0.3s ease;
  }

  .update-notification-bar__icon {
    margin-right: 8px;
    content: '!';
    font-weight: 700;
    width: 20px;
    line-height: 20px;
    height: 20px;
    text-align: center;
    border-radius: 50%;
    background: var(--c-primary);
    color: #fff;
    font-size: 12px;
  }
  .update-notification-bar__text {
    flex: 1;
    font-size: 14px;
    code {
      display: inline-flex;
      margin: 0 0.2em;
      padding: 0.1em 0.6em;
      font-size: 0.9em;
      background: #cfe6f9;
      border-radius: 5px;
    }
  }
`;

export const Home: React.VFC = () => {
  const { data } = useFetch<{ hasInit: boolean }>('/api/local-info');
  const hasInit = data?.hasInit;

  useTitle('Zenn Editor');

  return (
    <>
      <UpdateNotificationBar />
      <ContentContainer>
        <StyledHome className="home">
          <h1 className="home__title">
            <img src="/logo.svg" alt="Zenn Editor" width={300} height={35} />
          </h1>
          <div className="home__content">
            <BodyContent>
              {hasInit === true || hasInit === undefined ? (
                <>
                  <h3>📝 記事の作成</h3>
                  <pre>
                    <code>
                      $ npx zenn{' '}
                      <span className="token function">new:article</span>
                      <div className="token comment">
                        #
                        記事のURLの一部となるslugを指定して作成することもできます。
                        <br />$ npx zenn new:article --slug my-awesome-article
                      </div>
                    </code>
                  </pre>
                  <h3>📘 本の作成</h3>
                  <pre>
                    <code>
                      $ npx zenn{' '}
                      <span className="token function">new:book</span>
                      <div className="token comment">
                        #
                        本のURLの一部となるslugを指定して作成することもできます。
                        <br />$ npx zenn new:book --slug my-awesome-book
                      </div>
                    </code>
                  </pre>
                </>
              ) : (
                <>
                  <h3>🔧 セットアップが必要です</h3>
                  <p>
                    まだ<code>articles</code>
                    ディレクトリが作成されていません。以下のコマンドを実行してセットアップを行ってください。
                  </p>
                  <pre>
                    <code>
                      $ npx zenn <span className="token function">init</span>
                    </code>
                  </pre>
                </>
              )}
            </BodyContent>
            <div className="home__learn-more">
              <div className="home__learn-more-title">
                詳しい使い方はCLIリファレンスをご覧ください
              </div>
              <LinkGuide slug="zenn-cli-guide" className="home__link-cli-guide">
                CLIリファレンスを開く
              </LinkGuide>
            </div>
          </div>
        </StyledHome>
      </ContentContainer>
    </>
  );
};

const StyledHome = styled.article`
  .home__title {
    padding: 2.5rem 0;
    text-align: center;
    border-bottom: solid 1px var(--c-gray-border);
  }
  .home__content {
    padding: 2.5rem 0;
  }
  .home__learn-more {
    margin-top: 3rem;
    padding: 1.8rem 2rem 2.5rem;
    background: var(--c-gray-bg);
    border-radius: 10px;
    text-align: center;
  }
  .home__learn-more-title {
    color: var(--c-gray);
  }
  .home__link-cli-guide {
    margin-top: 1rem;
    display: inline-flex;
    padding: 0.6em 1.5em;
    background: var(--c-primary);
    color: #fff;
    border-radius: 0.45em;
    border: solid 1px rgba(92, 147, 187, 0.15);
    font-size: 0.95rem;
    font-weight: 600;
  }
`;
