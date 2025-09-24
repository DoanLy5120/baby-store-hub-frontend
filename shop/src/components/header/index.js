"use client";

import "./header.scss";
import canhbaoImg from "../../assets/img/header/canhbao.png";
import logo from "../../assets/img/header/logo.png";
import { Button, Menu } from "antd";
import { formatVND } from "../../utils/formatter";
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
import cartApi from "../../api/cartApi";

//List navbar
const navbarItems = [
  {
    label: "TRANG CHỦ",
    key: "",
    icon: <AiFillHome />,
  },
  {
    label: "ĐƠN MUA",
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

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [current, setCurrent] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Modal login
  const [openModal, setOpenModal] = useState(false);

  const searchRef = useRef(null);

  // Enhanced scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setCartCount(0);
    navigate("/");
  };

  // Dropdown userItems với đăng xuất
  const userItems = [
    {
      key: "1",
      label: <Link to="/info">Thông tin cá nhân</Link>,
    },
    {
      key: "2",
      label: <span onClick={handleLogout}>Đăng xuất</span>,
    },
  ];

  //search
  const { Search } = Input;

  const onSearch = (value) => {
    console.log("Hàm onSearch đã được gọi với từ khóa:", value);

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }
    navigate(`/tim-kiem?q=${trimmedValue}`);
    setSuggestions([]);
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
    }, 300);

    return () => clearTimeout(delayDebounce);
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

  const handleLoginOk = () => {
    setOpenModal(false);
    navigate("/login");
  };

  const handleCancel = () => {
    setOpenModal(false);
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const onClick = (e) => {
    setCurrent(e.key);
    navigate(`/${e.key}`);
  };

  const fetchCartCount = async () => {
    try {
      const res = await cartApi.getAll();

      if (res && res.data) {
        let cartItems = [];

        if (
          res.data.data &&
          res.data.data.san_pham &&
          Array.isArray(res.data.data.san_pham)
        ) {
          cartItems = res.data.data.san_pham;
        } else if (res.data.san_pham && Array.isArray(res.data.san_pham)) {
          cartItems = res.data.san_pham;
        } else if (Array.isArray(res.data)) {
          cartItems = res.data;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          cartItems = res.data.data;
        }

        const uniqueProductCount = cartItems.length;
        setCartCount(uniqueProductCount);
      } else {
        setCartCount(0);
      }
    } catch (err) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loginStatus);

    if (loginStatus) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    const handleCartUpdated = () => {
      const loginStatus = localStorage.getItem("isLoggedIn") === "true";

      if (loginStatus) {
        fetchCartCount();
      } else {
        setCartCount(0);
      }
    };

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, []);

  return (
    <div className="enhanced-header-wrapper">

      <div className="container">
        <div className={`header-top row ${isScrolled ? "scrolled" : ""}`}>
          <span className="header-hotline">
            <i className="fa-solid fa-phone-volume phone-pulse"></i>Hotline:
            <Link to="#" className="link">
              +84 85 7849874 (Miễn phí)
            </Link>
            <span>|</span>
            <div className="social-icon">
              <Link to="#" className="link social-link">
                <i className="fa-brands fa-facebook"></i>
              </Link>
              <Link to="#" className="link social-link">
                <i className="fa-brands fa-instagram"></i>
              </Link>
            </div>
          </span>
          <div className="header-login">
            <span className="shipping-info">
              <i className="fa-solid fa-truck truck-bounce"></i>
              Miễn phí giao hàng từ hóa đơn {formatVND(500000)}
            </span>
            {!isLoggedIn && (
              <Button
                type="link"
                className="button-login enhanced-login-btn"
                onClick={handleLoginClick}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>

        <div className={`row header-next ${isScrolled ? "scrolled" : ""}`}>
          <div className="header-background">
            <div className="floating-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
              <div className="shape shape-4"></div>
            </div>
            <div className="gradient-overlay"></div>
          </div>
          <div className="header-search col-lg-9">
            <div className="logo enhanced-logo">
              <img
                src={logo || "/placeholder.svg"}
                alt="logo"
                style={{ width: "200px", height: "90px" }}
              />
              <div className="logo-glow"></div>
            </div>
            <div className="search enhanced-search">
              <div className="search-wrapper" ref={searchRef}>
                <Search
                  placeholder="Tìm sản phẩm..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  onSearch={onSearch}
                  enterButton
                  className="enhanced-search-input"
                />
                {suggestions.length > 0 && (
                  <ul className="suggestions-list enhanced-suggestions">
                    {suggestions.map((item) => (
                      <li
                        key={item.id}
                        className="suggestion-item"
                        onClick={() => navigate(`/san-pham/${item.id}`)}
                      >
                        <img
                          src={`${"http://127.0.0.1:8000"}/storage/${
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
            <div className="header-right enhanced-header-right">
              <div className="cart enhanced-cart">
                <Link to="/cart" className="cart-link">
                  <HiOutlineShoppingCart />
                  {isLoggedIn && cartCount > 0 && (
                    <span className="cart-badge-enhanced">{cartCount}</span>
                  )}
                </Link>
              </div>
              <div className="header-user enhanced-user">
                {isLoggedIn ? (
                  <Dropdown menu={{ items: userItems }}>
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="header__account-button enhanced-account-btn"
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
                      className="header__account-button enhanced-account-btn"
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
                      okText={
                        <i
                          className="fa-solid fa-right-to-bracket"
                          style={{ fontSize: "20px", marginRight: "5px" }}
                        ></i>
                      }
                      cancelText="Hủy"
                      className="enhanced-modal"
                    >
                      <img
                        src={canhbaoImg || "/placeholder.svg"}
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
      <div
        className={`header-menu-wrapper container ${
          isScrolled ? "scrolled" : ""
        }`}
      >
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={navbarItems}
          className="custom-menu enhanced-menu"
        />
      </div>
    </div>
  );
}

export default Header;
