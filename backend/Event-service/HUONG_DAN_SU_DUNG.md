# 🇻🇳 HƯỚNG DẪN SỬ DỤNG AI CHAT SERVICE

## 📋 TỔNG QUAN

AI Chat Service là hệ thống chat thông minh tích hợp Gemini AI, giúp:
- **Sinh viên**: Hỏi đáp về sự kiện, đăng ký tham gia
- **Giảng viên**: Lập kế hoạch sự kiện với AI hỗ trợ
- **Guest**: Chat không cần đăng nhập

---

## 🚀 BẮT ĐẦU NHANH

### Bước 1: Cài đặt

```bash
# Di chuyển vào thư mục dự án
cd backend/Event-service

# Cài đặt dependencies
mvn clean install
```

### Bước 2: Cấu hình

```bash
# Copy file cấu hình mẫu
cp .env.example .env

# Mở file .env và thêm Gemini API key
# GEMINI_API_KEY=your_api_key_here
```

**Lấy Gemini API Key:**
1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập tài khoản Google
3. Click "Create API Key"
4. Copy key và dán vào file `.env`

### Bước 3: Chạy ứng dụng

```bash
mvn spring-boot:run
```

### Bước 4: Kiểm tra

Mở trình duyệt: http://localhost:8080

---

## 💬 SỬ DỤNG CHAT

### Cách 1: Qua API (Postman/cURL)

#### Tạo phiên chat
```bash
curl -X POST http://localhost:8080/api/v1/chat/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Nguyễn Văn A",
    "guestEmail": "email@example.com"
  }'
```

**Kết quả:**
```json
{
  "code": 1000,
  "message": "Chat session created successfully",
  "result": {
    "sessionId": "abc-123-xyz",
    "status": "ACTIVE",
    "messages": [
      {
        "role": "ASSISTANT",
        "content": "Xin chào! Tôi là trợ lý AI..."
      }
    ]
  }
}
```

#### Gửi tin nhắn
```bash
curl -X POST http://localhost:8080/api/v1/chat/messages \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc-123-xyz",
    "content": "Tôi muốn tổ chức hội thảo AI"
  }'
```

**Kết quả:**
```json
{
  "code": 1000,
  "result": {
    "role": "ASSISTANT",
    "content": "Tuyệt vời! Hội thảo AI là chủ đề rất thú vị..."
  }
}
```

### Cách 2: Qua Frontend (React)

Xem file: `FRONTEND_INTEGRATION_EXAMPLE.tsx`

---

## 🎯 CÁC TÍNH NĂNG

### 1. Chat với Guest (Không cần đăng nhập)

**Kịch bản:**
```
1. Mở trang web
2. Click nút "Chat với AI"
3. Nhập tên (tùy chọn)
4. Bắt đầu chat
```

**Ví dụ hội thoại:**
```
User: Có sự kiện nào sắp diễn ra không?
AI: Hiện có 3 sự kiện sắp diễn ra:
    1. Hội thảo AI - 15/01/2025
    2. Workshop Python - 20/01/2025
    3. Seminar Blockchain - 25/01/2025
    
    Bạn muốn biết thêm về sự kiện nào?

User: Hội thảo AI
AI: Hội thảo AI sẽ diễn ra vào 15/01/2025...
```

### 2. Lập kế hoạch sự kiện với AI

**Kịch bản:**
```
1. Đăng nhập (Giảng viên)
2. Mở chat
3. Nói với AI về sự kiện muốn tổ chức
4. AI hỏi thêm thông tin
5. Tạo kế hoạch từ chat
```

**Ví dụ hội thoại:**
```
User: Tôi muốn tổ chức hội thảo về AI
AI: Tuyệt vời! Hội thảo dự kiến diễn ra khi nào?

User: Tháng 1 năm 2025, khoảng 150 sinh viên
AI: Được rồi. Địa điểm tổ chức ở đâu?

User: Hội trường A
AI: Tôi đã có đủ thông tin. Để tôi tạo kế hoạch:

📋 Kế hoạch đề xuất:
- Tên: Hội thảo Trí tuệ Nhân tạo 2025
- Thời gian: 15/01/2025, 8:00 - 17:00
- Địa điểm: Hội trường A
- Số người: 150 sinh viên

Chương trình:
08:00 - 08:30: Đăng ký
08:30 - 09:00: Khai mạc
09:00 - 10:30: Phiên 1 - Giới thiệu AI
...

User: Tạo kế hoạch này
AI: Đã tạo kế hoạch! Bạn có thể xem và chỉnh sửa.
```

### 3. Hỗ trợ trong khi điền form

**Kịch bản:**
```
1. Đang điền form EventPlanner
2. Gặp khó khăn ở một field
3. Mở chat sidebar
4. Hỏi AI
5. AI gợi ý
6. Áp dụng vào form
```

