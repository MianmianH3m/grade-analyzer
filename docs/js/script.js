// public/js/index.js
const API_URL = '/api/analyze';   // ✅ 同域相对路径，无需隧道

const fileInput = document.getElementById('fileInput');
const fileName  = document.getElementById('fileName');
const uploadBtn = document.getElementById('uploadBtn');
const resultBox = document.getElementById('result');
const chartDiv  = document.getElementById('chart');

fileInput.addEventListener('change', e => {
  fileName.textContent = e.target.files[0] ? e.target.files[0].name : '';
});

uploadBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) return alert('请先选择一个 Excel 文件！');
  uploadBtn.disabled = true;
  uploadBtn.textContent = '分析中...';

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(API_URL, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`服务器响应错误：${res.status}`);
    const json = await res.json();

    /* 展示文本结果 */
    resultBox.innerHTML = `
      <h3>分析结果</h3>
      <p><strong>班级列表：</strong>${json.classes.join('、')}</p>
      <table border="1" cellpadding="6">
        <thead><tr><th>达标组合</th><th>人数</th><th>学生名单</th></tr></thead>
        <tbody>
          ${json.data.map(d => `
            <tr>
              <td>${d.combo}</td>
              <td>${d.count}</td>
              <td>${d.students.join('、')||'无'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    `;

    /* 画柱状图 */
    drawChart(json.data);
  } catch (err) {
    console.error(err);
    alert('分析失败，请查看控制台日志。');
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = '上传并分析';
  }
});

function drawChart(data) {
  const chart = echarts.init(chartDiv);
  const option = {
    title: { text: '达标组合人数分布', left: 'center' },
    tooltip: {},
    xAxis: { type: 'category', data: data.map(d => d.combo) },
    yAxis: { type: 'value', name: '人数' },
    series: [{ type: 'bar', data: data.map(d => d.count), color: '#4a90e2' }]
  };
  chart.setOption(option);
}
