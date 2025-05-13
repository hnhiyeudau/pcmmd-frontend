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
      const res = await axios.post("https://pcmmd-backend-new.onrender.com/predict", formData);
      setResult(res.data);
    } catch (err) {
      alert("Lỗi khi gửi ảnh đến server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>🔬 Phân loại tế bào huyết tương</h1>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} style={{ marginLeft: 10 }}>
        {loading ? "Đang xử lý..." : "Gửi ảnh"}
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>✅ Kết quả dự đoán</h3>
          <p>🩸 Tế bào plasma: {result.plasma_cells}</p>
          <p>🧫 Không phải plasma: {result.non_plasma_cells}</p>

          <h4>📦 Các đối tượng phát hiện:</h4>
          <ul>
            {result.boxes.map((box, index) => (
              <li key={index}>
                {box.label} – [{box.box.map((v) => v.toFixed(1)).join(', ')}]
              </li>
            ))}
          </ul>

          {result.image_base64 && (
            <>
              <h4>🖼️ Ảnh đã xử lý:</h4>
              <img
                src={`data:image/jpeg;base64,${result.image_base64}`}
                alt="Prediction result"
                style={{ maxWidth: '100%', border: '1px solid #ccc', marginTop: 10 }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
