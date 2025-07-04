import HeaderManager from "../../components/manager/headerManager";
import Sidebar from "../../components/manager/sidebarManager";
import { Layout } from "antd";

const { Sider, Content } = Layout;

function ManagerLayoutSidebar({ children, sidebarItems, onSidebarClick, title }) {
  return (
    <div className="container">
      <HeaderManager />
      <Layout>
        <Sider width={200} style={{ backgroundColor: "#fff", padding: "16px 0" }}>
          {title && (
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                padding: "2px 29px 18px",
                borderBottom: "1px solid #eee",
              }}
            >
              {title}
            </div>
          )}
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
