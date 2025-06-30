import "./headerManager.scss";
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Menu } from "antd";
import { Dropdown, Space } from "antd";
import { FaEye, FaSellcast, FaChevronDown } from "react-icons/fa";
import { FaBoxOpen, FaBoxArchive, FaWarehouse, FaUsers } from "react-icons/fa6";
import { BiSolidCategory, BiSolidReport } from "react-icons/bi";
import { AiOutlineTransaction } from "react-icons/ai";
import { CgShutterstock } from "react-icons/cg";
import {
  MdLocalShipping,
  MdPayments,
  MdBookOnline,
  MdAccountBox,
} from "react-icons/md";
import { PiKeyReturnFill } from "react-icons/pi";
import {
  FaThList,
  FaCalendar,
  FaCalendarAlt,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import { SiGooglecloudstorage } from "react-icons/si";
import { IoLogOut } from "react-icons/io5";

const navbarManager = [
  {
    label: "TỔNG QUAN",
    key: "manager",
    icon: <FaEye />,
  },
  {
    label: "BÁN HÀNG",
    key: "manager/ban-hang",
    icon: <FaSellcast />,
  },
  {
    label: "HÀNG HÓA",
    key: "manager/hang-hoa",
    icon: <FaBoxOpen />,
    children: [
      {
        label: "Danh mục",
        key: "manager/hang-hoa/danh-muc",
        icon: <BiSolidCategory />,
      },
      {
        label: "Sản phẩm",
        key: "manager/hang-hoa/san-pham",
        icon: <FaBoxArchive />,
      },
      {
        label: "Kiểm kho",
        key: "manager/hang-hoa/kiem-kho",
        icon: <FaWarehouse />,
      },
    ],
  },
  {
    label: "GIAO DỊCH",
    key: "manager/giao-dich",
    icon: <AiOutlineTransaction />,
    children: [
      {
        label: "Hóa đơn",
        key: "manager/giao-dich/hoa-don",
        icon: <BiSolidCategory />,
      },
      {
        label: "Nhập hàng",
        key: "manager/giao-dich/nhap-hang",
        icon: <CgShutterstock />,
      },
      {
        label: "Trả hàng",
        key: "manager/giao-dich/tra-hang",
        icon: <PiKeyReturnFill />,
      },
      {
        label: "Vận đơn",
        key: "manager/giao-dich/van-don",
        icon: <MdLocalShipping />,
      },
    ],
  },
  {
    label: "NHÂN VIÊN",
    key: "manager/nhan-vien",
    icon: <FaUsers />,
    children: [
      {
        label: "Danh sách nhân viên",
        key: "manager/nhan-vien/danh-sach",
        icon: <FaThList />,
      },
      {
        label: "Lịch làm việc",
        key: "manager/nhan-vien/lich",
        icon: <FaCalendar />,
      },
      {
        label: "Bảng chấm công",
        key: "manager/nhan-vien/cham-cong",
        icon: <FaCalendarAlt />,
      },
      {
        label: "Bảng lương",
        key: "manager/nhan-vien/bang-luong",
        icon: <MdPayments />,
      },
    ],
  },
  {
    label: "BÁO CÁO",
    key: "manager/bao-cao",
    icon: <BiSolidReport />,
    children: [
      {
        label: "Doanh thu",
        key: "manager/bao-cao/doanh-thu",
        icon: <FaMoneyCheckAlt />,
      },
      {
        label: "Cân đối kho",
        key: "manager/bao-cao/can-doi-kho",
        icon: <SiGooglecloudstorage />,
      },
    ],
  },
  {
    label: "NHẬN ĐƠN ONLINE",
    key: "manager/online",
    icon: <MdBookOnline />,
  },
];

const userItems = [
  {
    key: "1",
    label: <Link to="/manager/tai-khoan">TÀI KHOẢN</Link>,
    icon: <MdAccountBox />,
  },
  {
    key: "2",
    label: <Link to="/login">ĐĂNG XUẤT</Link>,
    icon: <IoLogOut />,
  },
];

function HeaderManager() {
  const navigate = useNavigate();
  const [isLoggedIn] = useState(false);
  //chuyển tab
  const location = useLocation();
  const currentPath = location.pathname.replace(/^\/|\/$/g, "");
  const [current, setCurrent] = useState(currentPath);
  const onClick = (e) => {
    setCurrent(e.key);
    navigate(`/${e.key}/`);
  };

  return (
    <header className="container">
      <div className="manager__header-top row">
        <div className="manager__header-email">
          <i className="fa-solid fa-envelope"></i>Email:
          <Link to="#" className="link">
            admin.baby@gmail.com
          </Link>
          <span>|</span>
          <div className="social-icon">
            <Link to="#" className="link">
              <i className="fa-brands fa-facebook"></i>
            </Link>
            <Link to="#" className="link">
              <i className="fa-brands fa-instagram"></i>
            </Link>
          </div>
        </div>
        <div className="manager__header-owner">
          <span>
            <i className="fa-solid fa-question"></i>
            <Link to="#" className="link">
              Hỗ trợ
            </Link>
          </span>
          <span>
            <i className="fa-solid fa-bell"></i>
            <Link to="#" className="link">
              Thông báo
            </Link>
          </span>
          {!isLoggedIn && (
            <Dropdown menu={{ items: userItems }}>
              <button
                onClick={(e) => e.preventDefault()}
                className="manager__header-account"
              >
                <Space size={1}>
                  <i className="fa-solid fa-user"></i>
                  <p>BabyHub</p>
                  <FaChevronDown />
                </Space>
              </button>
            </Dropdown>
          )}
        </div>
      </div>
      <div className="manager__header-menu">
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={navbarManager}
        />
      </div>
    </header>
  );
}

export default HeaderManager;
