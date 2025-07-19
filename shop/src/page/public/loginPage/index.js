import React from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosClient.post("/auth/login", {
        email,
        password,
      });
      const { token, vaiTro, id } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", vaiTro);
      localStorage.setItem("userId", id);
      localStorage.setItem("isLoggedIn", "true");

      if (vaiTro === "QuanLyCuaHang") {
        navigate("/manager");
      } else if (vaiTro === "Admin") {
        navigate("/admin");
      } else if (vaiTro === "NhanVien") {
        navigate("/staff");
      } else {
        navigate("/");
      }
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await axiosClient.post("/auth/forgot-password", { email });
      alert("Email đặt lại mật khẩu đã được gửi!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 relative overflow-hidden">
      <div className="relative z-10 flex w-full max-w-7xl bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="hidden md:flex w-1/2 bg-pink-100 relative overflow-hidden">
          <img
            src="https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482760xjD/anh-mo-ta.png"
            alt="Mother and Baby"
            className="object-cover w-full h-full transform hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Chào mừng trở lại</h3>
            <p className="opacity-90">
              Hãy đăng nhập để tiếp tục hành trình chăm sóc bé yêu
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="login-form">
            <h2 className="text-3xl font-bold mb-6 text-center text-pink-600">
              Đăng Nhập
            </h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Nhập email của bạn"
                  
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Nhập mật khẩu"
                  
                />
              </div>
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 rounded text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-gray-700">Ghi nhớ tôi</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-pink-600 hover:underline text-sm"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700 transition shadow-md hover:shadow-lg"
              >
                Đăng Nhập
              </button>
            </form>
            <p className="mt-6 text-center text-gray-600">
              Chưa có tài khoản?{" "}
              <span
                className="text-pink-600 hover:underline cursor-pointer font-medium"
                onClick={() => navigate("/register")}
              >
                Đăng ký ngay
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;