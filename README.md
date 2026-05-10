# Win Haven - Online Auction Marketplace

โปรเจกต์ Node.js เว็บไซต์ประมูลสินค้าออนไลน์แบบจัดโครงสร้างเหมือนระบบจริงมากขึ้น

## วิธีรัน

```bash
npm install
npm start
```

เปิดเว็บที่

```txt
http://localhost:3000
```

## บัญชีเดโม่

```txt
User:   user@demo.com / 123456
Seller: seller@demo.com / 123456
Admin:  admin@demo.com / 123456
```

## โครงสร้างโปรเจกต์

```txt
src/
  config/        ตั้งค่าระบบ
  controllers/   รับ request / response
  database/      JSON database layer
  middleware/    auth / upload
  routes/        api routes
  services/      business logic
  utils/         helpers
public/          frontend
uploads/         ไฟล์อัปโหลด
```

## หมายเหตุ

- ระบบนี้เป็น Demo/Prototype ที่จัดโครงสร้างดีขึ้นเพื่อส่งงานและพัฒนาต่อ
- ฐานข้อมูลใช้ JSON file เพื่อให้รันง่าย ไม่ต้องติดตั้ง MySQL
- ระบบเติมเงินจำลองจะขึ้น pending ก่อน แล้วอนุมัติอัตโนมัติใน 1-3 วินาที


## Demo Mode Update
- ระบบ KYC ผู้ขายอนุมัติอัตโนมัติทันทีหลังส่งข้อมูล เพื่อให้ทดสอบ/นำเสนอได้ต่อเนื่องโดยไม่ต้องรอ Admin
