import { Row, Col } from "antd";
import { Link } from "react-router-dom";
import logo from "../../assets/img/header/logo.png";
import "./footer.scss";

const Footer = () => {
  return (
    <footer className="footer-container">
      <Row gutter={[32, 32]}>
        {/* Cửa hàng */}
        <Col xs={24} sm={12} md={6}>
          <div className="footer-section">
            <div className="logo">
              <img
                src={logo}
                alt="logo"
                style={{ width: "200px", height: "90px" }}
              />
            </div>
            <div className="footer-content">
              <p>
                BabyHub Store là cửa hàng chuyên cung cấp các sản phẩm mẹ và bé
                chất lượng, an toàn và chính hãng. Với tiêu chí "Yêu thương từ
                những điều nhỏ nhất", BabyHub luôn đồng hành cùng mẹ trong hành
                trình chăm sóc bé yêu.
              </p>
            </div>
          </div>
        </Col>

        {/* Chính sách */}
        <Col xs={24} sm={12} md={6}>
          <div className="footer-section">
            <h3 className="footer-title">CHÍNH SÁCH & HỖ TRỢ</h3>
            <div className="footer-content">
              <p>
                <Link to="#">Chính sách đổi/trả hàng</Link>
              </p>
              <p>
                <Link to="#">Chính sách giao hàng</Link>
              </p>
              <p>
                <Link to="#">Hướng dẫn mua hàng</Link>
              </p>
              <p>
                <Link to="#">Câu hỏi thường gặp (FAQ)</Link>
              </p>
              <p>
                <Link to="#">Tích điểm Quà tặng VIP</Link>
              </p>
            </div>
          </div>
        </Col>

        {/* Ưu đãi đặc biệt */}
        <Col xs={24} sm={12} md={6}>
          <div className="footer-section">
            <h3 className="footer-title">ƯU ĐÃI ĐẶC BIỆT</h3>
            <div className="footer-content">
              <p>
                <Link to="#">Chương trình cho thành viên</Link>
              </p>
              <p>
                <Link to="#">Mã giảm giá hot</Link>
              </p>
              <p>
                <Link to="#">Quà tặng cho đơn hàng đầu tiên</Link>
              </p>
              <p>
                <Link to="#">Combo tiết kiệm cho mẹ & bé</Link>
              </p>
            </div>
          </div>
        </Col>

        {/* Liên hệ  */}
        <Col xs={24} sm={12} md={6}>
          <div className="footer-section">
            <h3 className="footer-title">LIÊN HỆ VỚI CHÚNG TÔI</h3>
            <div className="footer-content">
              <p>
                <strong>Địa chỉ:</strong> Số 185, đường Ông Ích Khiêm, TP. Đà
                Nẵng
              </p>
              <p>
                <strong>Hotline:</strong> +84 85 7849874 (Miễn phí)
              </p>
              <p>
                <strong>Email:</strong> babyhub.store@gmail.com
              </p>
              <p>
                <strong>Thời gian làm việc:</strong> 8:00 – 20:00 (T2 – CN)
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </footer>
  );
};

export default Footer;
