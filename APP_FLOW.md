# 🚴‍♂️ Bicycle Marketplace App - Luồng Ứng Dụng

## 📱 Tổng Quan Kiến Trúc

```
App.js
  └── AppNavigator (Navigation)
       ├── Welcome Stack (Auth Flow)
       ├── Main Tabs (Main App)
       └── Modal Screens (Details, Checkout, etc.)
```

---

## 🔐 1. LUỒNG ĐĂNG NHẬP (Auth Flow)

### Màn hình: `WelcomeScreen` → `LoginScreen` → `RegisterScreen`

**WelcomeScreen** (`/src/screens/Auth/WelcomeScreen.js`)
- ✅ Màn hình chào mừng đầu tiên
- ✅ Hiển thị brand VeloTrust với hero image
- ✅ Features: Secure Payments, Verified Listings, Buyer Protection
- ✅ Buttons: "Get Started" → LoginScreen, "Register" → RegisterScreen

**LoginScreen** (`/src/screens/Auth/LoginScreen.js`)
- ✅ Form đăng nhập: Email/Phone + Password
- ✅ Show/hide password toggle
- ✅ Forgot Password link
- ✅ Social login: Google, Apple
- ✅ Success → Navigate to `Main` (Tab Navigator)

**RegisterScreen** (`/src/screens/Auth/RegisterScreen.js`)
- ✅ Form đăng ký tài khoản mới
- ✅ Success → Navigate to `Main`

---

## 🏠 2. LUỒNG CHÍNH (Main App Flow)

### Tab Navigation Structure:

```
Main Tabs
├── Home Tab
├── Search Tab
├── Wishlist Tab
└── Profile Tab
```

---

## 📍 2.1. HOME TAB - Trang Chủ

**HomeScreen** (`/src/screens/Home/HomeScreen.js`)

### Thành phần:
1. **Search Bar** 
   - Tap → Navigate to `SearchScreen`

2. **Categories Horizontal List**
   - Mountain, Road, Hybrid, Fixie
   - Filter products by category

3. **Featured Products Grid**
   - Display: Product cards (2 columns)
   - Component: `ProductCard`
   - Tap card → Navigate to `ProductDetailScreen`

### Luồng từ Home:
```
HomeScreen
  ├── Tap Search → SearchScreen
  ├── Tap Product → ProductDetailScreen
  └── Tap Category → Filter products
```

---

## 🔍 2.2. SEARCH TAB - Tìm Kiếm

**SearchScreen** (`/src/screens/Search/SearchScreen.js`)

### Features:
- ✅ Real-time search input
- ✅ Category filter chips (horizontal scroll)
- ✅ Filter button → Navigate to `FiltersScreen`
- ✅ Results grid (2 columns)
- ✅ Empty state

### Luồng:
```
SearchScreen
  ├── Tap Filter Icon → FiltersScreen
  ├── Tap Product → ProductDetailScreen
  └── Search & Filter → Update results
```

**FiltersScreen** (`/src/screens/Search/FiltersScreen.js`)

### Advanced Filters:
- ✅ **Inspected Bikes Only** - Toggle switch
- ✅ **Price Range** - Quick select buttons (< 10M, 10-25M, > 25M)
- ✅ **Bike Type** - Chips selection (Road, Mountain, Hybrid, Fixie, Gravel, Electric)
- ✅ **Frame Size** - Grid selection (XS, S, M, L, XL)
- ✅ **Brands** - Checkbox list (Specialized, Giant, Trek, Cannondale, Canyon, Scott)
- ✅ Footer: "Show (X filters)" button → Apply & back to SearchScreen
- ✅ Reset button

---

## ❤️ 2.3. WISHLIST TAB - Yêu Thích

**WishlistScreen** (`/src/screens/Interactions/WishlistScreen.js`)

### UI Components:

1. **Header**
   - Title: "Wishlist (X)" - showing count
   - View Mode Toggle: Grid (⊞) / List (☰) buttons
   - Active mode highlighted in blue

2. **Stats Bar** (3 columns)
   - **Items**: Total saved bikes count
   - **Total Value**: Sum of all prices (in millions)
   - **Avg Rating**: Average rating of all items

3. **Product Display**
   - **Grid Mode** (2 columns): 
     - Product image with condition badge (Used/New/Like New)
     - Filled heart icon (red) - indicates in wishlist
     - X button (remove) in top-right corner
     - Bike name, location icon + city
     - Price (blue) + star rating
   - **List Mode** (1 column):
     - Horizontal layout with larger details
     - Same info as grid but more spacious

