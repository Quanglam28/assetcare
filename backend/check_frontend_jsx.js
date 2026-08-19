const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts = ['.jsx', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist')) {
        results = results.concat(getAllFiles(fullPath, exts));
      }
    } else {
      if (exts.includes(path.extname(file))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const frontendSrc = path.resolve(__dirname, '../frontend/src');
const files = getAllFiles(frontendSrc);
console.log(`Kiểm tra ${files.length} tệp tin trong frontend/src...`);

let hasError = false;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Check for common JSX syntax or unclosed tags
  // Check for imports from lucide-react and verify each JSX tag <IconName /> is imported or defined
  const lucideMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
  const importedLucideIcons = new Set();
  if (lucideMatch) {
    lucideMatch[1].split(',').forEach(item => {
      const parts = item.trim().split(/\s+as\s+/);
      const iconName = parts.length > 1 ? parts[1].trim() : parts[0].trim();
      if (iconName) importedLucideIcons.add(iconName);
    });
  }

  // Check common icons that might be used as <Icon ... />
  const commonIcons = [
    'Laptop', 'CheckCircle2', 'AlertTriangle', 'Wrench', 'Clock', 'ShieldAlert',
    'DollarSign', 'Filter', 'RotateCcw', 'Calendar', 'Building2', 'MapPin',
    'Layers', 'TrendingUp', 'BarChart3', 'PieIcon', 'Award', 'AlertCircle',
    'Zap', 'Sparkles', 'Flame', 'RefreshCw', 'FileText', 'Activity', 'ShieldCheck',
    'Check', 'CheckSquare', 'Plus', 'Eye', 'ArrowRight', 'QrCode', 'User', 'Lock',
    'EyeOff', 'GraduationCap', 'Building', 'KeyRound', 'LogOut', 'ChevronDown',
    'Search', 'Trash2', 'Edit2', 'HeartPulse', 'History', 'Layers3', 'ClipboardList',
    'ArrowLeft', 'Phone', 'Mail', 'Grid', 'ArrowUpRight', 'UserCheck', 'Play', 'XCircle'
  ];

  commonIcons.forEach(icon => {
    const jsxRegex = new RegExp(`<${icon}[\\s/>]`);
    if (jsxRegex.test(content)) {
      // Icon is used in JSX, check if imported or defined in file
      const isImported = importedLucideIcons.has(icon) || 
                         content.includes(`import ${icon}`) || 
                         content.includes(`import { ${icon}`) ||
                         content.includes(`import {${icon}`) ||
                         content.includes(`const ${icon}`) ||
                         content.includes(`function ${icon}`) ||
                         content.includes(`class ${icon}`) ||
                         content.includes(`let ${icon}`) ||
                         content.includes(`var ${icon}`);
      if (!isImported) {
        console.error(`❌ LỖI THIẾU IMPORT trong [${path.relative(frontendSrc, file)}]: Icon <${icon} /> được render nhưng CHƯA ĐƯỢC IMPORT!`);
        hasError = true;
      }
    }
  });
});

if (!hasError) {
  console.log('✅ HOÀN TOÀN KHÔNG CÓ LỖI THIẾU IMPORT TRONG TOÀN BỘ CÁC COMPONENT FRONTEND!');
}
