import express from "express";
import multer from "multer";
import cors from "cors";
import xlsx from "xlsx";

const app = express();

// ✅ 允许所有来源访问
app.use(cors({
  origin: "*"  // "*" 表示任何域名都可以访问
}));

const upload = multer({ storage: multer.memoryStorage() });

// 上传并分析接口
app.post("/api/analyze", upload.single("file"), (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // 示例统计逻辑（你可以改成完整分析）
    const mathCount = data.filter(d => d.数学 >= 60).length;
    const chineseCount = data.filter(d => d.语文 >= 60).length;
    const englishCount = data.filter(d => d.英语 >= 60).length;

    res.json({
      summary: {
        math: mathCount,
        chinese: chineseCount,
        english: englishCount,
        all: data.filter(d => d.数学 >= 60 && d.语文 >= 60 && d.英语 >= 60).length
      },
      chartData: {
        labels: ["数学", "语文", "英语", "三科达标"],
        values: [mathCount, chineseCount, englishCount, data.filter(d => d.数学 >= 60 && d.语文 >= 60 && d.英语 >= 60).length]
      }
    });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));

