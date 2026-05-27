# แผนดำเนินงานเว็บไซต์ VTuber Merch Hub

เอกสารนี้รวบรวมขั้นตอนที่ต้องทำเพื่อให้เว็บไซต์ตรงตาม requirement ใน `skill/review.md` และแก้จุดเสี่ยงที่พบจากโค้ดปัจจุบัน โดยใช้เป็น checklist สำหรับลงมือแก้เว็บและตรวจรับงานได้ครบถ้วน

## 1. เป้าหมายงาน

เว็บไซต์ต้องแสดงรายการสินค้าจากไฟล์ JSON แยกต่างหาก ไม่ฝังข้อมูลสินค้าไว้ใน JavaScript และต้องมี flow หลักตาม sequence ที่กำหนด:

```text
เปิดหน้าเว็บ
  -> initApp()
  -> requestProducts()
  -> fetch('./data/products.json')
  -> response.json()
  -> เก็บข้อมูลใน state
  -> renderUI(products)
  -> แสดง product card บนหน้าเว็บ
```

ผลลัพธ์ที่ต้องได้:

- มีไฟล์ JSON สินค้าจำนวน 20 รายการ
- product object มีข้อมูลครบสำหรับ card ปัจจุบัน
- JavaScript มีฟังก์ชันชื่อ `requestProducts()` และ `renderUI()`
- มี comments อธิบาย data flow ตั้งแต่โหลด JSON จนแสดง UI
- การค้นหาและ filter ทำงานกับข้อมูลที่โหลดมา
- ตะกร้าสินค้า, login/register และ order history ที่มีอยู่ไม่เสีย
- layout ใช้งานได้ทั้ง desktop และ mobile
- ไม่มีไฟล์ secret หรือ dependency metadata ที่ควรถูก track หลุดจากการจัดการ version control

## 2. สถานะปัจจุบันและสิ่งที่ยังขาด

ไฟล์ปัจจุบันทำงานด้วย `MOCK_PRODUCTS` ใน `app.js` จำนวน 12 รายการ และตั้ง `USE_MOCK_DATA = true` เป็นค่าเริ่มต้น จึงยังไม่ได้ทำตาม flow การอ่าน JSON

สิ่งที่ต้องเปลี่ยน:

| หัวข้อ | สถานะปัจจุบัน | สิ่งที่ต้องทำ |
| --- | --- | --- |
| แหล่งข้อมูลสินค้า | Array ใน `app.js` | สร้าง `data/products.json` จำนวน 20 รายการ |
| การโหลดข้อมูล | `filterAndRenderMockProducts()` | เพิ่ม `requestProducts()` ที่เรียก `fetch('./data/products.json')` |
| การ render | `renderProducts()` | เปลี่ยนชื่อหรือสร้าง `renderUI()` ตาม sequence |
| รูปสินค้า | สร้าง SVG ผ่าน JavaScript | ใช้ URL หรือ path string ที่เขียนใน JSON ได้ |
| Mobile grid | บังคับ 2 คอลัมน์ใต้ 480px | ปรับให้ card ไม่เบียดหรือล้นบนจอแคบ |
| Lockfile | `package-lock.json` ถูก ignore | track lockfile เมื่อใช้ npm dependencies |
| Environment files | ignore ไม่ครบ | เพิ่ม `.env.*.local` กลับเข้า `.gitignore` |
| Test script | ยังเป็น placeholder | เพิ่มขั้นตอนตรวจจริงหรือระบุ manual test ชัดเจน |

## 3. โครงสร้างไฟล์เป้าหมาย

ให้เพิ่มและปรับไฟล์ตามโครงสร้างนี้:

```text
Vtuber-goods-ecom/
|-- index.html
|-- style.css
|-- app.js
|-- data/
|   `-- products.json          # สินค้า 20 รายการสำหรับหน้า catalog
|-- assets/
|   `-- images/
|       `-- products/          # รูปสินค้า ถ้าเลือกเก็บรูป local
|-- package.json
|-- package-lock.json          # ต้อง commit ถ้ามี dependencies
|-- .gitignore
`-- skill/
    |-- review.md
    `-- docs/
        `-- web-implementation-steps.md
```

