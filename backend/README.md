# Smart AC IoT - Backend (NestJS)

Hệ thống quản lý điều hòa thông minh tích hợp AI và IoT.

## Project Setup
```bash
$ npm install
$ npx prisma generate
```

## Running Locally
```bash
# development
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Deployment on Render.com

Hệ thống đã được cấu hình sẵn file `render.yaml` ở thư mục gốc để triển khai nhanh.

### Các bước thực hiện:
1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com).
2. Chọn **New +** -> **Blueprint**.
3. Kết nối với Repository GitHub của dự án.
4. Render sẽ tự động nhận diện file `render.yaml` và liệt kê các dịch vụ cần tạo.
5. Nhấn **Approve** để bắt đầu quá trình build và deploy.

### Cấu hình thủ công (nếu không dùng Blueprint):
Nếu bạn không dùng file `render.yaml`, hãy thiết lập các thông số sau:
- **Root Directory:** `backend`
- **Build Command:** `npm install && npx prisma generate && npm run build`
- **Start Command:** `npm run start:prod`

### Biến môi trường (Environment Variables):
Nếu bạn muốn cấu hình thủ công hoặc kiểm tra lại, đây là các biến quan trọng:

| Biến | Giá trị | Nguồn lấy |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:password@host:port/db` | Lấy từ tab "Connect" của database trên Render |
| `JWT_SECRET` | Chuỗi ký tự bất kỳ (ví dụ: `your-secret-key`) | Tự tạo để bảo mật token |
| `PORT` | `3000` | Render tự cấp, mặc định là 3000 |
| `NODE_VERSION` | `20` | Quy định phiên bản Node.js chạy trên Render |

### Lưu ý về Prisma:
Trong quá trình build trên Render, lệnh `npx prisma generate` sẽ được chạy tự động để đảm bảo Prisma Client tương thích với môi trường Linux của Render.

---
## License
Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
