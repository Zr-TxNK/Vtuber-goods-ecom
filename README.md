# VTuber Merch Hub 🦈🔮🎙️

ร้านค้าออนไลน์สินค้า VTuber Limited Edition — สร้างด้วย HTML, CSS, และ JavaScript ล้วนๆ  
ออกแบบมาให้เข้าใจง่ายสำหรับผู้เริ่มต้นเรียนเขียนโค้ด

---

## 📁 โครงสร้างไฟล์

```
Vtuber-goods-ecom/
│
├── index.html              ← หน้าเว็บหลัก (HTML)
├── style.css               ← ตกแต่งหน้าเว็บ (CSS)
├── app.js                  ← ลอจิกหน้าบ้าน (JavaScript)
│
├── server.js               ← Express server (Node.js backend)
├── database.js             ← In-memory placeholder data (แทน SQLite)
│
├── authController.js       ← จัดการ login/register
├── orderController.js      ← จัดการคำสั่งซื้อ
├── productController.js    ← จัดการสินค้า
│
├── authMiddleware.js        ← ตรวจสอบ JWT token
├── validateMiddleware.js   ← ตรวจสอบ input
│
├── authRoutes.js           ← เส้นทาง API /auth
├── orderRoutes.js          ← เส้นทาง API /orders
├── productRoutes.js        ← เส้นทาง API /products
│
├── authService.js          ← Business logic การ auth
├── orderService.js         ← Business logic การสั่งซื้อ
├── productService.js       ← Business logic สินค้า
│
├── package.json            ← รายการ dependencies
└── README.md               ← ไฟล์นี้
```

---

## 🚀 วิธีเริ่มต้น

### วิธีที่ 1 — Live Server (ง่ายที่สุด ไม่ต้องรัน Node)

1. เปิดโฟลเดอร์นี้ใน **VS Code**
2. ติดตั้ง extension **Live Server** (ถ้ายังไม่มี)
3. คลิกขวาที่ `index.html` → **"Open with Live Server"**
4. เบราว์เซอร์จะเปิดขึ้นมาอัตโนมัติ ✅

> ใช้ **mock data** จาก `app.js` (12 สินค้าตัวอย่าง) — ไม่ต้องการ backend หรือ database ใดๆ

---

### วิธีที่ 2 — Express Backend (เต็มรูปแบบ)

**ติดตั้ง dependencies ก่อน (ครั้งแรกครั้งเดียว):**
```bash
npm install
```

**รัน server:**
```bash
node server.js
```

**เปิดเบราว์เซอร์ที่:**
```
http://localhost:3000
```

> ใช้ **in-memory data** จาก `database.js` — ไม่มี SQLite, ข้อมูลจะ reset ทุกครั้งที่ restart server

---

## 🔄 เปลี่ยนโหมด Mock ↔ Backend

เปิดไฟล์ `app.js` แล้วหาบรรทัดนี้ที่ด้านบน:

```js
const USE_MOCK_DATA = true;   // 🟡 Live Server mode
const USE_MOCK_DATA = false;  // 🟢 Express backend mode
```

---

## ✨ Features

| Feature | รายละเอียด |
|---------|-----------|
| 🛍️ แคตตาล็อกสินค้า | แสดงสินค้า 12 รายการพร้อม badge สต็อก |
| 🔍 ค้นหา + กรอง | ค้นหาชื่อ, กรองหมวดหมู่, กรองราคา |
| 🛒 ตะกร้าสินค้า | เพิ่ม/ลด/ลบสินค้า, บันทึกใน localStorage |
| 🔐 ระบบสมาชิก | สมัครสมาชิก / เข้าสู่ระบบ (mock หรือ JWT จริง) |
| 📦 ประวัติคำสั่งซื้อ | ดูรายการสั่งซื้อหลัง login |
| 🔔 Toast Notifications | แจ้งเตือนทุกการกระทำ |
| 📱 Responsive | รองรับทุกขนาดหน้าจอ |

---

## 🎨 การออกแบบ

- **ธีม:** Dark Cyberpunk + Glassmorphism
- **ฟอนต์:** Noto Sans Thai (ภาษาไทย) + Outfit (heading)
- **สีหลัก:** Purple `#a855f7` + Cyan `#22d3ee`
- **Animations:** Background orbs, card hover, hero rings, toast slide-in

---

## 🧱 Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend (optional) | Node.js + Express.js |
| Database | In-memory JavaScript array (placeholder) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Font | Google Fonts (Noto Sans TH, Outfit) |

---

## 📚 แนวคิดที่เรียนรู้จากโปรเจกต์นี้

### 1. Event Delegation
แทนที่จะ attach event listener ทีละปุ่ม ใช้ listener เดียวบน `#products-grid` แล้วจับ event ที่ bubble up ขึ้นมา

```js
// app.js
DOM.productsGrid.addEventListener('click', (event) => {
  const btn = event.target.closest('.add-to-cart-btn');
  if (!btn) return;
  // จัดการ add to cart
});
```

### 2. Debouncing
ป้องกัน function ทำงานถี่เกินไปตอนพิมพ์ค้นหา — รอให้หยุดพิมพ์ 300ms ก่อนค่อย filter

```js
// app.js
DOM.searchInput.addEventListener('input', debounce(() => fetchProducts(), 300));
```

### 3. localStorage
บันทึกตะกร้าสินค้าไว้ใน browser ไม่หายแม้ refresh หน้า

```js
// บันทึก
localStorage.setItem('cart', JSON.stringify(cartState));

// โหลดกลับมา
const saved = localStorage.getItem('cart');
cartState = JSON.parse(saved);
```

### 4. Controller-Route-Service Pattern (Backend)
แบ่งโค้ด backend เป็น 3 ชั้น:
- **Routes** — รับ HTTP request, เรียก middleware
- **Controllers** — ดึงข้อมูลจาก request, ส่ง response
- **Services** — business logic จริงๆ (ตรวจสต็อก, hash password ฯลฯ)

---

*University Final Project — HTML / CSS / JavaScript / Node.js + Express*