4. **Empty State**
   - Large heart outline icon
   - "Your wishlist is empty" title
   - "Save bikes you like to view them later" description
   - "Browse Bikes" button → Navigate to HomeScreen

5. **Footer Actions** (2 buttons)
   - "Compare Selected" (outline, blue) → CompareBikesScreen
   - "Clear All" (outline, red) → Clear entire wishlist

### Features:
- ✅ Toggle between Grid (2 columns) and List (1 column) view
- ✅ Real-time stats calculation (total items, value, avg rating)
- ✅ Remove individual items via X button
- ✅ Remove all items via "Clear All"
- ✅ Compare multiple bikes
- ✅ Empty state with call-to-action

### Luồng:
```
WishlistScreen
  ├── Tap Product Card → ProductDetailScreen
  ├── Tap Grid/List Toggle → Switch display mode
  ├── Tap X Button → Remove item from wishlist
  ├── Tap Compare Selected → CompareBikesScreen (with selected bikes)
  ├── Tap Clear All → Show confirmation → Clear wishlist
  └── Tap Browse Bikes (empty state) → HomeScreen
```

---

## 👤 2.4. PROFILE TAB - Hồ Sơ

**ProfileScreen** (`/src/screens/Profile/ProfileScreen.js`)

### Structure:

1. **Profile Header**
   - Avatar with verified badge
   - Name, Rating (4.8), Reviews count
   - Member since date

2. **Stats Bar**
   - Sold (5), Bought (8), Reviews (12)

3. **Account Settings Section**
   - Personal Info
   - Saved Addresses
   - Payment Methods (badge: 2)
   - Security

4. **Trust & Support Section**
   - Transaction History
   - Inspection Reports
   - Escrow Help Center

5. **Activity Section**
   - My Listings (badge: 3)
   - Wishlist → WishlistScreen
   - Messages (badge: 2) → ChatListScreen
   - Notifications (badge: 5)

6. **Log Out**
   - → Navigate to `Welcome` screen

### Luồng:
```
ProfileScreen
  ├── Wishlist → WishlistScreen
  ├── Messages → ChatListScreen
  ├── Transaction History → (Future screen)
  └── Log Out → WelcomeScreen
```

---

## 🚲 3. LUỒNG CHI TIẾT SẢN PHẨM

**ProductDetailScreen** (`/src/screens/Product/ProductDetailScreen.js`)

### Sections:

1. **Product Images**
   - Hero image with swipeable gallery
   - Back button, Heart button (wishlist)

2. **Product Info**
   - Name, Price
   - Condition badge, Location
   - Rating

3. **Description**
   - Product details text

4. **Technical Specs** ⭐ NEW
   - Frame Material
   - Groupset
   - Wheelset
   - Weight
   - Braking
   - Gears

5. **Usage History** ⭐ NEW
   - Miles Logged: 1,544 km
   - Last Service: 2 months ago
   - Owned Since: Sep 14, 2022

6. **Escrow Protection Banner** ⭐ NEW
   - Shield icon
   - Protection description

7. **Seller Info**
   - Avatar, Name, Rating
   - Chat button → ChatDetailScreen

### Footer Actions:
- **Compare Button** → Navigate to `CompareBikesScreen(bike1: product)`
- **Buy Now Button** → Navigate to `CheckoutScreen(product)`

### Luồng:
```
ProductDetailScreen
  ├── Tap Compare → CompareBikesScreen
  ├── Tap Buy Now → CheckoutScreen
  ├── Tap Chat → ChatDetailScreen
  └── Tap Heart → Add to Wishlist
```

---

## ⚖️ 4. LUỒNG SO SÁNH XE

**CompareBikesScreen** (`/src/screens/Product/CompareBikesScreen.js`)

### Layout:
- Side-by-side comparison of 2 bikes
- Headers: Bike images, names, prices, ratings

### Comparison Sections:

1. **Price Comparison**
   - Price (highlighted lower price)
   - Condition

2. **Technical Specifications**
   - Weight (highlighted lighter)
   - Frame Material
   - Groupset
   - Wheelset
   - Braking
   - Gears

3. **Ratings**
   - Overall Rating

### Actions:
- "View Details" buttons → ProductDetailScreen for each bike
- "Buy Now" → (Future: Select bike)
- "Live Chat" → (Future: Chat)

