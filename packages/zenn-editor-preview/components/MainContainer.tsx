import SideBar from "@components/SideBar";
import { NavCollections } from "@types";

const MainContainer: React.FC<{
  children: React.ReactNode;
  navCollections: NavCollections;
}> = ({ children, navCollections }) => {
  return (
    <div className="main-container">
      <div className="main-sidebar">
        <SideBar navCollections={navCollections} />
      </div>
      <main className="main-content">{children}</main>
    </div>
  );
};
export default MainContainer;
