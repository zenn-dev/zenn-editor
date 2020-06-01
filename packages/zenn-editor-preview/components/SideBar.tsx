import Link from "next/link";
import { NavCollections, NavCollection, NavItem } from "@types";

const SideBarNavItem: React.FC<{ navItem: NavItem }> = ({ navItem }) => {
  return (
    <Link
      href={navItem.dynamicRoutePath || navItem.realPath}
      as={navItem.realPath}
    >
      <a href={navItem.realPath} className="sidebar-nav-item">
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

const SideBar: React.FC<{
  navCollections: NavCollections;
}> = ({ navCollections }) => {
  return (
    <aside className="sidebar">
      {navCollections.map((navCollection) => (
        <SideBarNavCollection
          navCollection={navCollection}
          key={navCollection.name}
        />
      ))}
    </aside>
  );
};

export default SideBar;
