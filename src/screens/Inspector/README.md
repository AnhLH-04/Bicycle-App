# Inspector Module Documentation

## Tổng quan
Module Inspector được thiết kế dành cho người kiểm định xe đạp trong hệ thống marketplace. Module này cung cấp đầy đủ các chức năng để người kiểm định có thể quản lý yêu cầu kiểm định, thực hiện kiểm định, xử lý tranh chấp và theo dõi thu nhập.

## ⚠️ QUAN TRỌNG: Phân quyền truy cập

### Role-Based Access Control (RBAC)

Module Inspector **CHỈ DÀNH CHO** người dùng có role = `'inspector'`

#### Các Role trong hệ thống:
```javascript
enum UserRole {
  BUYER = 'buyer',        // Người mua
  SELLER = 'seller',      // Người bán
  INSPECTOR = 'inspector', // Người kiểm định ✅
  ADMIN = 'admin'         // Quản trị viên
}
```

#### Điều kiện truy cập:
- ✅ **Được phép:** `user.role === 'inspector'`
- ❌ **Bị chặn:** Tất cả các role khác (buyer, seller, admin)

#### Flow đăng nhập và phân quyền:

```
1. User đăng nhập → Nhận token JWT
2. Decode token → Lấy user info (bao gồm role)
3. Check role === 'inspector' ?
   ├─ YES → Cho phép truy cập Inspector module
   └─ NO  → Chuyển hướng về màn hình phù hợp với role
```

### Implement Authentication Check

Xem chi tiết trong file `INTEGRATION_GUIDE.md` và `AuthGuard.js` (đã tạo riêng)

## Cấu trúc thư mục

```
src/screens/Inspector/
├── InspectorDashboardScreen.js      # Trang chủ người kiểm định
├── InspectionRequestsScreen.js      # Danh sách yêu cầu kiểm định
├── InspectionDetailScreen.js        # Chi tiết yêu cầu kiểm định
├── PerformInspectionScreen.js       # Thực hiện kiểm định
├── InspectionHistoryScreen.js       # Lịch sử kiểm định
├── DisputeResolutionScreen.js       # Xử lý tranh chấp
├── EarningsScreen.js                # Quản lý thu nhập
└── index.js                         # Export tất cả screens
```

## Màn hình chi tiết

### 1. InspectorDashboardScreen
**Mục đích:** Màn hình tổng quan cho người kiểm định

**Tính năng:**
- Hiển thị thống kê tổng quan (yêu cầu đang chờ, hoàn thành hôm nay, thu nhập, tranh chấp)
- Quick actions (Yêu cầu mới, Tạo báo cáo, Lịch sử, Tranh chấp)
- Hoạt động gần đây
- Hiệu suất tháng này
- Thông báo

**Navigation:**
- → InspectionRequests (với filter)
- → InspectionHistory (với filter)
- → Earnings
- → DisputeResolution
- → PerformInspection

### 2. InspectionRequestsScreen
**Mục đích:** Quản lý tất cả yêu cầu kiểm định

**Tính năng:**
- Tìm kiếm yêu cầu theo ID, tên xe, người bán
- Lọc theo trạng thái (Tất cả, Chờ xử lý, Đang làm, Hoàn thành)
- Hiển thị thông tin:
  - Thông tin xe (model, brand, hình ảnh)
  - Thông tin người bán
  - Loại kiểm định (tại chỗ/online)
  - Địa chỉ (nếu tại chỗ)
  - Phí kiểm định
  - Độ ưu tiên
- Actions:
  - Chấp nhận/Từ chối yêu cầu
  - Tiếp tục kiểm định (nếu đang in-progress)
  - Xem chi tiết

**Trạng thái yêu cầu:**
- `pending`: Chờ xử lý
- `accepted`: Đã chấp nhận
- `in-progress`: Đang kiểm định
- `completed`: Hoàn thành
- `cancelled`: Đã hủy

### 3. InspectionDetailScreen
**Mục đích:** Xem chi tiết yêu cầu kiểm định

**Tính năng:**
- Hiển thị đầy đủ thông tin xe
- Thông tin người bán (tên, số điện thoại, email, đánh giá)
- Thông số kỹ thuật cần kiểm tra
- Ghi chú từ người bán
- Lịch sử kiểm định trước đó (nếu có)
- Actions:
  - Gọi điện/Nhắn tin cho người bán
  - Điều hướng đến địa chỉ (Google Maps)
  - Chấp nhận/Từ chối yêu cầu
  - Bắt đầu kiểm định