### Luồng:
```
CompareBikesScreen
  ├── View Details (Bike 1) → ProductDetailScreen(bike1)
  ├── View Details (Bike 2) → ProductDetailScreen(bike2)
  └── Buy Now → CheckoutScreen
```

---

## 💳 5. LUỒNG THANH TOÁN

**CheckoutScreen** (`/src/screens/Checkout/CheckoutScreen.js`)

### Sections:

1. **Order Summary**
   - Product image, name, category, price

2. **Escrow Protection** ⭐ KEY FEATURE
   - 🔒 **Payment Held**: Money safely held during inspection
   - 🔍 **Smart Inspection**: Professional verification
   - 📦 **Insured Delivery**: Tracked shipping
   - ✅ **Funds Released**: After buyer verification

3. **Payment Method**
   - Credit/Debit Card
   - E-Wallet (Momo, ZaloPay)
   - Bank Transfer

4. **Price Breakdown**
   - Bike Price
   - Shipping Fee: 200,000₫
   - Escrow Protection (2%): Calculated
   - **Total**

### Footer:
- Total Payment display
- "Proceed to Payment" → Navigate to `OrderTrackingScreen`

### Luồng:
```
CheckoutScreen
  ├── Select Payment Method → Update display
  ├── Review Escrow Protection → Read details
  └── Proceed to Payment → OrderTrackingScreen
```

---

## 📦 6. LUỒNG THEO DÕI ĐỜN HÀNG

**OrderTrackingScreen** (`/src/screens/Orders/OrderTrackingScreen.js`)

### Layout:

1. **Order ID**
   - Display: ORD-1234567

2. **Item Details**
   - Product image, name, price

3. **Order Status Timeline** ⭐ KEY FEATURE
   ```
   ✅ Ordered
      Oct 16, 10:28 AM
      4 Barrow payment services
   
   ✅ Inspected (Current)
      Oct 18, 3:18 PM
      Certified by pro mechanic
   
   ⏳ Shipped
      In Transit
      Estimated Oct 18
   
   ⏳ Delivered
      Payment will be released after delivery
   ```

4. **Escrow Protection**
   - Green banner
   - 100% refund ready
   - Payment released after verification

5. **Delivery Information**
   - 📍 Delivery Address
   - 👤 Recipient
   - 📞 Phone Number

### Actions:
- "Contact Seller" → ChatDetailScreen
- "Get Help" → Support
- "Track Delivery" → (Future: Real-time tracking)

### Luồng:
```
OrderTrackingScreen
  ├── Contact Seller → ChatDetailScreen
  ├── Track Delivery → Real-time map
  └── Order Complete → Rating screen
```

---

## 💬 7. LUỒNG CHAT (Communication)

**ChatListScreen** (`/src/screens/Communication/ChatListScreen.js`)
- List of conversations
- Tap → Navigate to `ChatDetailScreen`

**ChatDetailScreen** (`/src/screens/Communication/ChatDetailScreen.js`)
- 1-1 chat with seller/buyer
- Send messages, images
- Quick actions for product discussion

### Luồng:
```
ChatListScreen
  └── Tap Conversation → ChatDetailScreen
       └── Send Messages, Discuss Product
```

---

## 🎯 LUỒNG TỔNG QUAN (Complete User Journey)

### Mua Xe (Buyer Flow):
```
1. WelcomeScreen
   └── LoginScreen
       └── Main Tabs

2. HomeScreen / SearchScreen
   └── Browse products
   └── Apply Filters (FiltersScreen)

3. ProductDetailScreen
   └── View specs, usage history
   └── Optional: Compare → CompareBikesScreen
   
4. CheckoutScreen
   └── Review Escrow Protection
   └── Select Payment Method
   
5. OrderTrackingScreen
   └── Monitor: Ordered → Inspected → Shipped → Delivered
   └── Contact Seller if needed
   
6. Product Received
   └── Rate & Review
```

### Quản Lý Yêu Thích (Wishlist Flow):
```
1. Browse products → Tap Heart icon
2. WishlistScreen
   └── View saved bikes
   └── Grid/List toggle
   └── Compare multiple bikes
   └── Remove items
```

### Quản Lý Tài Khoản (Profile Flow):
```
ProfileScreen
├── Update Personal Info
├── Manage Payment Methods
├── View Transaction History
├── Check Inspection Reports
└── Log Out
```

---

## 🔑 KEY FEATURES SUMMARY

### ⭐ Tính năng Nổi Bật:

