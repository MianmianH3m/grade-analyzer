import express from "express";
import multer from "multer";
import cors from "cors";
import xlsx from "xlsx";

const app = express();
app.use(cors()); // 允许任意跨域

const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/analyze", upload.single("file"), (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // 简单示例统计
    let math = 0, chinese = 0, english = 0, all = 0;
    data.forEach(row => {
      if (row.Math >= 60) math++;
      if (row.Chinese >= 60) chinese++;
      if (row.English >= 60) english++;
      if (row.Math >= 60 && row.Chinese >= 60 && row.English >= 60) all++;
    });

    res.json({
      summary: { math, chinese, english, all },
      chartData: {
        labels: ["Math", "Chinese", "English", "All"],
        values: [math, chinese, english, all]
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default app;
