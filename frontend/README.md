# Smart AC IoT - Frontend (React Native/Expo)

Ứng dụng di động quản lý điều hòa thông minh.

## 🛠 Cách chạy dự án
1. Cài đặt dependencies:
   ```bash
   npm install
   ```
2. Chạy ứng dụng:
   ```bash
   npx expo start
   ```

## Deployment on Render.com (Web version)

Dự án đã được cấu hình sẵn để triển khai phiên bản Web lên Render thông qua file `render.yaml` ở thư mục gốc.

### Các bước thực hiện:
1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com).
2. Khi deploy thông qua Blueprint, Render sẽ tự động thực hiện:
   - Cài đặt node_modules.
   - Chạy lệnh `npx expo export:web` để tạo thư mục `web-build`.
   - Phục vụ ứng dụng dưới dạng trang web tĩnh.

### Biến môi trường (Environment Variables):
Để ứng dụng có thể kết nối với Backend, bạn **BẮT BUỘC** phải cấu hình biến môi trường sau trên Render (hoặc trong file `.env` local):

| Biến | Giá trị |
| :--- | :--- |
| `EXPO_PUBLIC_BASE_URL` | URL của Backend đã deploy (ví dụ: `https://your-backend.onrender.com`) |

**Lưu ý:** Trong Expo, các biến môi trường muốn sử dụng ở client side phải bắt đầu bằng tiền tố `EXPO_PUBLIC_`.

### Cách lấy giá trị:
- Sau khi bạn deploy thành công Backend trên Render, hãy copy URL của nó và dán vào phần cấu hình Environment Variables của Frontend Service trên Render.

---
## 🎨 Design System
Dựa trên phong cách **"Atmospheric Precision"** với màu sắc hiện đại và UX mượt mà.
