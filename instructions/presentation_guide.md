# Cẩm Nang Thuyết Trình Coding Challenge — Employee & Task Management

Tài liệu này được thiết kế để giúp bạn tự tin trình bày giải pháp của mình trước hội đồng phỏng vấn (thường gồm Tech Lead, Senior Engineer và Engineering Manager). 

Tài liệu bao gồm 4 phần:
1. **Slide Deck Outline (Marp/Markdown format)**: Dàn bài slide chuyên nghiệp có thể copy-paste trực tiếp.
2. **Speaker Script (Kịch bản nói chi tiết)**: Hướng dẫn bạn nên tập trung nói gì ở mỗi slide để thể hiện tư duy kỹ thuật tốt nhất.
3. **Live Demo Strategy (Kịch bản Demo trực tiếp)**: Cách trình bày sản phẩm trực quan và thuyết phục nhất.
4. **Q&A Prep (Bộ câu hỏi & câu trả lời tiềm năng)**: Cách giải thích các lựa chọn công nghệ và đánh đổi (trade-offs).

---

# Phần 1: Dàn Bài Slide (Slide Deck Outline)

Bạn có thể copy nội dung dưới đây và dán vào [Marp](https://marp.app/) hoặc chuyển đổi sang Google Slides/PowerPoint.

```markdown
---
marp: true
theme: gaia
_class: lead
paginate: true
backgroundColor: #171717
color: #fafafa
style: |
  section {
    font-family: 'Geist Sans', Helvetica, Arial, sans-serif;
    padding: 40px;
  }
  h1 {
    color: #006bff;
  }
  h2 {
    color: #48aeff;
  }
  footer {
    color: #8f8f8f;
  }
---

# Employee & Task Management System
### Presentation of Coding Challenge Solution
**Presenter:** [Tên của bạn]
**Role Applied:** Software Engineer

---

## 1. Project Overview & Scope

- **Goal:** Build a secure, scalable, and responsive Employee and Task Management system.
- **Dual-Role Workflow:**
  - **Owner (Manager):** Full control over team, task assignment, progress tracking, and direct chat.
  - **Employee:** Setup account via invite link, manage own tasks, update status, and chat with Owner.
- **Key Focus Areas:**
  - Robust authentication (SMS OTP & Email OTP/Password).
  - Real-time synchronization for task updates & messaging.
  - Performance (Server-side search/pagination, debounce).
  - Production-ready security and clean architecture.

---

## 2. Technology Stack & Rationale

| Layer | Technology | Why we chose it? |
|---|---|---|
| **Frontend** | **Next.js 16 + React 19** | App Router, Server/Client components, speed, SEO-ready. |
| **Backend** | **Express.js + TypeScript** | Flexible, lightweight wrapper for business logic and third-party integrations. |
| **Database** | **Firebase Firestore** | Scalable NoSQL document store, robust querying. |
| **Real-time**| **Socket.io** | Reliable bi-directional event-driven communication. |
| **Integrations**| **Twilio & SendGrid** | Industry standards for SMS & Email delivery. |
| **Styling** | **Tailwind CSS 4** | Rapid UI development, utility-first, modern design. |

---

## 3. System Architecture

```
┌─────────────────────────┐               REST API (JWT)               ┌─────────────────────────┐
│       Next.js FE        │ <────────────────────────────────────────> │     Express Backend     │
│       (Port 3000)       │            Socket.io (Real-time)           │       (Port 5000)       │
└─────────────────────────┘                                            └────────────┬────────────┘
                                                                                    │
                                                                                    ▼
                                                                       ┌─────────────────────────┐
                                                                       │   Firebase Firestore    │
                                                                       └─────────────────────────┘
```

- **Separation of Concerns:** FE interacts only with Express Backend, keeping Firestore rules simple and database credentials fully secured on the server.
- **Module-Based Directory Structure:** Organized by feature domain (`auth`, `owner`, `employee`, `chat`) for high maintainability.

---

## 4. Database Schema Design (Firestore)

- **`users` (Collection):**
  - Schema: `{ id, role, email, phone, name, department, status, workSchedule, isSetup, passwordHash }`
- **`tasks` (Collection):**
  - Schema: `{ id, title, description, assignedTo, assignedToName, dueDate, priority, status, createdAt }`
- **`chat_rooms` & `messages` (Collections):**
  - Room ID format: `ownerPhone_employeeId`
  - Message schema: `{ id, senderId, text, timestamp }`
- **`access_codes` & `tokens` (Collections):**
  - OTP verification codes and employee invite tokens with expiration validation.

---

## 5. Security & Onboarding Flow

- **Dual-role Authentication:**
  - **Owner:** Passwordless login via SMS OTP (Twilio).
  - **Employee:** Two-factor flexibility (Email OTP via SendGrid OR Username/Password).
- **Secure Onboarding:**
  - Owner creates Employee -> System generates secure `inviteToken` -> Sends email with `/setup-account?token=...`
  - Token is validated, Employee sets password (hashed with `bcrypt`), updates status to `Active`.
- **API Guarding:**
  - JWT middleware (`authenticateToken`) inspects role permissions (`requireOwner` / `requireEmployee`).
  - Rate limiter, CORS whitelist, and Helmet security headers enabled.

---

## 6. Real-time Sync & Chat Mechanics

- **Task Synchronization:**
  - Instead of long polling, the client establishes a Socket.io connection.
  - When an Employee updates status or Owner creates/deletes a task:
    - Backend broadcasts `task_updated` to the room.
    - Frontend intercepts and triggers React Query cache invalidation (`invalidateQueries`).
- **1-on-1 Real-time Chat:**
  - Scope-isolated rooms using combined IDs.
  - Interactive UX: Typing indicators, chat history scroll behavior, and active status tracking.

---

## 7. Performance & Code Quality Highlights

- **Server-Side Search & Pagination:**
  - Custom Paginated Query utility for Firestore.
  - Debounced search input (300ms) on frontend to prevent database query spam.
- **Robust Validation:**
  - Frontend: **React Hook Form + Zod** (client-side validation & type inference).
  - Backend: **Joi schemas** enforcing schema integrity on API boundaries.
- **Error Handling:**
  - Custom `AppError` class with HTTP status codes.
  - Unified express error handler middleware to avoid leaking stack traces.
- **Type Safety:**
  - End-to-end TypeScript preventing runtime type mismatch.

---

## 8. Verification & Testing

- **Backend Integration Tests:**
  - Built using Jest.
  - Covers API endpoints, health check, SMS sending (mocked/test mode), and Email notifications.
- **Manual Verification:**
  - Edge cases checked: OTP resend throttling, invalid invite tokens, unauthorized API access attempts.
- **Developer Bypass:**
  - Hardcoded test OTP `123456` enabled exclusively in non-production environments for faster developer/QA workflow.

---

## 9. Key Engineering Trade-offs

1. **Express Wrapper vs. Direct Firebase Client:**
   - *Trade-off:* Added network hop, but allows server-side schema validation (Joi), JWT management, secure integrations (Twilio/SendGrid), and avoids exposing Firebase API keys to client code.
2. **REST API + Sockets vs. Firebase Real-time Listeners:**
   - *Trade-off:* Used REST for write commands and Socket.io for notifications. This significantly reduces Firestore read costs compared to keeping persistent document listeners active for every client page.
3. **NoSQL vs. Relational Database:**
   - *Trade-off:* Firebase Firestore chosen for rapid prototyping, horizontal scaling, and flexible document model, though it requires client-side joins for user details in tasks.

---

## 10. Summary & Future Enhancements

- **Delivered Solution:** A complete, production-ready, fully responsive system compliant with all specifications and styled with premium Geist-like aesthetics.
- **Future Roadmap:**
  - Implement full Role-Based Access Control (RBAC) with multiple managers.
  - Add task attachments (Cloud Storage).
  - Implement Push Notifications (Firebase Cloud Messaging) for mobile devices.
  - CI/CD automation and load testing for WebSockets.
```

---

# Phần 2: Kịch Bản Thuyết Trình (Speaker Script)

Dưới đây là kịch bản chi tiết bằng tiếng Việt (kèm các thuật ngữ tiếng Anh thông dụng) giúp bạn diễn đạt tự tin:

### Slide 1: Welcome & Giới thiệu
*   **Nội dung cần nói:**
    > "Chào mọi người, tôi rất vui được trình bày giải pháp của mình cho bài Coding Challenge thiết kế **Hệ thống Quản lý Nhân sự và Công việc (Employee & Task Management)**. Dự án này được thiết kế với mục tiêu xây dựng một ứng dụng hoàn thiện, bảo mật, có tính năng cập nhật thời gian thực (real-time) và trải nghiệm người dùng mượt mà."

### Slide 2: Project Overview & Scope (Tổng quan dự án)
*   **Nội dung cần nói:**
    > "Hệ thống phân chia rõ ràng hai vai trò: **Owner (Manager)** quản lý dự án, giao việc, theo dõi tiến độ và chat với nhân viên; và **Employee (Nhân viên)** tiếp nhận công việc, cập nhật trạng thái và phản hồi trực tiếp với quản lý. 
    >
    > Khi thiết kế hệ thống này, tôi tập trung vào 4 yếu tố cốt lõi: Bảo mật phân quyền, Trải nghiệm Real-time (sử dụng WebSockets), Tối ưu hiệu năng (thông qua Search/Pagination ở phía Server và Debouncing ở Client), và cuối cùng là một giao diện trực quan, hiện đại."

### Slide 3: Technology Stack & Rationale (Lý do chọn Tech Stack)
*   **Nội dung cần nói:**
    > "Về mặt công nghệ, tôi sử dụng:
    > *   **Next.js 16 & React 19** cho Frontend: Giúp tối ưu hóa tốc độ tải trang, tận dụng các tiến bộ mới nhất của React và tổ chức thư mục theo dạng module rất dễ mở rộng.
    > *   **Express.js + TypeScript** ở Backend: Làm nhiệm vụ xử lý logic nghiệp vụ, quản lý phiên làm việc bằng JWT và làm trung gian bảo mật.
    > *   **Firebase Firestore**: Là NoSQL database linh hoạt, hỗ trợ lưu trữ phi cấu trúc và scale tốt.
    > *   **Socket.io**: Để đồng bộ hóa trạng thái công việc và chat trực tuyến mà không cần reload trang.
    > *   **Twilio & SendGrid**: Đảm bảo dịch vụ SMS OTP và gửi mail mời nhận việc (onboarding) hoạt động đáng tin cậy."

### Slide 4: System Architecture (Kiến trúc hệ thống)
*   **Nội dung cần nói:**
    > "Nhìn vào sơ đồ kiến trúc, điểm mấu chốt ở đây là **sự tách biệt hoàn toàn giữa Client và Database**. Frontend của Next.js không kết nối trực tiếp đến Firestore. Thay vào đó, mọi luồng dữ liệu đều đi qua **Express Backend**.
    > 
    > Điều này mang lại lợi ích lớn về bảo mật: Chúng ta bảo vệ được các private key của các bên thứ ba (như Twilio, SendGrid, Firebase Admin SDK) và dễ dàng viết middleware kiểm tra quyền hạn (Role-based Authorization) trước khi thực hiện bất kỳ câu truy vấn nào."

### Slide 5: Database Schema Design (Thiết kế Database)
*   **Nội dung cần nói:**
    > "Về phần database, vì Firestore là NoSQL, tôi thiết kế cấu trúc phẳng và phi bình thường hóa (denormalization) ở một số điểm để tăng tốc độ đọc.
    > *   Bảng `users` lưu giữ thông tin nhân viên, mật khẩu đã mã hóa bằng `bcrypt`, và các cờ trạng thái như `isSetup` để quản lý quy trình đăng ký.
    > *   Bảng `tasks` lưu thông tin công việc, có tham chiếu đến ID nhân viên (`assignedTo`) và lưu sẵn tên của nhân viên (`assignedToName`) để tránh việc phải thực hiện câu lệnh join phức tạp khi hiển thị danh sách.
    > *   Phần chat được chia thành `chat_rooms` với room ID duy nhất được ghép từ số điện thoại Owner và ID nhân viên, giúp cô lập dữ liệu trò chuyện giữa các cặp người dùng."

### Slide 6: Security & Onboarding Flow (Bảo mật & Quy trình Onboarding)
*   **Nội dung cần nói:**
    > "Tôi đặc biệt chú trọng vào quy trình đăng ký tài khoản nhân viên (Onboarding). Quy trình diễn ra như sau:
    > 1. Owner tạo tài khoản nhân viên mới trên dashboard.
    > 2. Hệ thống tạo một mã token mời (`inviteToken`) có thời hạn và gửi email thông qua SendGrid.
    > 3. Nhân viên nhấn vào link, hệ thống kiểm tra token hợp lệ và cho phép họ tự tạo mật khẩu để kích hoạt tài khoản.
    > 
    > Toàn bộ các API nhạy cảm đều được bảo vệ bằng JWT middleware. Mật khẩu được hash bằng `bcrypt` và các mã OTP/Token nhạy cảm không bao giờ được trả về phía Client dưới dạng text thường."

### Slide 7: Real-time Sync & Chat (Đồng bộ thời gian thực & Chat)
*   **Nội dung cần nói:**
    > "Tính năng real-time được triển khai bằng **Socket.io**. Khi nhân viên cập nhật một Task sang trạng thái 'Done', Backend sẽ phát (emit) một event `task_updated`. 
    > 
    > Ở Frontend, thay vì viết các hàm cập nhật state cục bộ phức tạp dễ gây bất đồng bộ dữ liệu, tôi kết hợp Socket.io với **TanStack Query**. Khi nhận được tín hiệu thay đổi qua socket, React Query sẽ tự động đánh dấu cache là cũ (invalidate) và fetch lại dữ liệu mới nhất. Điều này đảm bảo tính nhất quán (data consistency) tuyệt đối giữa các tab trình duyệt của Owner và Employee."

### Slide 8: Performance & Code Quality (Hiệu năng & Chất lượng code)
*   **Nội dung cần nói:**
    > "Để đảm bảo ứng dụng chạy mượt mà ngay cả khi dữ liệu lớn:
    > *   Tôi viết các hàm phân trang (pagination) và tìm kiếm (search) xử lý trực tiếp ở server Firestore, giúp giảm băng thông truyền tải.
    > *   Sử dụng **debouncing 300ms** tại thanh tìm kiếm để tránh việc gửi yêu cầu API liên tục khi người dùng đang gõ phím.
    > *   Kiểm soát tính hợp lệ dữ liệu chặt chẽ ở 2 đầu: **Zod** ở Client giúp hiển thị lỗi form nhanh chóng, và **Joi** ở Server để chặn các request cố tình vượt qua lớp filter của Client.
    > *   Mã nguồn sử dụng TypeScript hoàn toàn để phát hiện sớm các lỗi type ngay trong lúc code."

### Slide 9: Trade-offs (Sự đánh đổi trong thiết kế)
*   **Nội dung cần nói:**
    > "Trong quá trình xây dựng, tôi đã thực hiện một số đánh đổi quan trọng:
    > 1. **Dùng Express Wrapper thay vì gọi trực tiếp Firestore SDK ở Frontend**: Nó làm tăng thêm một chút latency do thêm một network hop, nhưng đảm bảo tính bảo mật tuyệt đối cho cơ sở dữ liệu và cho phép tích hợp các dịch vụ bên thứ ba (như Twilio SMS) an toàn.
    > 2. **Sử dụng REST API cho các tác vụ ghi và Socket.io cho thông báo thay đổi**: Cách này giúp tiết kiệm tối đa chi phí đọc/ghi (read/write operations) của Firestore. Nếu lắng nghe trực tiếp từ Firestore qua `onSnapshot` cho mọi danh sách, chi phí Firebase sẽ tăng vọt khi số lượng người dùng đồng thời lớn.
    > 3. **NoSQL database**: Phải chấp nhận tự xử lý việc toàn vẹn tham chiếu (referential integrity) bằng code ứng dụng thay vì có sẵn các ràng buộc khóa ngoại (foreign key constraints) như SQL."

### Slide 10: Summary (Tổng kết)
*   **Nội dung cần nói:**
    > "Tóm lại, giải pháp này không chỉ đáp ứng đầy đủ yêu cầu nghiệp vụ của đề bài mà còn hướng tới tiêu chuẩn của một sản phẩm production thực tế từ cấu trúc thư mục, bảo mật đến tối ưu hóa trải nghiệm người dùng. 
    > 
    > Trong tương lai, hệ thống có thể nâng cấp thêm tính năng phân quyền nhiều cấp (RBAC), tải lên tệp đính kèm (Cloud Storage) và thông báo đẩy (Push Notifications) trên thiết bị di động. Cảm ơn mọi người đã lắng nghe, tôi xin phép bắt đầu phần Live Demo sản phẩm."

---

# Phần 3: Chiến Lược Demo Trực Tiếp (Live Demo Strategy)

Để có một buổi demo thuyết phục nhất, bạn nên mở **hai cửa sổ trình duyệt song song (Side-by-Side)**:
*   **Cửa sổ bên trái**: Đăng nhập với vai trò **Owner** (sử dụng giả lập OTP bằng mã code bypass `123456`).
*   **Cửa sổ bên phải**: Đăng nhập với vai trò **Employee** (hoặc mở trang Đăng ký tài khoản từ link email).

### Các bước thực hiện Demo từng bước (Step-by-Step Walkthrough):

1.  **Bước 1: Giới thiệu giao diện & Đăng nhập (Owner)**
    *   Show màn hình đăng nhập của Owner. Nhập số điện thoại -> nhận OTP (sử dụng mã bypass `123456` ở chế độ dev).
    *   Trình bày giao diện Dashboard của Owner: các biểu đồ thống kê, animation mượt mà (Framer Motion), loading skeleton sang trọng.
2.  **Bước 2: Quy trình Onboarding Nhân viên mới**
    *   Trên giao diện Owner, nhấn nút **Add Employee**. Nhập thông tin (sử dụng một email thật của bạn để demo nhận mail, hoặc giải thích cơ chế gửi mail tự động qua SendGrid).
    *   Mở hòm thư email của bạn lên (hoặc show file log/database chứa `inviteToken` nếu không có mạng/mail thật).
    *   Mở cửa sổ ẩn danh mới, paste link setup tài khoản: `/setup-account?token=...`.
    *   Tạo username/password cho nhân viên mới đó.
3.  **Bước 3: Đăng nhập Nhân viên (Employee) & Giao việc**
    *   Đăng nhập tài khoản nhân viên vừa tạo ở cửa sổ bên phải.
    *   Trình bày giao diện Dashboard của nhân viên: Chỉ nhìn thấy công việc của chính mình, các trường thông tin phòng ban bị khóa read-only.
4.  **Bước 4: Trình diễn tính năng Real-time Task Sync (Điểm cộng lớn)**
    *   Đặt hai cửa sổ Owner (trái) và Employee (phải) cạnh nhau.
    *   Ở cửa sổ Owner: Tạo một Task mới và gán cho Employee này. 
    *   **Điểm nhấn**: Cho hội đồng xem màn hình Employee cập nhật ngay lập tức mà không cần F5!
    *   Ở cửa sổ Employee: Đổi trạng thái Task từ *Pending* sang *In Progress* rồi sang *Done*.
    *   **Điểm nhấn**: Dashboard của Owner bên trái tự động nhảy số thống kê và cập nhật trạng thái Task theo thời gian thực.
5.  **Bước 5: Trình diễn Real-time Chat**
    *   Mở tab Chat ở cả hai bên.
    *   Gõ thử tin nhắn ở bên Owner -> bên Employee nhận ngay lập tức.
    *   Gõ ở bên Employee -> bên Owner nhận ngay lập tức, show được cả hiệu ứng **typing indicator** (đang gõ...).

---

# Phần 4: Bộ Câu Hỏi Phản Biện & Cách Trả Lời (Q&A Prep)

Dưới đây là những câu hỏi hóc búa nhất mà các Tech Lead thường hỏi khi thấy kiến trúc này, cùng với câu trả lời giúp bạn ghi điểm:

#### 💬 Câu hỏi 1: "Tại sao bạn lại dùng Express làm wrapper cho Firebase Firestore mà không gọi trực tiếp Firestore SDK ở Frontend Next.js? Next.js cũng có Server Actions mà?"
*   **Cách trả lời chiến thuật**:
    > "Dạ, có 3 lý do chính em lựa chọn mô hình Express wrapper:
    > 1.  **Security**: Nếu gọi trực tiếp Firestore từ Frontend, ta phải phơi bày cấu hình Firebase ra Client. Mặc dù Firestore có Security Rules, nhưng viết các luật phân quyền phức tạp (như kiểm tra JWT OTP của bên thứ ba, phân quyền đa lớp) trên Firestore rules rất khó bảo trì và dễ sai sót. Việc đưa qua Express giúp ẩn toàn bộ cơ sở dữ liệu sau một lớp API chuẩn.
    > 2.  **Decoupling (Lỏng lẻo trong liên kết)**: Em muốn tách biệt Frontend và Database. Nếu sau này doanh nghiệp muốn chuyển từ Firestore sang MongoDB hay PostgreSQL, em chỉ cần sửa code ở tầng Service của Backend Express, hoàn toàn không phải thay đổi cấu trúc gọi API hay cài đặt SDK mới ở Frontend.
    > 3.  **Third-party integration**: Các logic như gửi SMS OTP qua Twilio, gửi mail qua SendGrid đòi hỏi phải gọi các secret key an toàn ở môi trường server-side. Express quản lý việc này tập trung và hiệu quả hơn."

#### 💬 Câu hỏi 2: "Cơ chế Real-time giữa WebSockets (Socket.io) và Firestore được đồng bộ như thế nào? Nếu Server Backend bị sập/khởi động lại thì kết nối socket và dữ liệu chat có bị mất không?"
*   **Cách trả lời chiến thuật**:
    > "Dạ, hệ thống của em giải quyết vấn đề này rất bền vững (resilient):
    > 1.  **Dữ liệu không bao giờ mất**: Trước khi server Express broadcast (phát) tin nhắn qua socket tới phòng chat, tin nhắn đó đã được ghi thành công vào Firestore database (`await messageRef.add(...)`). Socket.io chỉ đóng vai trò là kênh truyền tải tín hiệu (transport layer) thời gian thực.
    > 2.  **Khả năng tự kết nối lại (Auto-reconnect)**: Socket.io-client ở Frontend được cấu hình tự động kết nối lại khi mất tín hiệu. Khi server Express online trở lại, Client sẽ tự động join lại room dựa trên thông tin session hiện tại.
    > 3.  **Khôi phục lịch sử**: Khi người dùng mở hộp chat, Frontend sẽ gọi một API REST `GET /chat/:roomId/messages` để lấy lịch sử tin nhắn cũ từ Firestore lên trước, rồi mới nối tiếp các tin nhắn mới nhận được qua Socket. Điều này đảm bảo trải nghiệm liền mạch."

#### 💬 Câu hỏi 3: "Làm thế nào để bạn đảm bảo an toàn cho cơ chế OTP? Đề phòng trường hợp hacker brute-force mã OTP 6 số?"
*   **Cách trả lời chiến thuật**:
    > "Em đã áp dụng các biện pháp bảo mật nhiều lớp (defense-in-depth) cho luồng OTP:
    > 1.  **Rate Limiting**: Sử dụng thư viện `express-rate-limit` để giới hạn tần suất gửi yêu cầu tạo mã OTP (ví dụ tối đa 3 lần gửi OTP trong vòng 5 phút) để tránh spam cước phí Twilio/SendGrid.
    > 2.  **Giới hạn số lần thử (Max Attempts) & Thời gian hết hạn (TTL)**: Mỗi mã OTP được lưu kèm thời gian hết hạn (TTL là 5 phút) và số lần nhập sai tối đa (ví dụ nhập sai quá 5 lần thì mã OTP đó sẽ bị hủy ngay lập tức trên Firestore). Điều này ngăn chặn hoàn toàn tấn công brute-force.
    > 3.  **Khóa OTP dùng một lần (One-Time Use)**: Ngay sau khi xác thực OTP thành công, mã đó sẽ bị xóa khỏi cơ sở dữ liệu để tránh replay attack."

#### 💬 Câu hỏi 4: "Bạn xử lý vấn đề N+1 query hoặc chi phí đọc dữ liệu (Read costs) của Firestore như thế nào trong danh sách Tasks, khi mà mỗi Task cần hiển thị tên nhân viên được giao việc?"
*   **Cách trả lời chiến thuật**:
    > "Trong Firestore (NoSQL), không có phép lệnh JOIN như SQL. Nếu với mỗi task ta lại query thêm một lần vào collection `users` để lấy tên nhân viên, ta sẽ gặp vấn đề N+1 query và làm tăng chi phí Firestore Read vọt lên.
    > 
    > Để giải quyết, em áp dụng kỹ thuật **Denormalization (Phi bình thường hóa)**: Khi Owner tạo hoặc cập nhật task, ngoài việc lưu `assignedTo` (User ID), em lưu kèm luôn `assignedToName` (Tên nhân viên) trực tiếp vào tài liệu (document) của Task đó. Nhờ vậy, khi lấy danh sách Tasks, hệ thống chỉ cần thực hiện đúng 1 truy vấn duy nhất để hiển thị đầy đủ thông tin mà không cần join.
    > 
    > *Đánh đổi*: Nếu nhân viên đổi tên trong trang Profile, ta sẽ cần chạy một background job (hoặc transaction) để cập nhật lại `assignedToName` trong các task liên quan. Nhưng tần suất nhân viên đổi tên là rất thấp so với tần suất đọc danh sách công việc, nên đây là một sự đánh đổi hoàn toàn xứng đáng."

#### 💬 Câu hỏi 5: "Nếu số lượng người dùng chat đồng thời tăng lên hàng triệu người, Socket.io chạy trên 1 server đơn lẻ sẽ bị quá tải (bottleneck). Bạn sẽ scale hệ thống Socket.io này theo chiều ngang (horizontal scaling) như thế nào?"
*   **Cách trả lời chiến thuật**:
    > "Dạ, khi cần scale Socket.io ra nhiều server (multiple instances) nằm sau một Load Balancer, vấn đề lớn nhất là các Client kết nối ở các server khác nhau sẽ không thể nhận được tin nhắn của nhau.
    > 
    > Giải pháp chuẩn công nghiệp là sử dụng **Socket.io Redis Adapter**. 
    > Khi đó, các server Express Backend sẽ kết nối chung đến một cụm Redis làm kênh Pub/Sub. Khi một client gửi tin nhắn đến Server A, Server A sẽ gửi tin nhắn đó vào kênh Redis. Redis sẽ broadcast tin nhắn đến tất cả các server khác (Server B, C,...) để các server đó truyền tiếp xuống các Client đang kết nối tương ứng. 
    > Đồng thời, ta cần bật chế độ **Session Sticky** trên Load Balancer (ví dụ Nginx hoặc AWS ALB) để đảm bảo các gói HTTP handshake ban đầu của cùng một client luôn đi tới đúng server mà client đó đang kết nối."
