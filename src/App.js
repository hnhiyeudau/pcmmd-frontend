import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Vui lòng chọn ảnh!");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("https://pcmmd-api.onrender.com", formData);
      setResult(res.data);
    } catch (err) {
      alert("Lỗi khi gửi ảnh đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🔬 Phân loại tế bào huyết tương</h1>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} style={{ marginLeft: 10 }}>
        {loading ? "Đang xử lý..." : "Gửi ảnh"}
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Kết quả: {result.label}</h3>
          <p>Độ tin cậy: {result.confidence}%</p>
        </div>
      )}
    </div>
  );
}

export default App;