**Thông tin hiển thị:**
- Mã yêu cầu
- Loại kiểm định
- Ngày yêu cầu & Ngày mong muốn
- Địa chỉ kiểm định
- Phí kiểm định (miễn phí cho lần đầu)
- Thông số kỹ thuật xe

### 4. PerformInspectionScreen
**Mục đích:** Thực hiện quy trình kiểm định chi tiết

**Tính năng:**
- Kiểm định theo từng phần:
  1. **Khung xe (Frame)**
     - Đánh giá tình trạng (Xuất sắc/Tốt/Khá/Kém)
     - Chọn vấn đề phát hiện
     - Thêm hình ảnh
     - Ghi chú chi tiết
  
  2. **Phanh (Brake)**
     - Đánh giá hệ thống phanh
     - Vấn đề về má phanh, dầu phanh, đĩa phanh
     - Hình ảnh hệ thống phanh
     - Ghi chú
  
  3. **Bộ truyền động (Drivetrain)**
     - Đánh giá xích, líp, đùm răng
     - Kiểm tra sang số
     - Hình ảnh
     - Ghi chú
  
  4. **Bánh xe & Lốp (Wheels)**
     - Tình trạng lốp, vành, nan
     - Kiểm tra moay-ơ
     - Hình ảnh
     - Ghi chú
  
  5. **Tổng quan (Overall)**
     - Đánh giá tổng thể
     - Giá trị ước tính
     - Khuyến nghị cho người mua
     - Cấp nhãn kiểm định (có hiệu lực 30 ngày)
     - Hình ảnh tổng quan

**Lưu ý quan trọng:**
- Báo cáo kiểm định có giá trị 30 ngày
- Nếu người bán thay đổi thông tin xe trong 1 tháng → cần kiểm định lại
- Lần kiểm định đầu tiên miễn phí (cả tại chỗ và online)
- Từ lần thứ 2:
  - Tại chỗ: 200,000 VNĐ
  - Online: 150,000 VNĐ (có thể điều chỉnh)

### 5. InspectionHistoryScreen
**Mục đích:** Xem lịch sử các kiểm định đã hoàn thành

**Tính năng:**
- Tìm kiếm theo ID, tên xe, người bán
- Lọc theo thời gian (Hôm nay, Tuần này, Tháng này, Tất cả)
- Thống kê tóm tắt:
  - Tổng số kiểm định
  - Số lượng đã cấp nhãn
  - Đánh giá trung bình
  - Thu nhập
- Hiển thị:
  - Thông tin xe
  - Tình trạng tổng quan
  - Trạng thái nhãn kiểm định (còn hạn/hết hạn)
  - Lượt xem báo cáo
  - Đánh giá từ người bán
  - Phí kiểm định

**Nhãn kiểm định:**
- Icon chứng nhận màu xanh: Còn hiệu lực
- Icon chứng nhận màu đỏ: Đã hết hạn
- Hiển thị ngày hết hạn

### 6. DisputeResolutionScreen
**Mục đích:** Xử lý tranh chấp giữa người mua và người bán

**Tính năng:**
- Quản lý tranh chấp theo trạng thái:
  - Chờ xử lý
  - Đang điều tra
  - Đã giải quyết
  - Đã từ chối
- Loại tranh chấp:
  - Sai tình trạng (condition-mismatch)
  - Thiếu phụ kiện (missing-parts)
  - Tin giả mạo (fake-listing)
  - Khác (other)
- Xem bằng chứng:
  - Ảnh từ người mua
  - Báo cáo kiểm định gốc
  - So sánh sự khác biệt
- Actions:
  - Cung cấp báo cáo kiểm định làm bằng chứng
  - Ủng hộ người mua/người bán
  - Ghi chú về tranh chấp

**Quy trình xử lý:**
1. Nhận báo cáo tranh chấp từ người mua
2. Xem bằng chứng (ảnh của người mua vs báo cáo kiểm định gốc)
3. Đối chiếu tình trạng thực tế với báo cáo
4. Cung cấp nhận định chuyên môn
5. Hỗ trợ Admin đưa ra quyết định

