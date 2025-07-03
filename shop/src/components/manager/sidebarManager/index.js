import { Menu } from "antd";

function SidebarManager({
  items,
  onItemClick,
  defaultSelectedKeys = [],
  defaultOpenKeys = [],
}) {
  return (
    <Menu
      mode="inline"
      defaultSelectedKeys={defaultSelectedKeys}
      defaultOpenKeys={defaultOpenKeys}
      items={items}
      onClick={onItemClick}
      className="sidebar-menu"
    />
  );
}

export default SidebarManager;
