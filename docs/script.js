const fileInput = document.getElementById("fileInput");
const fileNameSpan = document.getElementById("fileName");
const uploadBtn = document.getElementById("uploadBtn");
const resultDiv = document.getElementById("result");

fileInput.addEventListener("change", () => {
  fileNameSpan.textContent = fileInput.files[0]?.name || "";
});

const API_URL = 'https://consultants-rank-steel-inclusion.trycloudflare.com/api/analyze';
uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return alert("请先选择 Excel 文件！");

  const formData = new FormData();
  formData.append("file", file);
  resultDiv.innerHTML = "<p>正在上传并分析，请稍候...</p>";

  try {
    const res = await fetch(API_URL, { method: "POST", body: formData });
    const json = await res.json();
    if (!json.data) throw new Error("格式错误");

    /* 渲染容斥结果 */
    let html = "<h3>容斥原理计算结果</h3><table border='1' cellpadding='6'>";
    html += "<tr><th>达标组合</th><th>人数</th><th>学生名单</th></tr>";
    json.data.forEach((item) => {
      html += `<tr>
                 <td>${item.combo}</td>
                 <td>${item.count}</td>
                 <td>${item.students.join("、") || "无"}</td>
               </tr>`;
    });
    html += "</table>";
    resultDiv.innerHTML = html;

    /* ECharts 柱状图 */
    const chart = echarts.init(document.getElementById("chart"));
    chart.setOption({
      title: { text: "达标组合人数分布" },
      tooltip: {},
      xAxis: { type: "category", data: json.data.map((d) => d.combo) },
      yAxis: { type: "value" },
      series: [{ name: "人数", type: "bar", data: json.data.map((d) => d.count) }],
    });
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "<p>上传或分析时出错，请重试。</p>";
  }
});
