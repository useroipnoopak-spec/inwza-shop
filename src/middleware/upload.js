const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
  destination(req,file,cb){
    const field = file.fieldname || 'file';
    let folder = 'uploads/slips';
    if(field.includes('product')) folder = 'uploads/products';
    if(field.includes('kyc')) folder = 'uploads/kyc';
    cb(null, path.join(__dirname, '../../', folder));
  },
  filename(req,file,cb){ cb(null, Date.now() + '-' + Math.round(Math.random()*1e9) + path.extname(file.originalname)); }
});
function fileFilter(req,file,cb){
  if(!/image|pdf/.test(file.mimetype)) return cb(new Error('อนุญาตเฉพาะรูปภาพหรือ PDF'));
  cb(null,true);
}
module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