หมายเหตุ: ถ้าไม่เพิ่มรูป local ค่า `image_url` ใน JSON สามารถเป็น URL รูปภายนอกหรือ data URI แบบ string ที่เตรียมไว้แล้วได้ แต่ JSON ไม่สามารถเรียก `makePlaceholderImage()` ได้

## 4. ขั้นตอนสร้างข้อมูลสินค้า 20 รายการ

### 4.1 สร้างไฟล์ข้อมูล

สร้างไฟล์ `data/products.json` โดย root เป็น array:

```json
[
  {
    "id": 1,
    "name": "Hololive Acrylic Stand Vol.1",
    "category": "Acrylic Stands",
    "price": 24.99,
    "stock": 15,
    "description": "อะคริลิคสแตนด์ขนาด A5 พิมพ์ลาย 4 สี ความละเอียดสูง มาพร้อมฐานตั้งโต๊ะ",
    "image_url": "./assets/images/products/acrylic-stand-vol-1.webp"
  }
]
```

### 4.2 กติกาของ schema

สินค้าแต่ละรายการต้องมี fields ต่อไปนี้:

| Field | Type | ใช้ทำอะไร | ข้อกำหนด |
| --- | --- | --- | --- |
| `id` | number | ระบุสินค้าและใช้ใน cart | ไม่ซ้ำกัน เริ่มที่ 1 ถึง 20 |
| `name` | string | ชื่อบน card และใน cart | ห้ามว่าง |
| `category` | string | badge/filter | ต้องตรงกับ option ใน `index.html` |
| `price` | number | ราคาและ subtotal | มากกว่าหรือเท่ากับ 0 ไม่ใส่ `$` |
| `stock` | number | badge/ปิดปุ่มเมื่อหมด | integer มากกว่าหรือเท่ากับ 0 |
| `description` | string | รายละเอียด card | ห้ามเป็น HTML ที่ไม่ผ่านการ sanitize |
| `image_url` | string | รูป card/cart | path หรือ URL ที่ browser เปิดได้ |

หมวดหมู่ที่หน้าเว็บรองรับอยู่:

```text
Acrylic Stands
Apparel
Keychains
Plushies
Music
Mugs
```

### 4.3 รายการสินค้าที่ต้องจัดเตรียม

ให้มีข้อมูลครบ 20 ชิ้นตามตารางนี้ หรือปรับชื่อ/ราคาได้โดยยังรักษา schema และจำนวน:

| ID | Name | Category | Price | Stock | Image file suggestion |
| ---: | --- | --- | ---: | ---: | --- |
| 1 | Hololive Acrylic Stand Vol.1 | Acrylic Stands | 24.99 | 15 | `acrylic-stand-vol-1.webp` |
| 2 | Pekora Hoodie Black Edition | Apparel | 59.99 | 3 | `pekora-hoodie.webp` |
| 3 | Gura Shark Plushie | Plushies | 39.99 | 0 | `gura-plushie.webp` |
| 4 | Mumei Keychain Set | Keychains | 14.99 | 50 | `mumei-keychain.webp` |
| 5 | Suisei Stellar Stellar Vinyl | Music | 34.99 | 8 | `suisei-vinyl.webp` |
| 6 | Marine Anniversary Mug | Mugs | 19.99 | 22 | `marine-mug.webp` |
| 7 | Korone Doggo Plushie XL | Plushies | 54.99 | 4 | `korone-plushie.webp` |
| 8 | Aqua Idol Outfit Acrylic | Acrylic Stands | 29.99 | 12 | `aqua-acrylic.webp` |
| 9 | Kronii Oversized T-Shirt | Apparel | 44.99 | 7 | `kronii-tshirt.webp` |
| 10 | IRyS Album CD | Music | 27.99 | 16 | `irys-album.webp` |
| 11 | Fubuki Winter Keychain | Keychains | 9.99 | 35 | `fubuki-keychain.webp` |
| 12 | Miko Sakura Gradient Mug | Mugs | 22.99 | 18 | `miko-mug.webp` |
| 13 | Calliope Concert T-Shirt | Apparel | 37.99 | 11 | `calliope-tshirt.webp` |
| 14 | Ina Takodachi Plushie | Plushies | 42.99 | 6 | `ina-plushie.webp` |
| 15 | Kiara Phoenix Keychain | Keychains | 12.99 | 28 | `kiara-keychain.webp` |
| 16 | Botan Gaming Acrylic Stand | Acrylic Stands | 26.99 | 10 | `botan-acrylic.webp` |
| 17 | Watame Night Fever Album | Music | 31.99 | 13 | `watame-album.webp` |
| 18 | Noel Knight Mug | Mugs | 21.99 | 20 | `noel-mug.webp` |
| 19 | Amelia Investigator Hoodie | Apparel | 62.99 | 5 | `amelia-hoodie.webp` |
| 20 | Kobo Rain Shaman Plushie | Plushies | 36.99 | 9 | `kobo-plushie.webp` |

