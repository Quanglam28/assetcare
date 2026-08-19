const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { BadRequestError } = require('../utils/appError');

// Thư mục lưu trữ an toàn
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Danh sách MIME Type và Extension cho phép (Whitelist)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
]);

// Danh sách các phần mở rộng nguy hiểm cấm tuyệt đối (Blacklist)
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.php', '.phtml', '.php3', '.php4', '.php5',
  '.js', '.mjs', '.cjs', '.ts', '.py', '.pl', '.cgi', '.msi', '.vbs', '.scr', '.com',
  '.jar', '.jsp', '.jspx', '.asp', '.aspx', '.cer', '.csr', '.htaccess', '.env', '.config'
]);

// Cấu hình Multer Disk Storage với tên file ngẫu nhiên an toàn (Chống Path Traversal)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.bin';
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    cb(null, `file-${uniqueSuffix}${safeExt}`);
  },
});

// Bộ lọc File Filter kiểm tra MIME Type & Extension chặt chẽ
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // 1. Kiểm tra phần mở rộng độc hại
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return cb(new BadRequestError(`Cảnh báo an ninh: Loại tệp [${ext}] bị cấm tải lên hệ thống.`), false);
  }

  // 2. Kiểm tra MIME Type whitelist
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new BadRequestError(`Định dạng tệp không hợp lệ (${file.mimetype}). Chỉ chấp nhận JPG, PNG, WEBP, GIF, PDF.`), false);
  }

  // 3. Kiểm tra Extension whitelist
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new BadRequestError(`Phần mở rộng [${ext}] không nằm trong danh mục cho phép.`), false);
  }

  cb(null, true);
};

// Cấu hình Upload Middleware (Giới hạn tối đa 5MB / file, tối đa 5 file / lần)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 5,                  // 5 files max
  },
});

// Middleware xử lý lỗi Multer tập trung
const handleUploadError = (uploadFn) => {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new BadRequestError('Kích thước tệp vượt quá giới hạn cho phép (Tối đa 5MB/tệp).'));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new BadRequestError('Số lượng tệp tải lên vượt quá giới hạn (Tối đa 5 tệp/lần).'));
        }
        return next(new BadRequestError(`Lỗi tải lên tệp: ${err.message}`));
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle: (fieldName = 'file') => handleUploadError(upload.single(fieldName)),
  uploadArray: (fieldName = 'files', maxCount = 5) => handleUploadError(upload.array(fieldName, maxCount)),
  uploadImageOnly: (fieldName = 'image') => {
    const imgStorage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `img-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
      },
    });

    const imgFilter = (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestError('Chỉ được phép tải lên tệp hình ảnh (JPG, PNG, WEBP, GIF).'), false);
      }
      fileFilter(req, file, cb);
    };

    const imgUpload = multer({
      storage: imgStorage,
      fileFilter: imgFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    });

    return handleUploadError(imgUpload.single(fieldName));
  },
};
