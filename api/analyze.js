import express from "express";
import multer from "multer";
import cors from "cors";
import xlsx from "xlsx";

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

// 上传接口
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const keys = Object.keys(data[0] || {});
    res.json({
      status: "success",
      total: data.length,
      columns: keys,
      preview: data.slice(0, 5)
    });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
