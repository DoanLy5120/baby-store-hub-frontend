import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = React.useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://jsonplaceholder.typicode.com/posts", formData);
      navigate("/login");
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
    } catch (err) {
      setError("Đăng ký thất bại");
    }
  };

  const handleSocialRegister = (provider) => {
    alert(`Đăng ký với ${provider} (giả lập)`);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="register-container min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 relative overflow-hidden">
      
     

     
      <div className="relative z-10 flex w-full max-w-7xl bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="hidden md:flex w-1/2 bg-pink-100 relative overflow-hidden">
          <img
            src="https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482760xjD/anh-mo-ta.png"
            alt="Mother and Baby"
            className="object-cover w-full h-full transform hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Bắt đầu hành trình</h3>
            <p className="opacity-90">Đăng ký để nhận những lời khuyên hữu ích cho mẹ và bé</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="register-form">
            <h2 className="text-3xl font-bold mb-6 text-center text-pink-600">Đăng Ký</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Họ và Tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700 transition shadow-md hover:shadow-lg"
              >
                Đăng Ký
              </button>
            </form>
            <div className="mt-6">
              <div className="flex items-center mb-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3 text-gray-500">Hoặc đăng ký với</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleSocialRegister("facebook")}
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition shadow-md flex items-center justify-center w-12 h-12"
                >
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button
                  onClick={() => handleSocialRegister("google")}
                  className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition shadow-md flex items-center justify-center w-12 h-12"
                >
                  <i className="fab fa-google"></i>
                </button>
              </div>
            </div>
            <p className="mt-6 text-center text-gray-600">
              Đã có tài khoản?{" "}
              <span
                className="text-pink-600 hover:underline cursor-pointer font-medium"
                onClick={() => navigate("/login")}
              >
                Đăng nhập ngay
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-pink-200 opacity-30 animate-float"></div>
      <div className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-blue-200 opacity-30 animate-float-delay"></div>
    </div>
  );
};

export default RegisterPage;