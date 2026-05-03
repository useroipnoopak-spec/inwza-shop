const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const id = require('../utils/id');
const config = require('../config/app');

const DB_PATH = path.join(__dirname, '../../db.json');

function hoursFromNow(h){ return new Date(Date.now() + h * 60 * 60 * 1000).toISOString(); }
function hash(p){ return bcrypt.hashSync(p, 10); }

const sellerId = 'u_seller';
const userId = 'u_user';
const adminId = 'u_admin';

function seed(){
  return {
    settings: {
      platformFeePercent: config.platformFeePercent,
      antiSnipeMinutes: config.antiSnipeMinutes,
      extendMinutes: config.extendMinutes
    },
    users: [
      { id: userId, role: 'user', name: 'Demo User', email: 'user@demo.com', passwordHash: hash('123456'), wallet: 50000, locked: 0, status: 'active', kycStatus: 'not_required', createdAt: new Date().toISOString() },
      { id: sellerId, role: 'seller', name: 'Demo Seller', email: 'seller@demo.com', passwordHash: hash('123456'), wallet: 15000, locked: 0, status: 'active', kycStatus: 'approved', kyc: { fullName: 'Demo Seller', phone: '0999999999', address: 'Bangkok', idCard: '1234567890123' }, createdAt: new Date().toISOString() },
      { id: adminId, role: 'admin', name: 'Admin', email: 'admin@demo.com', passwordHash: hash('123456'), wallet: 0, locked: 0, status: 'active', kycStatus: 'not_required', createdAt: new Date().toISOString() }
    ],
    sessions: [],
    products: [
      { id: id('p'), sellerId, title: 'iPhone 15 Pro Max 256GB', category: 'มือถือ', description: 'สภาพสวย อุปกรณ์ครบ พร้อมกล่อง', images: [], startPrice: 25000, minIncrement: 500, buyNowPrice: 42000, currentPrice: 25000, currentWinnerId: null, status: 'active', endsAt: hoursFromNow(7), createdAt: new Date().toISOString(), bids: [] },
      { id: id('p'), sellerId, title: 'PlayStation 5 Disc Edition', category: 'เกม', description: 'เครื่องศูนย์ ใช้งานน้อย พร้อมจอย 2 ตัว', images: [], startPrice: 11000, minIncrement: 300, buyNowPrice: 17900, currentPrice: 11000, currentWinnerId: null, status: 'active', endsAt: hoursFromNow(18), createdAt: new Date().toISOString(), bids: [] },
      { id: id('p'), sellerId, title: 'Apple Watch Ultra 2', category: 'นาฬิกา', description: 'ประกันเหลือ แบตดี สายแท้', images: [], startPrice: 15000, minIncrement: 300, buyNowPrice: 24500, currentPrice: 15000, currentWinnerId: null, status: 'active', endsAt: hoursFromNow(26), createdAt: new Date().toISOString(), bids: [] }
    ],
    walletRequests: [],
    orders: [],
    reviews: [],
    chats: [],
    notifications: [],
    disputes: []
  };
}

function ensure(){ if(!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify(seed(), null, 2)); }
function read(){ ensure(); return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function write(db){ fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); return db; }
function update(fn){ const db = read(); const result = fn(db); write(db); return result; }

module.exports = { read, write, update, DB_PATH };