### 7. EarningsScreen
**Mục đích:** Theo dõi thu nhập và giao dịch

**Tính năng:**
- Thống kê thu nhập:
  - Tổng thu nhập (tất cả thời gian)
  - Thu nhập tháng này
  - Thu nhập tuần này
  - Thu nhập hôm nay
- Biểu đồ thu nhập theo tháng
- Thống kê chi tiết:
  - Tổng số kiểm định
  - Số kiểm định miễn phí
  - Số kiểm định có phí
  - Thu nhập trung bình/kiểm định
- Cơ cấu phí:
  - Tại chỗ lần đầu: 0 VNĐ (miễn phí)
  - Tại chỗ thường: 200,000 VNĐ
  - Online lần đầu: 0 VNĐ (miễn phí)
  - Online thường: 150,000 VNĐ
  - Kiểm định lại: 200,000 VNĐ
  - Tư vấn tranh chấp: 100,000 VNĐ
- Giao dịch gần đây
- Số tiền đang chờ thanh toán
- Yêu cầu rút tiền

## Tích hợp API

### API Endpoints cần thiết:

```javascript
// Inspection Requests
GET    /api/inspector/requests              // Lấy danh sách yêu cầu
GET    /api/inspector/requests/:id          // Chi tiết yêu cầu
POST   /api/inspector/requests/:id/accept   // Chấp nhận yêu cầu
POST   /api/inspector/requests/:id/reject   // Từ chối yêu cầu

// Inspection Process
POST   /api/inspector/inspections           // Tạo báo cáo kiểm định
PUT    /api/inspector/inspections/:id       // Cập nhật báo cáo
POST   /api/inspector/inspections/:id/submit // Gửi báo cáo hoàn chỉnh
POST   /api/inspector/inspections/:id/photos // Upload ảnh

// History
GET    /api/inspector/history               // Lịch sử kiểm định
GET    /api/inspector/inspections/:id       // Chi tiết báo cáo

// Disputes
GET    /api/inspector/disputes               // Danh sách tranh chấp
GET    /api/inspector/disputes/:id           // Chi tiết tranh chấp
POST   /api/inspector/disputes/:id/evidence  // Cung cấp bằng chứng
POST   /api/inspector/disputes/:id/resolve   // Giải quyết tranh chấp

// Earnings
GET    /api/inspector/earnings               // Thống kê thu nhập
GET    /api/inspector/transactions           // Lịch sử giao dịch
POST   /api/inspector/withdrawal             // Yêu cầu rút tiền

// Profile
GET    /api/inspector/profile                // Thông tin inspector
PUT    /api/inspector/profile                // Cập nhật thông tin
GET    /api/inspector/statistics             // Thống kê tổng quan
```

## Navigation Flow

```
InspectorDashboard
├── InspectionRequests
│   ├── InspectionDetail
│   │   └── PerformInspection
│   └── PerformInspection
├── InspectionHistory
│   └── InspectionReport (xem báo cáo đã gửi)
├── DisputeResolution
│   └── DisputeDetail
└── Earnings
    └── TransactionHistory
```

## Quy tắc nghiệp vụ quan trọng

### 1. Phí kiểm định
- **Lần đầu tiên:** MIỄN PHÍ (cả tại chỗ và online)
- **Từ lần thứ 2:**
  - Tại chỗ: 200,000 VNĐ/lần
  - Online: 150,000 VNĐ/lần (có thể cấu hình)
- **Kiểm định lại:** 200,000 VNĐ (nếu thay đổi trong vòng 1 tháng)
- **Tư vấn tranh chấp:** 100,000 VNĐ

### 2. Nhãn kiểm định
- Có hiệu lực: **30 ngày**
- Nếu người bán thay đổi thông tin xe trong vòng 30 ngày → Cần kiểm định lại
- Nhãn hết hạn → Không thể nhận đặt cọc

### 3. Cơ chế thanh toán
- Sử dụng **ví điện tử** trong hệ thống
- Tiền được giữ trong hệ thống cho đến khi inspector rút
- Inspector có thể yêu cầu rút tiền bất kỳ lúc nào

### 4. Xử lý tranh chấp
- Inspector cung cấp **bằng chứng kỹ thuật**
- Báo cáo kiểm định gốc là căn cứ chính
- Hỗ trợ Admin đưa ra quyết định cuối cùng
- Không có quyền quyết định, chỉ cung cấp chuyên môn