### 4.4 ตรวจข้อมูลก่อนนำไปใช้

- เปิด `products.json` ด้วย JSON parser หรือ editor ที่ตรวจ syntax ได้
- ยืนยันว่า root เป็น array และมี `20` objects
- ตรวจ `id` ไม่ซ้ำ
- ตรวจ `category` ตรงกับ filter ทุกตัว
- ตรวจ `price` และ `stock` เป็น number ไม่ใช่ string
- เปิด path รูปภาพทุก path แล้วไม่เกิด broken image

## 5. ขั้นตอนแก้ JavaScript ให้ตรง sequence diagram

### 5.1 แยก state ของสินค้า

ใน `app.js` ให้มี state สำหรับสินค้าที่โหลดจาก JSON:

```js
let allProducts = [];
```

หน้าที่ของ state:

- เก็บข้อมูลต้นฉบับที่ได้จาก JSON เพียงครั้งเดียว
- ให้ search/filter กรองจาก `allProducts`
- ไม่ต้อง fetch ไฟล์ JSON ใหม่ทุกครั้งที่ผู้ใช้พิมพ์ค้นหา

### 5.2 ยกเลิกข้อมูล mock ที่ฝังในไฟล์

เมื่อ `data/products.json` พร้อมแล้ว:

- ลบ `MOCK_PRODUCTS` ออกจาก `app.js`
- ลบ `makePlaceholderImage()` หากไม่มีส่วนอื่นใช้
- ไม่ใช้ `filterAndRenderMockProducts()` อีก
- ไม่ให้ catalog ขึ้นกับ `USE_MOCK_DATA` สำหรับการโหลดรายการสินค้าแบบ requirement

หากยังต้องรักษา backend สำหรับ login/order สามารถเก็บ flag สำหรับ auth/order ได้ แต่ catalog ที่ใช้ตรวจ requirement ต้องเริ่มจาก JSON ตาม flow ที่ระบุ

### 5.3 สร้าง `requestProducts()`

ฟังก์ชันนี้เป็นจุดเริ่มการโหลด catalog:

```js
async function requestProducts() {
  DOM.resultsCount.textContent = 'กำลังโหลดสินค้า...';

  try {
    // Data flow: browser ร้องขอไฟล์ JSON จาก server แล้วรอ response
    const response = await fetch('./data/products.json');
    if (!response.ok) {
      throw new Error(`โหลดข้อมูลสินค้าไม่สำเร็จ: ${response.status}`);
    }

    // Data flow: แปลง JSON response เป็น JavaScript array
    const products = await response.json();
    if (!Array.isArray(products)) {
      throw new Error('รูปแบบข้อมูลสินค้าไม่ถูกต้อง');
    }

    // Data flow: เก็บข้อมูลต้นฉบับไว้ใน state เพื่อใช้ filter ภายหลัง
    allProducts = products;
    renderUI(getFilteredProducts());
  } catch (error) {
    console.error('requestProducts error:', error);
    DOM.productsGrid.innerHTML = '';
    DOM.resultsCount.textContent = 'โหลดสินค้าไม่สำเร็จ';
    showToast('ไม่สามารถโหลดสินค้าได้', 'error');
  }
}
```

สิ่งที่ต้องระวัง:

- เปิดเว็บผ่าน Live Server หรือ Express server ไม่เปิดด้วย `file://`
- ต้องเช็ก `response.ok` ก่อน `response.json()`
- error state ต้องแสดงข้อความบนหน้าเว็บ ไม่ทิ้งพื้นที่ว่าง

### 5.4 สร้างฟังก์ชันกรองข้อมูล

ให้ filter แยกจากการ fetch:

