import axiosClient from "./axiosClient";

const profileApi = {
  getProfile() {
    return axiosClient.get("/khach-hang/profile");
  },

  updateProfile(payload) {
    return axiosClient.post("/khach-hang/profile", payload);
  },

  uploadAvatar(file) {
  const real = file?.originFileObj ? file.originFileObj : file;
  const fd = new FormData();
  fd.append("avatar", real, real.name || "avatar.jpg");

  return axiosClient.post("/khach-hang/profile/avatar", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
,


  deleteAvatar() {
    return axiosClient.delete("/khach-hang/profile/avatar");
  },

  changePassword({ current_password, password, password_confirmation }) {
    return axiosClient.post("/khach-hang/profile/password", {
      current_password,
      password,
      password_confirmation,
    });
  },
};

export default profileApi;
