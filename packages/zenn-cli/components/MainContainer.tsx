import { SideBar } from "@components/SideBar";
import { NavCollections } from "@types";

type Props = {
  navCollections: NavCollections;
};

export const MainContainer: React.FC<Props> = ({
  children,
  navCollections,
}) => {
  return (
    <div className="main-container">
      <div className="main-sidebar">
        <SideBar navCollections={navCollections} />
      </div>
      <main className="main-content">{children}</main>
    </div>
  );
};
