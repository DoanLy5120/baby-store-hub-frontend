export const  formatNumber = (num) => {
  const number = Number(num);
  if (isNaN(number)) return "0";
  return number.toLocaleString("vi-VN", {
    maximumFractionDigits: 0, // Không hiển thị phần thập phân
  });
}
