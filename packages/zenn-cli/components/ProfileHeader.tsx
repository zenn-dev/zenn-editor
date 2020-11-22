import { Profile } from "@types";
import { ContentWrapper } from "@components/ContentWrapper";

type Props = { profile: Profile };

export const ProfileHeader: React.FC<Props> = ({ profile }) => {
  return (
    <header className="content-header">
      <ContentWrapper>
        <h1 className="content-header__title">{profile.name || "匿名"}</h1>

        <div className="content-header__row">
          <span className="content-header__row-title">favSkills</span>
          <span className="content-header__row-result">
            {Array.isArray(profile.favoriteSkills) && profile.favoriteSkills.length
              ? profile.favoriteSkills.map((t, i) => (
                  <span className="content-header__topic" key={`at${i}`}>
                    {t}
                  </span>
                ))
              : "指定が必要です"}
          </span>
        </div>

        {profile.published !== undefined && (
          <div className="content-header__row">
            <span className="content-header__row-title">published</span>
            <span className="content-header__row-result">
              {profile.published ? "✅（公開）" : "false（下書き）"}
            </span>
          </div>
        )}
      </ContentWrapper>
    </header>
  );
};
