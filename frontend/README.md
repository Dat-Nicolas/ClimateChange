# ClimateChange - Smart AC Mobile Reference

Dự án này là bản tham khảo (reference) cho ứng dụng di động quản lý điều hòa thông minh, được xây dựng bằng React Native (Expo) và TypeScript.

## 🚀 Công nghệ sử dụng
- **Framework:** React Native + Expo.
- **Ngôn ngữ:** TypeScript.
- **Styling:** Vanilla StyleSheet với hệ thống Theme tùy chỉnh.
- **Icons:** @expo/vector-icons (Ionicons, MaterialCommunityIcons).

## 📂 Cấu trúc thư mục
- `src/theme/`: Chứa định nghĩa màu sắc (`colors`), khoảng cách (`spacing`), và kiểu chữ (`typography`).
- `src/components/common/`: Các component dùng chung (Button, Header, Loading).
- `src/screens/`: Các màn hình chính (Login, Dashboard, RoomDetail, ActivityLog).
- `src/services/`: Tách biệt logic gọi API.
- `src/navigation/`: (Placeholder) Cấu hình điều hướng React Navigation.

## 🎨 Design System
Dựa trên phong cách **"Atmospheric Precision"**:
- **Primary (#3B82F6):** Dành cho các tính năng làm mát (Cooling).
- **Secondary (#F97316):** Dành cho các tính năng sưởi ấm (Heating).
- **Tertiary (#EF4444):** Dành cho nút nguồn và cảnh báo.
- **Surface:** Sử dụng màu trắng và các lớp đổ bóng (shadows) nhẹ để tạo chiều sâu.

## 🛠 Cách chạy dự án
1. Cài đặt dependencies:
   ```bash
   npm install
   ```
2. Chạy ứng dụng:
   ```bash
   npx expo start
   ```

## 📝 Lưu ý quan trọng
- Luôn sử dụng `theme` thay vì mã màu trực tiếp để đảm bảo tính nhất quán.
- Tách biệt logic API vào thư mục `services`.
- Sử dụng `ActivityLog` để ghi lại mọi thao tác quan trọng.
