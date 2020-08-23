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

const LogoLink: React.FC = () => (
  <Link href="/" passHref>
    <a className="sidebar-logo-link">
      <img src="/logo.svg" alt="Zenn Editor" width={160} height={19} />
    </a>
  </Link>
);

export const SideBar: React.FC<{
  navCollections: NavCollections;
}> = ({ navCollections }) => {
  return (
    <aside className="sidebar">
      <LogoLink />
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
    </aside>
  );
};
