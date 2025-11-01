// api/index.js
const express = require('express');
const multer  = require('multer');
const cors    = require('cors');
const xlsx    = require('xlsx');

const app = express();

/* ① CORS：前端 GitHub Pages 域名 */
const ALLOW_ORIGIN = 'https://mianmianh3m.github.io';
app.use(cors({ origin: ALLOW_ORIGIN, credentials: true }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

/* ② 核心分析函数 */
function analyze(rows) {
  const subs = ['数学', '语文', '英语'];
  const sets = {};
  subs.forEach(s => sets[s] = new Set());

  rows.forEach(r => {
    subs.forEach(s => {
      if (r[s] >= 60) sets[s].add(r['姓名']);
    });
  });

  const [A, B, C] = [sets['数学'], sets['语文'], sets['英语']];
  const intersect = (a, b) => new Set([...a].filter(x => b.has(x)));

  const combos = [
    { name: '数学',           set: A },
    { name: '语文',           set: B },
    { name: '英语',           set: C },
    { name: '数学+语文',      set: intersect(A, B) },
    { name: '数学+英语',      set: intersect(A, C) },
    { name: '语文+英语',      set: intersect(B, C) },
    { name: '三科全部',       set: intersect(intersect(A, B), C) },
    { name: '三科均不达标',   set: new Set(rows.map(r => r['姓名']).filter(n => !A.has(n) && !B.has(n) && !C.has(n))) },
  ];

  return combos.map(c => ({
    combo: c.name,
    count: c.set.size,
    students: Array.from(c.set),
  }));
}

/* ③ 上传 + 分析 */
app.post('/api/analyze', upload.single('file'), (req, res) => {
  try {
    const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const data = analyze(rows);
    const classes = [...new Set(rows.map(r => r['班级']))];

    res.json({ data, classes });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/* ④ 班级列表 / 班级筛选 */
let lastRows = [];
app.get('/api/classes', (_req, res) => {
  res.json([...new Set(lastRows.map(r => r['班级']))]);
});

app.get('/api/analyze/:cls', (req, res) => {
  const cls = decodeURIComponent(req.params.cls);
  const filtered = lastRows.filter(r => r['班级'] === cls);
  if (!filtered.length) return res.status(404).json([]);
  res.json({ data: analyze(filtered) });
});

/* ⑤ 导出给 Vercel */
module.exports = app;