```js
function getFilteredProducts() {
  const keyword = DOM.searchInput.value.trim().toLowerCase();
  const category = DOM.categoryFilter.value;
  const minPrice = Number.parseFloat(DOM.minPriceFilter.value);
  const maxPrice = Number.parseFloat(DOM.maxPriceFilter.value);

  return allProducts.filter(product => {
    const matchesKeyword =
      !keyword ||
      product.name.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword);
    const matchesCategory = !category || product.category === category;
    const matchesMin = Number.isNaN(minPrice) || product.price >= minPrice;
    const matchesMax = Number.isNaN(maxPrice) || product.price <= maxPrice;

    return matchesKeyword && matchesCategory && matchesMin && matchesMax;
  });
}
```

หลังจากโหลดสำเร็จครั้งแรก event ของ search/filter ต้องเรียก:

```js
renderUI(getFilteredProducts());
```

ไม่จำเป็นต้องเรียก `fetch()` ซ้ำเมื่อ filter เปลี่ยน เพราะข้อมูลสินค้าอยู่ใน `allProducts` แล้ว

### 5.5 สร้าง `renderUI(products)`

เปลี่ยน `renderProducts()` เป็น `renderUI()` หรือสร้างชื่อใหม่แล้วแก้จุดเรียกทั้งหมดให้ตรง requirement:

```js
function renderUI(products) {
  DOM.productsGrid.innerHTML = '';
  DOM.resultsCount.textContent = `พบ ${products.length} รายการ`;

  if (products.length === 0) {
    DOM.productsGrid.innerHTML = '<div class="empty-state"><p>ไม่พบสินค้า</p></div>';
    return;
  }

  products.forEach(product => {
    // สร้าง product card จาก object ที่ถูกโหลดมาจาก products.json
    // card ต้องมีรูป, หมวดหมู่, ชื่อ, รายละเอียด, ราคา, stock และปุ่ม cart
  });
}
```

Product card ต้องแสดงข้อมูล:

- `image_url` ใน `<img src>`
- `name` ใน `alt` และ heading
- `category`
- `description`
- `price` โดย format เป็นทศนิยม 2 ตำแหน่ง
- `stock` โดยแสดง badge ตามจำนวน
- ปุ่มเพิ่มลงตะกร้าที่ disabled เมื่อ `stock <= 0`

### 5.6 ป้องกันข้อมูล JSON แทรก HTML

โค้ดเดิมสร้าง card ด้วย `insertAdjacentHTML()` และนำค่าจากสินค้าไปใส่ใน HTML โดยตรง เมื่อเปลี่ยนให้ข้อมูลมาจาก JSON ควรป้องกันข้อความหรือ URL ที่ไม่ปลอดภัย:

- แนวทางแนะนำ: สร้าง element ด้วย `document.createElement()` และกำหนด `textContent`
- ถ้าจำเป็นต้องใช้ template string ให้มีฟังก์ชัน escape HTML สำหรับ `name`, `category`, `description`
- ตรวจ `image_url` ให้เป็น local path หรือ URL ที่อนุญาตก่อนกำหนดให้ `src`
- dataset ที่ใช้เพิ่มสินค้าใน cart ต้องไม่รับ HTML ที่สามารถ inject markup ได้

### 5.7 เชื่อม sequence ตอนเริ่มหน้าเว็บ

ใน `initApp()`:

```js
function initApp() {
  hydrateState();
  requestProducts();
}
```

ลำดับข้อมูลเต็ม:

```text
DOMContentLoaded
  -> initApp()
  -> hydrateState() โหลด cart/user จาก localStorage
  -> requestProducts()
      -> fetch('./data/products.json')
      -> response.json()
      -> allProducts = products
      -> getFilteredProducts()
      -> renderUI(filteredProducts)
          -> สร้าง cards ใน #products-grid
```

### 5.8 เชื่อม search และ filters

แก้ event handlers:

```text
ผู้ใช้พิมพ์ search
  -> debounce
  -> getFilteredProducts()
  -> renderUI()

ผู้ใช้เลือก category/min/max price
  -> getFilteredProducts()
  -> renderUI()

ผู้ใช้กด reset filters
  -> ล้าง value ของ input
  -> renderUI(allProducts)
```

ต้องทดสอบกรณี:

- ค้นหาจากชื่อ
- ค้นหาจาก description
- filter category
- filter min/max price แยกและใช้ร่วมกัน
- กด reset แล้วกลับมาเห็น 20 รายการ
- ไม่พบสินค้าแล้วแสดง empty state

