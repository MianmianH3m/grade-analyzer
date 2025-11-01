// api/analyze.js (ESM)
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import xlsx from 'xlsx';

const app = express();
const ALLOW_ORIGIN = 'https://mianmianh3m.github.io';
app.use(cors({ origin: ALLOW_ORIGIN, credentials: true }));
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

/* 你的 analyze 函数完全不变 */
function analyze(rows) {
  const subs = ['数学', '语文', '英语'];
  const sets = {};
  subs.forEach(s => sets[s] = new Set());
  rows.forEach(r => {
    subs.forEach(s => { if (r[s] >= 60) sets[s].add(r['姓名']); });
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
  return combos.map(c => ({ combo: c.name, count: c.set.size, students: Array.from(c.set) }));
}

/* 路由 */
app.post('/api/analyze', upload.single('file'), (req, res) => {
  try {
    const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
    const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    res.json({ data: analyze(rows), classes: [...new Set(rows.map(r => r['班级']))] });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.listen(3001, () => {
  console.log('本地接口 http://localhost:3001/api/analyze');
});
