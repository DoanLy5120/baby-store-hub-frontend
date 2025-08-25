import HeaderManager from "../../components/manager/headerManager";
import Sidebar from "../../components/manager/sidebarManager";

function ManagerLayoutSidebar({
  children,
  sidebarItems,
  onSidebarClick,
  title,
  disableMarginTop = false,
}) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      {/* Header */}
      <div
        className="container"
        style={{
          position: "fixed",
          top: 0,
          zIndex: 1000,
          paddingTop: 16,
          paddingBottom: 16,
          background: "#fff",
          borderBottom: "1px solid #eee",
        }}
      >
        <HeaderManager />
      </div>

      {/* Body: Sidebar + Content */}
      <div
        className="container"
        style={{
          display: "flex",
          marginTop: disableMarginTop ? 20 : 100,
          gap: 24,
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 200,
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 6,
            padding: 16,
          }}
        >
          {title && (
            <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}>
              {title}
            </div>
          )}
          <Sidebar items={sidebarItems} onItemClick={onSidebarClick} />
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

export default ManagerLayoutSidebar;