1. **Escrow Protection** (Bảo vệ giao dịch)
   - Payment held safely
   - Professional inspection
   - Buyer verification required
   - 100% refund guarantee

2. **Smart Comparison** (So sánh thông minh)
   - Side-by-side bike comparison
   - Highlight better specs
   - Easy decision making

3. **Advanced Filters** (Lọc nâng cao)
   - Multiple filter options
   - Price range quick select
   - Frame size visual selection
   - Inspected-only toggle

4. **Usage History** (Lịch sử sử dụng)
   - Miles logged
   - Service records
   - Ownership timeline

5. **Order Tracking** (Theo dõi đơn hàng)
   - Visual timeline
   - Status updates
   - Delivery tracking
   - Escrow status

---

## 📂 CẤU TRÚC THƯ MỤC

```
src/
├── screens/
│   ├── Auth/
│   │   ├── WelcomeScreen.js
│   │   ├── LoginScreen.js
│   │   └── RegisterScreen.js
│   ├── Home/
│   │   └── HomeScreen.js
│   ├── Search/
│   │   ├── SearchScreen.js
│   │   └── FiltersScreen.js
│   ├── Product/
│   │   ├── ProductDetailScreen.js
│   │   └── CompareBikesScreen.js
│   ├── Checkout/
│   │   └── CheckoutScreen.js
│   ├── Orders/
│   │   └── OrderTrackingScreen.js
│   ├── Interactions/
│   │   └── WishlistScreen.js
│   ├── Profile/
│   │   └── ProfileScreen.js
│   └── Communication/
│       ├── ChatListScreen.js
│       └── ChatDetailScreen.js
├── components/
│   ├── common/
│   └── product/
│       └── ProductCard.js
├── navigation/
│   └── AppNavigator.js
├── constants/
│   └── colors.js
└── data/
    └── mockData.js
```

---

## 🎨 DESIGN SYSTEM

### Colors (từ `/src/constants/colors.js`):
```javascript
COLORS = {
  primary: '#2196F3',      // Blue - Main action color
  secondary: '#757575',     // Gray - Secondary text
  text: '#212121',         // Dark gray - Main text
  background: '#F5F5F5',   // Light gray - Background
  surface: '#FFFFFF',      // White - Cards/surfaces
  border: '#E0E0E0',       // Light gray - Borders
  error: '#F44336',        // Red - Errors/delete
  warning: '#FFC107',      // Orange - Ratings/warnings
}
```

### Components:
- **ProductCard**: 2-column grid layout, image + info + price + rating
- **Buttons**: Primary (filled), Secondary (outline)
- **Icons**: Ionicons from @expo/vector-icons

---

## 🚀 NEXT STEPS / FUTURE IMPROVEMENTS

### Phase 2:
- [ ] Real authentication (Firebase/Backend API)
- [ ] Real-time chat (Socket.io/Firebase)
- [ ] Payment gateway integration
- [ ] GPS tracking for delivery
- [ ] Push notifications
- [ ] Image upload for listings
- [ ] Review & rating system
- [ ] Seller dashboard

### Phase 3:
- [ ] AI-powered bike recommendations
- [ ] Virtual bike inspection with AR
- [ ] Bike valuation estimator
- [ ] Community forum
- [ ] Bike insurance integration

---

## 📝 TESTING CHECKLIST

### Manual Testing Flow:
1. ✅ Welcome → Login → Main
2. ✅ Browse products on Home
3. ✅ Search & apply filters
4. ✅ View product details with specs
5. ✅ Compare 2 bikes
6. ✅ Add to wishlist
7. ✅ Checkout with escrow info
8. ✅ Track order status
9. ✅ View profile sections
10. ✅ Log out → Return to Welcome

---

## 💡 TIPS FOR DEVELOPERS

### Debugging:
- Check console for navigation errors
- Verify mockData has all required fields (name, price, image, rating, condition, specs)
- Ensure route params are passed correctly between screens

### Adding New Screens:
1. Create screen file in appropriate `/screens/` folder
2. Import in `AppNavigator.js`
3. Add to Stack or Tab Navigator
4. Pass required params via `navigation.navigate('Screen', { params })`

### State Management:
- Currently using local state (useState)
- For production: Consider Redux/Context API for global state

---

**Version**: 1.0.0  
**Last Updated**: January 26, 2026  
**Tech Stack**: React Native, Expo, React Navigation  

🎉 **Happy Coding!** 🚴‍♂️
