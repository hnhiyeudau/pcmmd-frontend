import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Camera } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [timeSeriesData, setTimeSeriesData] = useState([]);

  // Fetch available metrics on component mount
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8000/metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
      }
    };

    // Generate sample time series data for demonstration
    const generateTimeSeriesData = () => {
      const data = [];
      for (let i = 0; i < 24; i++) {
        data.push({
          time: i,
          area: Math.random() * 100 + 200,
          perimeter: Math.random() * 20 + 60,
          velocity: Math.random() * 0.5 + 0.2,
        });
      }
      setTimeSeriesData(data);
    };

    fetchMetrics();
    generateTimeSeriesData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setError(null);
    
    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select an image file");
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to process image");
      }
      
      setResults(data);
      setActiveTab('results');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Cell Morphology & Migration Analysis</h1>
          <p className="text-sm opacity-80">Based on research: Spatially-distributed dataset of cell morphology and migration dynamics</p>
        </div>
      </header>

      <main className="container mx-auto flex-grow p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-6">
            <div className="flex border-b">
              <button 
                className={`px-4 py-2 font-medium ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('upload')}
              >
                Upload
              </button>
              <button 
                className={`px-4 py-2 font-medium ${activeTab === 'results' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('results')}
                disabled={!results}
              >
                Results
              </button>
              <button 
                className={`px-4 py-2 font-medium ${activeTab === 'time-series' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('time-series')}
              >
                Time Series Analysis
              </button>
            </div>
          </div>

          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <h2 className="text-xl font-semibold mb-4">Upload Cell Images</h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
                    <div className="cursor-pointer flex flex-col items-center space-y-3">
                      <Camera size={48} className="text-gray-400" />
                      <span className="text-gray-600">Click to select or drag & drop images</span>
                      <span className="text-xs text-gray-500">Supported formats: JPEG, PNG, TIFF</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg">
                        Select File
                      </label>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  {preview && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Selected Image</h3>
                      <div className="max-h-96 overflow-hidden rounded-lg shadow-md">
                        <img src={preview} alt="Preview" className="w-full object-contain" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center">
                    <button 
                      onClick={handleSubmit} 
                      className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300"
                      disabled={!file || isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Analyze Image'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Available Metrics</h2>
                {metrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-blue-600">Morphological Metrics</h3>
                      <ul className="space-y-2">
                        {metrics.morphological?.map(metric => (
                          <li key={metric.id} className="flex flex-col">
                            <span className="font-medium">{metric.name} {metric.unit && `(${metric.unit})`}</span>
                            <span className="text-sm text-gray-600">{metric.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-blue-600">Migratory Metrics</h3>
                      <ul className="space-y-2">
                        {metrics.migratory?.map(metric => (
                          <li key={metric.id} className="flex flex-col">
                            <span className="font-medium">{metric.name} {metric.unit && `(${metric.unit})`}</span>
                            <span className="text-sm text-gray-600">{metric.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p>Loading metrics...</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'results' && results && (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-medium text-green-800">Analysis Complete</h3>
                <p className="text-green-700">
                  Detected {results.cell_count} cells in {results.inference_time}s
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Detection Visualization</h3>
                  <div className="border rounded-lg overflow-hidden shadow-md">
                    <img 
                      src={`data:image/png;base64,${results.visualization}`} 
                      alt="Cell Detection Results" 
                      className="w-full object-contain"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Detected Cells</h3>
                  <div className="overflow-auto max-h-96 border rounded-lg">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">ID</th>
                          <th className="px-4 py-2 text-left">Type</th>
                          <th className="px-4 py-2 text-left">Confidence</th>
                          <th className="px-4 py-2 text-left">Area</th>
                          <th className="px-4 py-2 text-left">Aspect Ratio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {results.detections.map(cell => (
                          <tr key={cell.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{cell.id}</td>
                            <td className="px-4 py-2">{cell.class}</td>
                            <td className="px-4 py-2">{(cell.confidence * 100).toFixed(1)}%</td>
                            <td className="px-4 py-2">{cell.metrics.area} px²</td>
                            <td className="px-4 py-2">{cell.metrics.aspect_ratio}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'time-series' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Time Series Analysis</h2>
              <p className="text-gray-600 mb-4">
                Track cell metrics over time using sequential images from your experiment. 
                Below is a sample visualization of cell metrics tracked over 24 hours.
              </p>
              
              <div className="bg-white p-4 rounded-lg border shadow-md">
                <h3 className="text-lg font-medium mb-4">Cell Area Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Time (hours)', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        label={{ value: 'Area (μm²)', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="area" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border shadow-md">
                  <h3 className="text-lg font-medium mb-4">Cell Perimeter Over Time</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" label={{ value: 'Time (hours)', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: 'Perimeter (μm)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="perimeter" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border shadow-md">
                  <h3 className="text-lg font-medium mb-4">Migration Velocity Over Time</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" label={{ value: 'Time (hours)', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: 'Velocity (μm/min)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="velocity" stroke="#ef4444" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center text-sm">
          <p>&copy; 2025 Cell Morphology Migration Dynamics Analysis</p>
          <p className="text-gray-400">Based on the research paper: "Spatially-distributed dataset of cell morphology and migration dynamics"</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
