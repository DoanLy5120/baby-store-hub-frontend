import "./header.scss";
import canhbaoImg from "../../assets/img/header/canhbao.png";
import logo from "../../assets/img/header/logo.png";
import { Button, Menu } from "antd";
import { formatVND } from "../../utils/formatter";
import { getCartItems } from "../../utils/cart";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { AiFillHome } from "react-icons/ai";
import { FaBoxOpen } from "react-icons/fa6";
import { IoNotifications } from "react-icons/io5";
import { RiContactsBook3Fill } from "react-icons/ri";
import { Dropdown, Space, Input, Modal } from "antd";
import { FaChevronDown } from "react-icons/fa";
import { HiOutlineShoppingCart } from "react-icons/hi";
import productApi from "../../api/productApi";

//List navbar
const navbarItems = [
  {
    label: "TRANG CHỦ",
    key: "",
    icon: <AiFillHome />,
  },
  {
    label: "SẢN PHẨM",
    key: "product",
    icon: <FaBoxOpen />,
    children: [
      {
        label: "ITEM1",
        key: "item1",
      },
      {
        label: "ITEM2",
        key: "item2",
      },
    ],
  },
  {
    label: "THÔNG BÁO",
    key: "notifi",
    icon: <IoNotifications />,
  },
  {
    label: "LIÊN HỆ",
    key: "contact",
    icon: <RiContactsBook3Fill />,
  },
];

//dropdown User
const userItems = [
  {
    key: "1",
    label: <Link to="/info">Thông tin cá nhân</Link>,
  },
  {
    key: "2",
    label: <Link to="/login">Đăng xuất</Link>,
  },
];

//search
const { Search } = Input;

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [current, setCurrent] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  // Modal login
  const [openModal, setOpenModal] = useState(false);

  const searchRef = useRef(null);

  const onSearch = async (value) => {
    if (!value) return;

    try {
      const response = await productApi.searchHeader(value);

      // Điều hướng sang trang kết quả tìm kiếm (nếu có)
      navigate("khachHang/san-pham/{id}", {
        state: {
          keyword: value,
          results: response,
        },
      });
    } catch (error) {
      console.error("Lỗi tìm kiếm sản phẩm ở header:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchInput.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await productApi.searchHeader(searchInput);
        setSuggestions(response.data || []);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
        setSuggestions([]);
      }
    }, 500); // Chờ 500ms sau khi dừng gõ

    return () => clearTimeout(delayDebounce); // Xóa timeout nếu người dùng vẫn gõ
  }, [searchInput]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showLoginModal = () => {
    setOpenModal(true);
  };
  //khi nhấn Ok thì đóng modal, sang login
  const handleLoginOk = () => {
    setOpenModal(false);
    navigate("/login");
  };
  //khi hủy, đóng modal
  const handleCancel = () => {
    setOpenModal(false);
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  //hiển thị menu theo key
  const onClick = (e) => {
    setCurrent(e.key);
    navigate(`/${e.key}`);
  };

  //khi đã login sẽ xuất hiện số lượng giỏ hàng
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loginStatus);

    if (loginStatus) {
      const cartItems = getCartItems();
      setCartCount(cartItems.length);
    }
  }, []);

  return (
    <div className="header-wrapper">
      <div className="container">
        <div className="header-top row">
          <span className="header-hotline">
            <i className="fa-solid fa-phone-volume"></i>Hotline:
            <Link to="#" className="link">
              +84 85 7849874 (Miễn phí)
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
          </span>
          <div className="header-login">
            <span>
              <i className="fa-solid fa-truck"></i>
              Miễn phí giao hàng từ hóa đơn {formatVND(500000)}
            </span>
            {!isLoggedIn && (
              <Button
                type="link"
                className="button-login"
                onClick={handleLoginClick}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>

        <div className="row header-next">
          <div className=" header-search col-lg-9">
            <div className="logo">
              <img
                src={logo}
                alt="logo"
                style={{ width: "200px", height: "90px" }}
              />
            </div>
            <div className="search">
              <div className="search-wrapper" ref={searchRef}>
                <Search
                  placeholder="Tìm sản phẩm..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  enterButton
                />
                {suggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map((item) => (
                      <li
                        key={item.id}
                        className="suggestion-item"
                        onClick={() => navigate(`/san-pham/${item.id}`)}
                      >
                        <img
                          src={`${"https://web-production-c18cf.up.railway.app"}/storage/${
                            item.hinhAnh
                          }`}
                          alt={item.tenSanPham}
                          className="suggestion-img"
                        />
                        <span className="suggestion-name">
                          {item.tenSanPham}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="header-right">
              <div className="cart">
                <Link to="/cart" className="cart-link">
                  <HiOutlineShoppingCart />
                  {isLoggedIn && cartCount > 0 && <span>{cartCount}</span>}
                </Link>
              </div>
              <div className="header-user">
                {isLoggedIn ? (
                  <Dropdown menu={{ items: userItems }}>
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="header__account-button"
                    >
                      <Space size={1}>
                        <i className="fa-solid fa-user"></i>
                        <p>Tài khoản</p>
                        <FaChevronDown />
                      </Space>
                    </button>
                  </Dropdown>
                ) : (
                  <>
                    <button
                      onClick={showLoginModal}
                      className="header__account-button"
                    >
                      <Space size={1}>
                        <i className="fa-solid fa-user"></i>
                        <p>Tài khoản</p>
                      </Space>
                    </button>

                    <Modal
                      title={
                        <span
                          style={{
                            color: "#cc0909",
                            fontWeight: "bold",
                            marginLeft: "120px",
                            fontSize: "22px",
                          }}
                        >
                          YÊU CẦU ĐĂNG NHẬP
                        </span>
                      }
                      open={openModal}
                      onOk={handleLoginOk}
                      onCancel={handleCancel}
                      okText=<i
                        class="fa-solid fa-right-to-bracket"
                        style={{ fontSize: "20px", marginRight: "5px" }}
                      ></i>
                      cancelText="Hủy"
                    >
                      <img
                        src={canhbaoImg}
                        alt="login"
                        style={{
                          width: "100%",
                          height: "350px",
                          marginBottom: "10px",
                        }}
                      />
                      <p>
                        Có vẻ như bạn chưa đăng nhập. Hãy đăng nhập ngay để sử
                        dụng đầy đủ các tiện ích và dịch vụ mà chúng tôi cung
                        cấp nhé!
                      </p>
                    </Modal>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="header-menu-wrapper container">
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={navbarItems}
          className="custom-menu"
        />
      </div>
    </div>
  );
}

export default Header;
