import HeaderManager from "../../components/manager/headerManager";
import Sidebar from "../../components/manager/sidebarManager";
import { Layout } from "antd";

const { Sider, Content } = Layout;

function ManagerLayoutSidebar({ children, sidebarItems, onSidebarClick }) {
  return (
    <div className="container">
      <HeaderManager />
      <Layout>
        <Sider width={200}>
          <Sidebar items={sidebarItems} onItemClick={onSidebarClick} />
        </Sider>
        <Layout>
          <Content style={{ padding: "16px" }}>{children}</Content>
        </Layout>
      </Layout>
    </div>
  );
}

export default ManagerLayoutSidebar;
