const fileInput = document.getElementById("fileInput");
const fileNameSpan = document.getElementById("fileName");
const uploadBtn = document.getElementById("uploadBtn");
const resultDiv = document.getElementById("result");

fileInput.addEventListener("change", () => {
  fileNameSpan.textContent = fileInput.files[0]?.name || "";
});

const API_URL = "https://grade-analyzer.vercel.app/api/analyze"; // 线上 Vercel 后端地址

uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return alert("请先选择 Excel 文件！");

  const formData = new FormData();
  formData.append("file", file);
  resultDiv.innerHTML = "<p>正在上传并分析，请稍候...</p>";

  try {
    const res = await fetch(API_URL, { method: "POST", body: formData });
    const data = await res.json();

    if (!data.summary) {
      resultDiv.innerHTML = "<p>分析失败，请检查文件格式。</p>";
      return;
    }

    resultDiv.innerHTML = `
      <h3>容斥原理计算结果：</h3>
      <p>数学达标人数：${data.summary.math}</p>
      <p>语文达标人数：${data.summary.chinese}</p>
      <p>英语达标人数：${data.summary.english}</p>
      <p>三科达标人数：${data.summary.all}</p>
    `;

    const chart = echarts.init(document.getElementById("chart"));
    chart.setOption({
      title: { text: "达标组合人数分布" },
      tooltip: {},
      xAxis: { type: "category", data: data.chartData.labels },
      yAxis: { type: "value" },
      series: [{ name: "人数", type: "bar", data: data.chartData.values }]
    });

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "<p>上传或分析时出错，请重试。</p>";
  }
});
