
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../../db/connection');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = 'user_' + (req.params.id || 'unknown') + '_' + Date.now() + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

exports.uploadMiddleware = upload.single('photo');

exports.uploadPhoto = async (req, res) => {
  try{
    if(!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    const url = '/SRC/uploads/' + req.file.filename;
    try{ await db.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS photo VARCHAR(255) DEFAULT NULL'); }catch(e){}
    await db.query('UPDATE usuarios SET photo = ? WHERE id = ?', [url, req.params.id]);
    res.json({ ok:true, url });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