**Ví dụ:**
```
User: Tôi không biết viết mục đích sự kiện
AI: Mục đích sự kiện nên bao gồm:
    - Mục tiêu chính (học tập, giao lưu, ...)
    - Đối tượng hướng đến
    - Kết quả mong đợi
    
    Ví dụ: "Trang bị kiến thức cơ bản về AI 
    cho sinh viên năm 2-3, giúp các em hiểu 
    và ứng dụng AI vào thực tế"
    
    Bạn có muốn tôi tạo mục đích cho sự kiện 
    của bạn không?

User: Có
AI: [Tạo mục đích phù hợp]
```

---

## 🔧 CÁC API ENDPOINT

### 1. Tạo phiên chat
```
POST /api/v1/chat/sessions
```

**Request:**
```json
{
  "guestName": "Tên người dùng",
  "guestEmail": "email@example.com",
  "contextType": "EVENT_PLANNING"
}
```

### 2. Gửi tin nhắn
```
POST /api/v1/chat/messages
```

**Request:**
```json
{
  "sessionId": "session-id",
  "content": "Nội dung tin nhắn"
}
```

### 3. Lấy thông tin phiên chat
```
GET /api/v1/chat/sessions/{sessionId}
```

### 4. Kết thúc phiên chat
```
POST /api/v1/chat/sessions/{sessionId}/end
```

### 5. Đánh giá phiên chat
```
POST /api/v1/chat/sessions/{sessionId}/rate
```

**Request:**
```json
{
  "rating": 5,
  "feedback": "Rất hữu ích!"
}
```

### 6. Tạo kế hoạch từ chat
```
POST /api/v1/chat/sessions/{sessionId}/generate-plan
```

### 7. Lấy gợi ý trả lời nhanh
```
GET /api/v1/chat/sessions/{sessionId}/quick-replies
```

---

## 🎨 TÍCH HỢP FRONTEND

### Cài đặt thư viện

```bash
npm install sockjs-client @stomp/stompjs
```

### Sử dụng component

```tsx
import { AIChatWidget } from './components/AIChatWidget';

function App() {
  return (
    <div>
      <YourMainApp />
      <AIChatWidget />
    </div>
  );
}
```

Xem chi tiết: `FRONTEND_INTEGRATION_EXAMPLE.tsx`

---

## 🐛 XỬ LÝ LỖI

### Lỗi 1: Không kết nối được Gemini API

**Triệu chứng:** AI không trả lời hoặc trả lời "Xin lỗi, dịch vụ AI chưa được cấu hình"

**Nguyên nhân:**
- Chưa cấu hình GEMINI_API_KEY
- API key không hợp lệ
- Hết quota API

**Giải pháp:**
1. Kiểm tra file `.env`
2. Verify API key tại: https://makersuite.google.com/app/apikey
3. Kiểm tra quota

### Lỗi 2: WebSocket không kết nối

**Triệu chứng:** Tin nhắn không real-time

**Nguyên nhân:**
- CORS chưa cấu hình đúng
- WebSocket endpoint sai

**Giải pháp:**
1. Kiểm tra CORS trong `SecurityConfig.java`
2. Verify endpoint: `/ws/chat`
3. Xem console browser

### Lỗi 3: Session not found

**Triệu chứng:** Lỗi "Chat session not found"

**Nguyên nhân:**
- SessionId sai
- Session đã bị archive (24h không hoạt động)

**Giải pháp:**
1. Kiểm tra sessionId
2. Tạo session mới

---

## 📊 GIÁM SÁT

### Kiểm tra phiên chat đang hoạt động

```sql
SELECT COUNT(*) FROM chat_sessions WHERE status = 'ACTIVE';
```

### Kiểm tra số tin nhắn hôm nay

```sql
SELECT COUNT(*) FROM chat_messages 
WHERE DATE(created_at) = CURDATE();
```

### Kiểm tra đánh giá trung bình

```sql
SELECT AVG(satisfaction_rating) FROM chat_sessions 
WHERE satisfaction_rating IS NOT NULL;
```

---

## 💡 MẸO SỬ DỤNG

### 1. Chat hiệu quả với AI

**Nên:**
- Nói rõ ràng, cụ thể
- Cung cấp đầy đủ thông tin
- Trả lời từng câu hỏi của AI

**Không nên:**
- Hỏi quá chung chung
- Gửi nhiều câu hỏi cùng lúc
- Bỏ qua câu hỏi của AI

### 2. Lập kế hoạch sự kiện

**Thông tin cần có:**
- Tên sự kiện
- Chủ đề
- Thời gian (ngày, giờ)
- Địa điểm
- Số lượng người tham dự
- Mục đích