## 6. ขั้นตอนดูแล cart และ state เดิม

การเปลี่ยน data source ห้ามทำให้ cart เสีย:

- `addToCart()` ยังคงรับ `id`, `name`, `price`, `stock`, `image_url` จาก product card
- เมื่อกดเพิ่มสินค้า ต้องเพิ่ม badge และ subtotal ถูกต้อง
- ห้ามเพิ่ม quantity เกิน stock
- สินค้าที่ `stock = 0` ต้องกดเพิ่มไม่ได้
- `hydrateState()` ต้องกรอง cart เก่าที่ข้อมูลผิดรูปแบบ
- หลัง refresh หน้าเว็บ cart จาก `localStorage` ต้องยังแสดงได้

กรณีเปลี่ยนหรือยกเลิกสินค้าใน JSON:

- cart เก่าที่อ้าง `productId` ซึ่งไม่มีใน catalog ควรถูกแจ้งเตือนหรือลบออก
- stock จาก catalog ล่าสุดต้องถูกใช้ตรวจ quantity ก่อน checkout

## 7. ขั้นตอนแยกโหมด frontend JSON และ backend

เว็บปัจจุบันมี Express API สำหรับ auth และ order แต่ requirement การแสดงสินค้าเรียกร้อง `fetch(path-to-json-file)` จึงต้องเลือกพฤติกรรมให้ชัด:

### โหมดที่ต้องส่งตาม requirement

- หน้า catalog โหลดจาก `./data/products.json`
- cart ทำงานฝั่ง browser
- หาก checkout เป็น mock ให้ระบุใน UI/README ชัดเจน

### ถ้าต้องการคง checkout backend

- ID ของสินค้าใน `products.json` ต้องตรงกับสินค้าใน `database.js`
- backend ต้องมีสินค้าทั้ง 20 รายการเหมือน JSON หรืออ่าน seed จาก JSON แหล่งเดียวกัน
- หลัง checkout สำเร็จ ต้อง refresh stock จาก API หรือกำหนดวิธี sync stock ให้ชัด
- ห้ามให้หน้าเว็บแสดง stock จาก JSON ค้างเดิมหลัง backend หัก stockไปแล้ว

ทางเลือกที่ลดข้อมูลซ้ำคือให้ `database.js` โหลด seed เริ่มต้นจาก `data/products.json` แทนการเขียน array ซ้ำอีกชุด

## 8. ขั้นตอนปรับ HTML

`index.html` มี container หลักอยู่แล้ว ได้แก่ `#products-grid`, `#results-count`, search/filter, modal และ cart drawer จึงไม่จำเป็นต้องสร้าง layout ใหม่ทั้งหมด

สิ่งที่ต้องตรวจ/ปรับ:

- `#products-grid` เป็นตำแหน่งที่ `renderUI()` inject cards
- `#results-count` แสดง loading, จำนวนผลลัพธ์ และ error state
- option ของ `#category-filter` ตรงกับ category ใน JSON
- `<script src="app.js"></script>` โหลดหลัง DOM หรือใช้ `DOMContentLoaded` อย่างถูกต้อง
- รูปสินค้ามี `alt` เป็นชื่อสินค้า
- ปุ่ม disabled มี state ที่ผู้ใช้เข้าใจได้เมื่อหมดสต็อก
- modal และ drawer ปิด/เปิดด้วย keyboard หรือปุ่มปิดได้อย่างน้อยตามพฤติกรรมเดิม

## 9. ขั้นตอนปรับ CSS และ responsive layout

การตั้ง desktop 5 cards ต่อแถวทำได้ แต่ mobile ต้องไม่บังคับ card ให้แคบกว่าที่ content รองรับ

ต้องทำ:

- ทดสอบ desktop กว้างมากกว่า `1280px`: แสดง 5 columns โดย card อ่านง่าย
- ทดสอบ tablet ระหว่าง `701px` ถึง `960px`: sidebar ยุบและ grid 3 columns ไม่ล้น
- ทดสอบ mobile ระหว่าง `481px` ถึง `700px`: grid 2 columns
- ทดสอบ mobile ไม่เกิน `480px`: ใช้ 1 column หรือใช้ `auto-fill/minmax()` ที่ลดเหลือ 1 column เมื่อไม่พอ
- ตรวจ `.product-footer` ว่าราคาและปุ่มไม่ชนกัน
- ตรวจชื่อสินค้ายาวและคำอธิบายภาษาไทยไม่ดัน card ล้น
- ตรวจ drawer/cart และ navbar ที่ความกว้าง `320px`, `375px`, `390px`, `768px`, `1280px`

