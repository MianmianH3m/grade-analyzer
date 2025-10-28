document.getElementById("uploadBtn").addEventListener("click", async () => {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("请先选择文件！");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  document.getElementById("result").textContent = JSON.stringify(data, null, 2);
});
