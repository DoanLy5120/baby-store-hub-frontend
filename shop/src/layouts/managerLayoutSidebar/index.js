import HeaderManager from "../../components/manager/headerManager";
import Sidebar from "../../components/manager/sidebarManager";
import { Layout } from "antd";

const { Sider, Content } = Layout;

function ManagerLayoutSidebar({
  children,
  sidebarItems,
  onSidebarClick,
  title,
  disableMarginTop = false,
}) {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header cố định */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          zIndex: 1000,
          backgroundColor: "#fff",
        }}
      >
        <HeaderManager />
      </div>

      {/* Sidebar cố định */}
      <div
        style={{
          position: "fixed",
          top: 80,
          left: 0,
          width: 200,
          height: "calc(100vh - 80px)",
          overflowY: "auto",
          backgroundColor: "#fff",
          borderRight: "1px solid #eee",
          zIndex: 999,
        }}
      >
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
      </div>

      {/* Nội dung chính */}
      <div
        style={{
          marginTop: disableMarginTop ? 0 : 80,
          marginLeft: 200,
          backgroundColor: "#f5f7fa",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default ManagerLayoutSidebar;