แนวแก้ minimum สำหรับจอเล็ก:

```css
@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
```

หรือคืนค่า adaptive rule:

```css
.products-grid {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}
```

## 10. ขั้นตอนแก้การจัดการ repository

### 10.1 `.gitignore`

ต้องเก็บ ignore patterns ที่ป้องกัน secret และ generated runtime data:

```gitignore
node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Runtime database files, ถ้ามีการใช้งานภายหลัง
*.sqlite
*.sqlite-journal
*.sqlite-wal
*.sqlite-shm
database.sqlite
```

### 10.2 `package-lock.json`

เมื่อ repository มี `package.json` และใช้ `npm install`:

- เอา `package-lock.json` ออกจาก `.gitignore`
- รัน `npm install` เพื่อให้ lockfile สอดคล้องกับ dependencies
- commit `package.json` และ `package-lock.json` คู่กัน

เหตุผล: เครื่องผู้พัฒนาและเครื่องตรวจงานจะติดตั้ง dependency tree เดียวกัน

## 11. ขั้นตอนอัปเดตเอกสารการใช้งาน

ปรับ `README.md` หลัง implement เสร็จ:

- เปลี่ยนคำอธิบายจากสินค้า 12 รายการเป็น 20 รายการ
- ระบุว่า catalog อ่านจาก `data/products.json`
- ระบุวิธีเปิดเว็บผ่าน Live Server หรือ `node server.js` เพื่อให้ `fetch()` ใช้ได้
- อธิบายโหมด checkout ว่าเป็น mock หรือ backend จริง
- อัปเดตโครงสร้างไฟล์ให้มี `data/products.json` และ assets ถ้ามี
- แสดง flow สั้น ๆ:

```text
requestProducts() -> fetch('./data/products.json') -> renderUI()
```

## 12. ขั้นตอนทดสอบ

### 12.1 Static checks

รันคำสั่ง:

```bash
node --check app.js
node --check server.js
git diff --check
```

ตรวจ JSON ด้วย Node:

```bash
node -e "const p=require('./data/products.json'); if(p.length!==20) process.exit(1); console.log(p.length)"
```

ผลที่ต้องได้:

- JavaScript ไม่มี syntax error
- diff ไม่มี whitespace error
- JSON parse ได้และมีจำนวน `20`

### 12.2 Product loading tests

| Case | ขั้นตอน | ผลลัพธ์ที่ต้องได้ |
| --- | --- | --- |
| Initial load | เปิดหน้า catalog | แสดง 20 รายการและ count ถูกต้อง |
| JSON missing | เปลี่ยน path ผิดชั่วคราว | แสดง error state/toast ไม่ค้าง loading |
| Empty list | ทดสอบ JSON เป็น `[]` | แสดง empty state |
| Out of stock | ดูสินค้าที่ stock เป็น 0 | badge หมดสต็อกและปุ่ม disabled |

### 12.3 Search/filter tests

| Case | ขั้นตอน | ผลลัพธ์ที่ต้องได้ |
| --- | --- | --- |
| Search | พิมพ์ชื่อสินค้าบางส่วน | เหลือ card ที่ตรงคำค้น |
| Category | เลือก `Mugs` | แสดงเฉพาะแก้ว |
| Min price | ระบุราคาต่ำสุด | ไม่มีสินค้าราคาต่ำกว่าค่า |
| Max price | ระบุราคาสูงสุด | ไม่มีสินค้าราคาเกินค่า |
| Combined | ใช้คำค้น/category/price พร้อมกัน | กรองด้วยทุกเงื่อนไข |
| Reset | กดรีเซ็ต | คืนเป็น 20 รายการ |

### 12.4 Cart tests

