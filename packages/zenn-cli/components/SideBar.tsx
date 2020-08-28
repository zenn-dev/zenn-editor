import Link from "next/link";
import { useRouter } from "next/router";
import { NavCollections, NavCollection, NavItem } from "@types";

const SideBarNavItem: React.FC<{ navItem: NavItem }> = ({ navItem }) => {
  const router = useRouter();
  const className = `sidebar-nav-item ${
    router.asPath === navItem.as ? "active" : ""
  }`;
  return (
    <Link href={navItem.href} as={navItem.as} passHref>
      <a
        className={className}
        title={`${navItem.as}.md`}
        dangerouslySetInnerHTML={{ __html: navItem.name }}
      />
    </Link>
  );
};

const SideBarNavCollection: React.FC<{ navCollection: NavCollection }> = ({
  navCollection,
}) => {
  return (
    <details className="sidebar-collection" open>
      <summary className="sidebar-collection__title">
        {navCollection.name}
      </summary>
      <ul className="sidebar-collection__ul">
        {navCollection?.items.map((navItem, i) => (
          <SideBarNavItem navItem={navItem} key={`nav-item-${i}`} />
        ))}
      </ul>
    </details>
  );
};

const SidebarHeader: React.FC = () => (
  <header className="sidebar-header">
    <Link href="/" passHref>
      <a className="sidebar-logo-link">
        <img src="/logo.svg" alt="Zenn Editor" width={160} height={19} />
      </a>
    </Link>
    <a
      href="https://github.com/zenn-dev/zenn-editor"
      className="sidebar-github-link"
    >
      <img src="/github.svg" alt="GitHub" width={22} height={22} />
    </a>
  </header>
);

export const SideBar: React.FC<{
  navCollections: NavCollections;
}> = ({ navCollections }) => {
  return (
    <aside className="sidebar">
      <SidebarHeader />
      <div className="sidebar-collections">
        {navCollections.map((navCollection) => (
          <SideBarNavCollection
            navCollection={navCollection}
            key={navCollection.name}
          />
        ))}
      </div>
      <a
        href="https://zenn.dev/dashboard/uploader"
        className="sidebar-external-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://twemoji.maxcdn.com/2/svg/\1f4f7.svg"
          width="16"
          height="16"
        />
        画像のアップロード
      </a>
      <a
        href="https://zenn.dev/zenn/articles/markdown-guide"
        className="sidebar-external-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://twemoji.maxcdn.com/2/svg/\1f58b.svg"
          width="16"
          height="16"
        />
        マークダウン・ガイド
      </a>
    </aside>
  );
};
