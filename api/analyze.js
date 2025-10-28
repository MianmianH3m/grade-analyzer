import express from "express";
import multer from "multer";
import cors from "cors";
import xlsx from "xlsx";

const app = express();

// ✅ 允许所有来源访问
app.use(cors({
  origin: "*"  // "*" 表示任意域名都可以访问
}));

const upload = multer({ storage: multer.memoryStorage() });

// 上传并分析接口
app.post("/api/analyze", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "没有上传文件" });
    }

    const buffer = req.file.buffer;
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data.length) {
      return res.status(400).json({ status: "error", message: "Excel 文件为空或格式不对" });
    }

    // 计算单科达标人数和三科达标人数
    const mathSet = data.filter(d => d.数学 >= 60).map(d => d.姓名);
    const chineseSet = data.filter(d => d.语文 >= 60).map(d => d.姓名);
    const englishSet = data.filter(d => d.英语 >= 60).map(d => d.姓名);

    const allSet = data.filter(d => d.数学 >= 60 && d.语文 >= 60 && d.英语 >= 60).map(d => d.姓名);

    // 构建返回数据
    const summary = {
      math: mathSet.length,
      chinese: chineseSet.length,
      english: englishSet.length,
      all: allSet.length
    };

    const chartData = {
      labels: ["数学", "语文", "英语", "三科达标"],
      values: [summary.math, summary.chinese, summary.english, summary.all]
    };

    res.json({ summary, chartData });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

export default app;