| Case | ขั้นตอน | ผลลัพธ์ที่ต้องได้ |
| --- | --- | --- |
| Add | กดเพิ่มสินค้าพร้อมขาย | badge cart เพิ่มและ subtotal ถูกต้อง |
| Quantity | เพิ่ม/ลดจำนวน | ไม่ติดลบและไม่เกิน stock |
| Remove | ลบสินค้า | รายการหายและ subtotal เปลี่ยน |
| Persist | refresh หน้า | cart เดิมยังอยู่ |
| Invalid storage | ใส่ cart ข้อมูลเสียใน localStorage | เว็บไม่ crash และกรองข้อมูลเสียออก |

### 12.5 Responsive tests

ทดสอบผ่าน browser responsive mode:

| Viewport | ผลลัพธ์ที่ต้องตรวจ |
| ---: | --- |
| 1440px | 5 cards ต่อแถว ไม่ยืดผิดสัดส่วน |
| 1024px | grid และ sidebar ไม่ชนกัน |
| 768px | sidebar ย้ายตำแหน่งและ cards อ่านได้ |
| 480px | card, price และปุ่มไม่ล้น |
| 320px | ไม่มี horizontal scroll และใช้งาน cart/navbar ได้ |

### 12.6 Backend tests เมื่อเปิดใช้ API

- `npm install`
- รัน `node server.js`
- เปิด `http://localhost:3000`
- ทดสอบ register/login/logout
- ทดสอบเพิ่มสินค้าและ checkout
- ทดสอบ order history
- ตรวจ stock หลัง checkout ว่า UI และ backend แสดงตรงกัน

หมายเหตุ: `verify.js` ปัจจุบันอ้าง path โครงสร้างเก่า (`./src/...`) ต้องแก้ import ให้ตรงไฟล์ root ก่อนนำมาใช้เป็น automated verification

## 13. ลำดับลงมือทำที่แนะนำ

ทำตามลำดับนี้เพื่อไม่ให้แก้ซ้ำ:

1. สร้าง `data/products.json` และกรอกสินค้า 20 รายการให้ valid
2. เตรียมรูปสินค้า หรือกำหนด `image_url` ที่เปิดได้จริง
3. แก้ `app.js` ให้มี `requestProducts()`, `getFilteredProducts()` และ `renderUI()`
4. เชื่อม `initApp()` ให้เริ่มจาก `requestProducts()`
5. เปลี่ยน search/filter handlers ให้กรองจาก `allProducts`
6. ป้องกัน unsafe HTML ขณะสร้าง product card
7. ทดสอบ cart/localStorage หลังเปลี่ยน data source
8. ปรับ responsive grid โดยเฉพาะ viewport ต่ำกว่า `480px`
9. ตัดสินใจและทดสอบการทำงานร่วมกับ backend/auth/order
10. แก้ `.gitignore` และ track `package-lock.json`
11. อัปเดต `README.md` ให้ตรงระบบใหม่
12. รัน static checks และ manual test ทุกหมวดก่อน commit

## 14. Definition Of Done

งานถือว่าเสร็จเมื่อ checklist ต่อไปนี้ผ่านทั้งหมด:

- [ ] มี `data/products.json` ที่ parse ได้และมีสินค้า 20 รายการ
- [ ] หน้าเว็บไม่ใช้ `MOCK_PRODUCTS` เป็นแหล่ง catalog หลักอีก
- [ ] มี `requestProducts()` ที่เรียก `fetch('./data/products.json')`
- [ ] มี `renderUI()` ที่สร้าง product cards จากข้อมูล JSON
- [ ] มี comments อธิบาย data flow ในจุดสำคัญ
- [ ] หน้าแรกแสดงผลครบ 20 รายการเมื่อไม่มี filter
- [ ] Search, category, min price, max price และ reset ใช้งานได้
- [ ] Stock badge และ disabled add-to-cart ถูกต้อง
- [ ] Cart และ localStorage ทำงานหลัง reload
- [ ] UI ไม่ล้นที่ viewport `320px` ถึง desktop
- [ ] ไม่มี HTML injection จากข้อมูลสินค้า
- [ ] `.gitignore` ยังป้องกัน environment files
- [ ] `package-lock.json` ถูก track เมื่อโปรเจกต์ใช้ npm dependencies
- [ ] `README.md` อธิบาย data source และวิธีรันล่าสุด
- [ ] Syntax/JSON/diff checks ผ่าน
- [ ] ถ้าใช้ backend: login, checkout, order history และ stock sync ผ่านการทดสอบ