**Ví dụ tốt:**
```
"Tôi muốn tổ chức hội thảo về AI cho 150 sinh viên 
vào ngày 15/01/2025 tại Hội trường A, từ 8h đến 17h"
```

**Ví dụ chưa tốt:**
```
"Tôi muốn tổ chức sự kiện"
```

### 3. Sử dụng Quick Replies

- Click vào gợi ý nhanh thay vì gõ
- Tiết kiệm thời gian
- Giúp AI hiểu rõ hơn

---

## 📚 TÀI LIỆU THAM KHẢO

### Tài liệu chính

| Tài liệu | Mô tả |
|----------|-------|
| [README_AI_CHAT.md](./README_AI_CHAT.md) | Tài liệu đầy đủ (English) |

### Tài liệu bên ngoài

- **Gemini AI**: https://ai.google.dev/docs
- **Spring WebSocket**: https://docs.spring.io/spring-framework/reference/web/websocket.html
- **React**: https://react.dev

---

## ❓ CÂU HỎI THƯỜNG GẶP

### Q1: Tôi có thể chat mà không cần đăng nhập không?
**A:** Có! Hệ thống hỗ trợ guest chat. Chỉ cần mở chat và bắt đầu.

### Q2: AI có thể tạo kế hoạch sự kiện hoàn chỉnh không?
**A:** Có! AI sẽ hỏi thông tin cần thiết và tạo kế hoạch chi tiết bao gồm chương trình, nguồn lực, ban tổ chức.

### Q3: Lịch sử chat có được lưu không?
**A:** Có! Tất cả tin nhắn được lưu trong database. User đã đăng nhập có thể xem lại lịch sử.

### Q4: Tôi có thể chat bằng tiếng Anh không?
**A:** Hiện tại hệ thống chủ yếu hỗ trợ tiếng Việt. Multi-language sẽ được thêm trong tương lai.

### Q5: AI có thể trả lời mọi câu hỏi không?
**A:** AI được train để hỗ trợ về sự kiện IUH. Với câu hỏi ngoài phạm vi, AI sẽ hướng dẫn bạn liên hệ bộ phận phù hợp.

### Q6: Làm sao để đánh giá chất lượng chat?
**A:** Sau khi kết thúc chat, bạn có thể đánh giá từ 1-5 sao và để lại feedback.

### Q7: Chat có giới hạn số tin nhắn không?
**A:** Hiện tại chưa có giới hạn. Trong tương lai có thể có rate limiting để tránh spam.

### Q8: Tôi có thể xóa lịch sử chat không?
**A:** Hiện tại chưa hỗ trợ. Feature này sẽ được thêm trong tương lai.

---

## 📞 HỖ TRỢ

### Cần giúp đỡ?

**Tài liệu:**
- Đọc các file README
- Xem phần Troubleshooting

**Liên hệ:**
- Email: tuananh@example.com
- GitHub Issues: [Link]

### Báo lỗi

Khi báo lỗi, vui lòng cung cấp:
1. Mô tả lỗi
2. Các bước tái hiện
3. Screenshot (nếu có)
4. Log file

---

## 🎯 ROADMAP

### Q1 2025
- [ ] Streaming responses (AI trả lời từng từ)
- [ ] Voice input (Nói thay vì gõ)
- [ ] Multi-language (Tiếng Anh, Tiếng Việt)

### Q2 2025
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Personalized recommendations

### Q3 2025
- [ ] Advanced AI features
- [ ] Integration với Calendar
- [ ] Premium features

---

## ✅ CHECKLIST SỬ DỤNG

### Lần đầu sử dụng
- [ ] Cài đặt dependencies
- [ ] Cấu hình Gemini API key
- [ ] Chạy ứng dụng
- [ ] Test chat cơ bản

### Sử dụng hàng ngày
- [ ] Mở chat
- [ ] Hỏi câu hỏi
- [ ] Nhận câu trả lời
- [ ] Đánh giá (nếu muốn)

### Lập kế hoạch sự kiện
- [ ] Mở chat với context EVENT_PLANNING
- [ ] Mô tả sự kiện
- [ ] Trả lời câu hỏi của AI
- [ ] Review kế hoạch được tạo
- [ ] Tạo EventPlanner

---

## 🎉 KẾT LUẬN

AI Chat Service là công cụ mạnh mẽ giúp:
- ✅ Hỏi đáp nhanh chóng
- ✅ Lập kế hoạch sự kiện dễ dàng
- ✅ Tiết kiệm thời gian
- ✅ Nâng cao trải nghiệm người dùng

**Bắt đầu sử dụng ngay hôm nay!** 🚀

---

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: Tháng 12/2024  
**Tác giả**: Võ Công Tuấn Anh

---

**Chúc bạn sử dụng hiệu quả! 🎊**
