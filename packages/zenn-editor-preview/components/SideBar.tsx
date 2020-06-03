import Link from "next/link";
import { useRouter } from "next/router";
import { NavCollections, NavCollection, NavItem } from "@types";

const SideBarNavItem: React.FC<{ navItem: NavItem }> = ({ navItem }) => {
  const router = useRouter();
  const className = `sidebar-nav-item ${
    router.asPath === navItem.realPath ? "active" : ""
  }`;
  return (
    <Link
      href={navItem.dynamicRoutePath || navItem.realPath}
      as={navItem.realPath}
    >
      <a
        href={navItem.realPath}
        className={className}
        title={`${navItem.realPath}.md`}
      >
        {navItem.name}
      </a>
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
        {navCollection?.items.map((navItem) => (
          <SideBarNavItem navItem={navItem} key={navItem.realPath} />
        ))}
      </ul>
    </details>
  );
};

const LogoLink: React.FC = () => (
  <Link href="/">
    <a href="/" className="sidebar-logo-link">
      <img src="/logo.svg" alt="Zenn Editor" width={187} height={22} />
    </a>
  </Link>
);

const SideBar: React.FC<{
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
        href="https://zenn.dev/dashboard/contents/uploader"
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

export default SideBar;
