import express from "express";
import multer from "multer";
import cors from "cors";
import xlsx from "xlsx";

const app = express();
app.use(cors()); // 允许跨域访问

const upload = multer({ storage: multer.memoryStorage() });

// 工具：生成幂集
function powerSet(arr) {
  const result = [[]];
  for (const elem of arr) {
    const len = result.length;
    for (let i = 0; i < len; i++) {
      result.push(result[i].concat(elem));
    }
  }
  return result;
}

// 上传并分析接口
app.post("/api/analyze", upload.single("file"), (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data.length) {
      return res.status(400).json({ message: "Excel 文件为空" });
    }

    // 定义科目
    const subjects = ["数学", "语文", "英语"];

    // 计算每科达标学生名单
    const subjectSets = {};
    subjects.forEach((subj) => {
      subjectSets[subj] = data.filter((row) => row[subj] >= 60).map((row) => row["姓名"]);
    });

    // 计算容斥原理人数
    const mathSet = new Set(subjectSets["数学"]);
    const chineseSet = new Set(subjectSets["语文"]);
    const englishSet = new Set(subjectSets["英语"]);

    const allSet = new Set([...mathSet].filter((x) => chineseSet.has(x) && englishSet.has(x)));

    const summary = {
      math: mathSet.size,
      chinese: chineseSet.size,
      english: englishSet.size,
      all: allSet.size
    };

    // 幂集组合及人数
    const combos = powerSet(subjects); // [[] , ["数学"], ["语文"], ...]
    const chartData = { labels: [], values: [] };

    combos.forEach((combo) => {
      if (combo.length === 0) {
        // 空集表示三科均不达标
        const notAll = data.filter(
          (row) => row["数学"] < 60 && row["语文"] < 60 && row["英语"] < 60
        );
        chartData.labels.push("三科未达标");
        chartData.values.push(notAll.length);
      } else {
        // 求交集
        let students = new Set(subjectSets[combo[0]]);
        combo.slice(1).forEach((subj) => {
          students = new Set([...students].filter((x) => subjectSets[subj].includes(x)));
        });
        chartData.labels.push(combo.join("+"));
        chartData.values.push(students.size);
      }
    });

    res.json({
      summary,
      chartData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default app;
