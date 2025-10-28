const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const resultDiv = document.getElementById("result");

const API_URL = "https://grade-analyzer.vercel.app/api/analyze"; // ← 替换成你的后端网址

uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("请先选择一个 Excel 文件！");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  resultDiv.innerHTML = "<p>正在上传并分析，请稍候...</p>";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    console.log(data);

    if (!data.summary) {
      resultDiv.innerHTML = "<p>分析失败，请检查文件格式。</p>";
      return;
    }

    // 显示统计信息
    resultDiv.innerHTML = `
      <h3>容斥原理计算结果：</h3>
      <p>数学达标人数：${data.summary.math}</p>
      <p>语文达标人数：${data.summary.chinese}</p>
      <p>英语达标人数：${data.summary.english}</p>
      <p>三科达标人数：${data.summary.all}</p>
    `;

    // 绘制图表
    const chart = echarts.init(document.getElementById("chart"));
    chart.setOption({
      title: { text: "达标组合人数分布" },
      tooltip: {},
      xAxis: { type: "category", data: data.chartData.labels },
      yAxis: { type: "value" },
      series: [
        {
          name: "人数",
          type: "bar",
          data: data.chartData.values
        }
      ]
    });
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "<p>上传或分析时出错，请重试。</p>";
  }
});
