import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { Empty } from "antd"

/**
 * RevenueChart.js - Component hiển thị biểu đồ doanh thu
 *
 * Props:
 * - type: Loại biểu đồ ('day', 'hour', 'weekday')
 * - period: Kỳ thời gian ('current-month', 'last-month', 'quarter')
 *
 * Chức năng:
 * - Tạo dữ liệu mẫu cho biểu đồ doanh thu theo ngày (28 ngày)
 * - Cấu hình biểu đồ cột với Recharts (thay thế @ant-design/charts)
 * - Highlight cột có doanh thu cao nhất (ngày 28)
 * - Hiển thị Empty state cho các tab chưa có dữ liệu (theo giờ, theo thứ)
 * - Format tooltip và trục Y theo định dạng tiền tệ Việt Nam
 */
const RevenueChart = ({ type, period }) => {
  // Các ngày có doanh thu cao nổi bật (để đánh dấu)
  const highlightDays = [1, 2, 5, 7, 8, 9, 11, 12, 13, 15, 16, 17, 20, 23, 25, 27, 28];

  // Hàm tạo dữ liệu doanh thu mẫu cho 31 ngày
  const generateDailyData = () =>
    Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      const isHighlight = highlightDays.includes(day);
      return {
        day: day.toString().padStart(2, "0"),
        revenue: isHighlight ? Math.floor(50000000 + Math.random() * 30000000) : Math.floor(Math.random() * 10000000),
        isHighlight,
      };
    });

  // Format tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "white",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <p className="label">{`Ngày: ${label}`}</p>
          <p className="intro" style={{ color: "#1890ff" }}>
            {`Doanh thu: ${new Intl.NumberFormat("vi-VN").format(payload[0].value)}₫`}
          </p>
        </div>
      )
    }
    return null
  }

  // Format trục Y
  const formatYAxis = (value) => {
    return `${value / 1000}k`
  }

  // Hiển thị biểu đồ theo loại
  if (type === "day") {
    const data = generateDailyData()

    return (
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
              tickFormatter={formatYAxis}
              domain={[0, 40000]}
              ticks={[0, 5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000]}
            />
            <Bar dataKey="revenue" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isHighlight ? "#1890ff" : "#e6f7ff"} />
              ))}
            </Bar>
            <CustomTooltip />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Hiển thị Empty state cho các tab khác
  return (
    <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Empty
        description={`Dữ liệu ${type === "hour" ? "theo giờ" : "theo thứ"} sẽ được hiển thị ở đây`}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </div>
  )
}

export default RevenueChart
