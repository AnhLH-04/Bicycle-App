# API Integration Guide

## Đã tích hợp thành công các API sau:

### 1. Authentication APIs

#### Register (POST /api/v1/auth/register)
- **Màn hình**: `RegisterScreen.js`
- **Chức năng**: Đăng ký tài khoản mới
- **Input**: 
  ```json
  {
    "email": "string",
    "phone": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "buyer"
  }
  ```
- **Xử lý**:
  - Validate form (email format, phone format, password length)
  - Gọi API register
  - Lưu `accessToken` và `user data` vào AsyncStorage
  - Navigate to Main screen

#### Sign In (POST /api/v1/auth/signin)
- **Màn hình**: `LoginScreen.js`
- **Chức năng**: Đăng nhập
- **Input**: 
  ```json
  {
    "email": "string",  // hoặc "phone": "string"
    "password": "string"
  }
  ```
- **Xử lý**:
  - Tự động detect email hoặc phone (check '@')
  - Gọi API signin
  - Lưu `accessToken` và `user data` vào AsyncStorage
  - Navigate to Main screen

#### Get Profile (GET /api/v1/auth/profile)
- **Màn hình**: `ProfileScreen.js`
- **Chức năng**: Lấy thông tin user
- **Headers**: `Authorization: Bearer {accessToken}`
- **Xử lý**:
  - Fetch profile khi vào màn hình
  - Hiển thị thông tin: name, email, phone, reputation stats
  - Nếu lỗi, fallback sang cached data

#### Sign Out (POST /api/v1/auth/signout)
- **Màn hình**: `ProfileScreen.js`
- **Chức năng**: Đăng xuất
- **Headers**: `Authorization: Bearer {accessToken}`
- **Xử lý**:
  - Gọi API signout
  - Xóa token và user data khỏi AsyncStorage
  - Navigate to Welcome screen

---

## Cấu trúc Files

```
src/
├── config/
│   └── api.config.js          # API configuration (BASE_URL)
├── services/
│   └── api.js                 # AuthAPI service với tất cả methods
└── screens/
    ├── Auth/
    │   ├── RegisterScreen.js  # Đăng ký + validation
    │   └── LoginScreen.js     # Đăng nhập
    └── Profile/
        └── ProfileScreen.js   # Profile + logout
```

---

## Cách sử dụng

### 1. Đổi API URL
Mở file `src/config/api.config.js`:
```javascript
export const API_CONFIG = {
    BASE_URL: 'http://YOUR_IP:3000/api/v1',  // Đổi thành IP backend của bạn
};
```

### 2. Test trên máy thật
Nếu test trên điện thoại thật:
- Đổi `localhost` thành IP máy tính (VD: `192.168.1.100`)
- Đảm bảo backend đang chạy
- Điện thoại và máy tính cùng mạng WiFi

### 3. Sử dụng AuthAPI trong code

```javascript
import AuthAPI from '../services/api';

// Register
const response = await AuthAPI.register({
    email: 'user@email.com',
    phone: '0123456789',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'buyer'
});

// Sign In
const response = await AuthAPI.signIn({
    email: 'user@email.com',  // hoặc phone: '0123456789'
    password: 'password123'
});

// Get Profile
const response = await AuthAPI.getProfile();

// Sign Out
await AuthAPI.signOut();

// Check if logged in
const isLoggedIn = await AuthAPI.isLoggedIn();
```

---

## AsyncStorage Keys

App lưu trữ:
- `accessToken`: JWT token từ backend
- `userData`: Thông tin user (JSON string)

---

## Features đã implement

### ✅ RegisterScreen
- Form validation đầy đủ
- Loading state
- Error handling
- Auto-save token sau khi đăng ký thành công

### ✅ LoginScreen  
- Hỗ trợ login bằng email HOẶC phone
- Show/hide password
- Loading state
- Error handling

### ✅ ProfileScreen
- Fetch user data từ API
- Hiển thị reputation stats (sold, bought, reviews)
- Loading state + cached data fallback
- Logout với confirmation dialog

---

## Validation Rules

### Email
- Format: `example@domain.com`
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Phone (Vietnam)
- Format: `0xxxxxxxxx` (10 số)
- Đầu số: 03, 05, 07, 08, 09
- Regex: `/^(0[3|5|7|8|9])+([0-9]{8})$/`

### Password
- Minimum 6 ký tự

---

## Error Handling

Tất cả API calls đều có try-catch:
- Hiển thị Alert với error message
- LoginScreen: fallback to cached user data
- ProfileScreen: retry button khi lỗi

---

## Dependencies đã cài

```json
{
  "@react-native-async-storage/async-storage": "^1.x.x"
}
```

---

## Testing Guide

### 1. Test Register
1. Mở app → Welcome → Get Started
2. Điền form đầy đủ
3. Nhấn "Đăng ký"
4. Kiểm tra Alert thành công
5. App auto navigate to Main

### 2. Test Login
1. Mở app → Welcome → Login
2. Nhập email/phone + password
3. Nhấn "Login"
4. Kiểm tra Alert nếu sai thông tin
5. Login thành công → Main screen

### 3. Test Profile
1. Login thành công → vào Profile tab
2. Kiểm tra hiển thị đúng: name, stats, email
3. Nhấn "Log Out"
4. Confirm logout
5. App navigate về Welcome

---

## API Response Examples

### Register Success
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "email": "user@email.com",
      "phone": "0123456789",
      "firstName": "John",
      "lastName": "Doe",
      "role": "buyer",
      "reputation": {
        "rating": 0,
        "totalReviews": 0,
        "totalSales": 0,
        "totalInspections": 0
      },
      "_id": "...",
      "createdAt": "2026-01-26T16:49:24.390Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Sign In Success
```json
{
  "message": "Signed in successfully",
  "data": {
    "user": { /* same as register */ },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Troubleshooting

### Lỗi "Network request failed"
- Kiểm tra backend đang chạy
- Kiểm tra BASE_URL đúng IP/port
- Kiểm tra firewall không block port

### Token expired
- API sẽ trả về 401
- User cần login lại
- Có thể implement auto-refresh token sau

### AsyncStorage errors
- Thường do permission issues
- Check app có quyền storage

---

## Next Steps (Có thể mở rộng)

1. **Auto-refresh token**: Thêm logic refresh token khi hết hạn
2. **Biometric login**: Thêm FaceID/TouchID
3. **Remember me**: Lưu credentials an toàn
4. **Social login**: Tích hợp Google/Facebook OAuth
5. **Profile edit**: API update user info
6. **Upload avatar**: API upload ảnh đại diện

---

Created: January 26, 2026
