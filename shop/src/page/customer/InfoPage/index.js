import "./info.scss";
import { useEffect, useState } from "react";
import { Button, Card, DatePicker, Form, Input, Modal, Upload, message } from "antd";
import profileApi from "../../../api/profileApi";
import dayjs from "dayjs";
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, CalendarOutlined, LockOutlined, CameraOutlined } from '@ant-design/icons';


const API_ORIGIN = "http://127.0.0.1:8000";

const toAbsoluteAvatarUrl = (u) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;         
  if (u.startsWith("/")) return `${API_ORIGIN}${u}`; 
  return `${API_ORIGIN}/storage/${u}`;            
};

export default function Info() {
  const [active, setActive] = useState("profile"); 
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();


  useEffect(() => {
    (async () => {
      try {
        const res = await profileApi.getProfile();
        const data = res.data; 
        form.setFieldsValue({
          hoTen: data.hoTen || "",
          email: data.email || "",
          diaChi: data.diaChi || "",
          ngaySinh: data.ngaySinh ? dayjs(data.ngaySinh) : null,
          sdt: data.sdt || "",
        });
       
        setAvatarUrl(data.avatar ? toAbsoluteAvatarUrl(data.avatar) : null);
      } catch (err) {
        message.error(err.message || "Không thể tải hồ sơ.");
      }
    })();
   
  }, []);


  const onSubmitProfile = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        ngaySinh: values.ngaySinh ? values.ngaySinh.format("YYYY-MM-DD") : null,
      };
      const res = await profileApi.updateProfile(payload);
      message.success(res.data?.message || "Cập nhật hồ sơ thành công");
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleUpload = async (input) => {
    const file = input?.file || input; 
    try {
      setLoading(true);
      const res = await profileApi.uploadAvatar(file);
      const raw = res?.data?.avatar ?? res?.data?.data?.avatar ?? null;
      const abs = toAbsoluteAvatarUrl(raw);
      if (abs) {
        setAvatarUrl(`${abs}?t=${Date.now()}`);
      }
      message.success(res.data?.message || "Cập nhật avatar thành công");
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };



  const onDeleteAvatar = () => {
    Modal.confirm({
      title: "Xoá avatar?",
      okText: "Xoá",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          const res = await profileApi.deleteAvatar();
          setAvatarUrl(null);
          message.success(res.data?.message || "Đã xoá avatar");
        } catch (err) {
          message.error(err.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Đổi mật khẩu
  const onSubmitPassword = async (v) => {
    try {
      setLoading(true);
      const res = await profileApi.changePassword({
        current_password: v.current_password,
        password: v.password,
        password_confirmation: v.password_confirmation,
      });
      message.success(res.data?.message || "Đổi mật khẩu thành công");
      pwdForm.resetFields();
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="info container">
    
      <div className="info__aside">
        <Card title="TÀI KHOẢN CỦA TÔI" className="info__aside-card" >
          <div
            className={`aside-item ${active === "profile" ? "active dot--orange" : ""}`}
            onClick={() => setActive("profile")}
          >
            <span className="dot dot--orange" />
            <UserOutlined /> Hồ sơ
          </div>
          <div
            className={`aside-item ${active === "password" ? "active dot--blue" : ""}`}
            onClick={() => setActive("password")}
          >
            <span className="dot dot--blue" />
            <LockOutlined /> Mật khẩu
          </div>
        </Card>
      </div>

     
      <div className="info__content">
        {active === "profile" ? (
          <Card title="Hồ sơ cá nhân" className="info__content-card" >
            <div className="profile-grid">
             
              <div className="profile-grid__form">
                <Form form={form} layout="vertical" onFinish={onSubmitProfile}>
                  <Form.Item
                    label="Họ và Tên"
                    name="hoTen"
                    rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" className="input-field" />
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" className="input-field" />
                  </Form.Item>

                  <Form.Item
                    label="Địa chỉ"
                    name="diaChi"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                  >
                    <Input prefix={<HomeOutlined />} placeholder="Nhập địa chỉ của bạn" className="input-field" />
                  </Form.Item>

                  <Form.Item
                    label="Ngày sinh"
                    name="ngaySinh"
                    rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
                  >
                    <DatePicker format="YYYY-MM-DD" className="input-field" />
                  </Form.Item>

                  <Form.Item
                    label="Số điện thoại"
                    name="sdt"
                    rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" className="input-field" />
                  </Form.Item>

                  <div className="form-actions">
                    <Button type="primary" className="btn-pink" htmlType="submit" loading={loading} icon={<UserOutlined />}>
                      Cập nhật
                    </Button>
                    <Button className="btn-blue" htmlType="button" onClick={() => form.resetFields()} icon={<HomeOutlined />}>
                      Hủy bỏ
                    </Button>
                  </div>
                </Form>
              </div>

             
              <div className="profile-grid__avatar">
                <div className="avatar-box">
                  {avatarUrl ? (
                    <img src={toAbsoluteAvatarUrl(avatarUrl)} alt="avatar" />
                  ) : (
                    <div className="avatar-placeholder">Avatar</div>
                  )}
                </div>

                <Upload
  accept="image/png,image/jpeg,image/jpg,image/webp"
  showUploadList={false}
  beforeUpload={(file) => {
    
    handleUpload({ file });
    return false; 
  }}
>
  <Button className="btn-change-avatar" icon={<CameraOutlined />}>Thay avatar</Button>
</Upload>


                {avatarUrl && (
                  <Button danger style={{ marginTop: 8 }} onClick={onDeleteAvatar}>
                    Xoá avatar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card title="Thay đổi mật khẩu" className="info__content-card" >
            <Form form={pwdForm} layout="vertical" onFinish={onSubmitPassword}>
              <Form.Item
                label="Mật khẩu cũ"
                name="current_password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
              >
                <Input.Password placeholder="Nhập mật khẩu cũ" className="input-field" />
              </Form.Item>

              <Form.Item
                label="Nhập lại mật khẩu mới"
                name="password"
                rules={[{ required: true, min: 8, message: "Tối thiểu 8 ký tự" }]}
              >
                <Input.Password placeholder="Nhập lại mật khẩu mới" className="input-field" />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu mới"
                name="password_confirmation"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) return Promise.resolve();
                      return Promise.reject(new Error("Xác nhận mật khẩu mới không khớp."));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Xác nhận mật khẩu mới" className="input-field" />
              </Form.Item>

              <div className="form-actions">
                <Button type="primary" className="btn-pink" htmlType="submit" loading={loading}>
                  Cập nhật
                </Button>
                <Button className="btn-blue" htmlType="button" onClick={() => pwdForm.resetFields()}>
                  Hủy bỏ
                </Button>
              </div>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
}