### 5. Đánh giá
- Người bán đánh giá inspector sau mỗi lần kiểm định
- Đánh giá ảnh hưởng đến uy tín và thứ tự nhận việc
- Đánh giá trung bình hiển thị trên profile

## Cấu hình màu sắc

```javascript
import { COLORS } from '../../constants/colors';

// Sử dụng trong code
COLORS.primary    // Màu chính
COLORS.success    // Màu thành công (xanh lá)
COLORS.error      // Màu lỗi (đỏ)
COLORS.warning    // Màu cảnh báo (vàng)
COLORS.info       // Màu thông tin (xanh dương)
COLORS.dark       // Màu tối
COLORS.gray       // Màu xám
COLORS.lightGray  // Màu xám nhạt
COLORS.white      // Màu trắng
COLORS.border     // Màu viền
```

## Thư viện cần thiết

```json
{
  "dependencies": {
    "react-native-vector-icons": "^10.0.0",
    "react-native-image-picker": "^5.0.0"
  }
}
```

## Lưu ý khi tích hợp

1. **⚠️ Authentication & Authorization (QUAN TRỌNG):**
   - Module này **CHỈ DÀNH CHO role = 'inspector'**
   - Phải implement role checking trước khi cho phép truy cập
   - Token JWT phải chứa thông tin role
   - Backend phải validate role cho mọi API call
   - **Xem chi tiết:** [RBAC_GUIDE.md](./RBAC_GUIDE.md)
   
   **Quick Check:**
   ```javascript
   if (user.role !== 'inspector') {
     // Block access
   }
   ```

2. **Image Upload:**
   - Nén ảnh trước khi upload (quality: 0.8)
   - Giới hạn kích thước ảnh
   - Cho phép upload nhiều ảnh

3. **Real-time Updates:**
   - Cân nhắc sử dụng WebSocket hoặc Firebase cho thông báo real-time
   - Push notification cho yêu cầu mới

4. **Offline Support:**
   - Cache dữ liệu cơ bản
   - Cho phép lưu draft báo cáo kiểm định

5. **Error Handling:**
   - Xử lý lỗi network
   - Retry mechanism cho API calls
   - User-friendly error messages

## Testing Checklist

- [ ] Kiểm tra flow chấp nhận/từ chối yêu cầu
- [ ] Kiểm tra upload ảnh
- [ ] Kiểm tra submit báo cáo kiểm định
- [ ] Kiểm tra tính toán phí chính xác
- [ ] Kiểm tra filter và search
- [ ] Kiểm tra navigation giữa các screens
- [ ] Kiểm tra hiển thị trên các kích thước màn hình
- [ ] Kiểm tra xử lý tranh chấp
- [ ] Kiểm tra thống kê thu nhập

## Roadmap

### Phase 1 (Current)
- ✅ All 7 core screens implemented
- ✅ Basic UI/UX completed
- ✅ Mock data structure defined

### Phase 2 (Next)
- [ ] API integration
- [ ] Image upload functionality
- [ ] Real-time notifications
- [ ] Authentication

### Phase 3 (Future)
- [ ] Offline mode
- [ ] Report PDF generation
- [ ] Advanced analytics
- [ ] QR code scanning for bike verification

## 🔒 Security & Access Control

**QUAN TRỌNG:** Module Inspector sử dụng Role-Based Access Control (RBAC)

### Files liên quan đến phân quyền:
- `src/context/AuthContext.js` - Authentication context
- `src/components/common/AuthGuard.js` - Route protection component
- `RBAC_GUIDE.md` - Hướng dẫn chi tiết về RBAC

### Quick Implementation:
```javascript
// 1. Wrap app với AuthProvider
<AuthProvider>
  <App />
</AuthProvider>

// 2. Bảo vệ Inspector routes
<AuthGuard requiredRole="inspector">
  <InspectorNavigator />
</AuthGuard>

// 3. Ẩn tab Inspector cho non-inspectors
{isInspector && <Tab.Screen name="Inspector" />}
```

**Đọc kỹ [RBAC_GUIDE.md](./RBAC_GUIDE.md) để implement đúng cách!**

## Support & Contact

Để biết thêm chi tiết hoặc hỗ trợ, vui lòng liên hệ team development.
