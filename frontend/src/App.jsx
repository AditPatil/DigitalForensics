
import { useRef, useState } from "react";
import { analyzeImage, getElaUrl } from "./services/api";
import {
  Shield, Upload, Image as ImageIcon, FileSearch, Fingerprint,
  Camera, ScanSearch, Download, RefreshCw, CheckCircle2,
  AlertCircle, FileImage
} from "lucide-react";
import "./App.css";

function App() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFile(selectedFile) {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  }

  function handleDrop(event) {
    event.preventDefault();
    handleFile(event.dataTransfer.files[0]);
  }

  async function handleAnalyze() {
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const data = await analyzeImage(file);
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function resetAnalysis() {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function downloadReport() {
    if (!result) return;

    const blob = new Blob(
      [JSON.stringify(result, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ImageGuard_${result.evidence_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const observations = result?.observations || [];

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon"><Shield size={22} /></div>
          <span>Image<span className="brand-accent">Guard</span></span>
        </div>
        <div className="nav-status">
          <span className="status-dot"></span>
          Forensic Analysis Tool
        </div>
      </header>

      <main className="main-container">
        <section className="hero">
          <div className="eyebrow">DIGITAL IMAGE FORENSICS</div>
          <h1>Examine your images.<br /><span>Discover the details.</span></h1>
          <p>
            Analyse image properties, metadata, file integrity and
            compression differences in one place.
          </p>
        </section>

        <section className="upload-section">
          <div className="section-heading">
            <div>
              <h2>Image Analysis</h2>
              <p>Upload an image to begin forensic examination.</p>
            </div>
            {file && (
              <button className="text-button" onClick={resetAnalysis}>
                <RefreshCw size={15} /> Reset
              </button>
            )}
          </div>

          {!file ? (
            <div
              className="upload-box"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <div className="upload-icon"><Upload size={27} /></div>
              <h3>Drop your image here</h3>
              <p>or click to browse files</p>
              <span className="file-types">JPEG · PNG · WEBP · BMP · TIFF</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="selected-image">
              <img src={preview} alt="Selected image preview" />
              <div className="selected-info">
                <div className="file-icon"><FileImage size={22} /></div>
                <div className="file-details">
                  <strong>{file.name}</strong>
                  <span>{(file.size / 1024).toFixed(2)} KB</span>
                </div>
                <button className="text-button" onClick={() => fileInputRef.current.click()}>
                  Change
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle size={17} /> {error}
            </div>
          )}

          {file && !result && (
            <button
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <><RefreshCw size={17} className="spin" /> Analysing image...</>
              ) : (
                <><ScanSearch size={18} /> Analyse Image</>
              )}
            </button>
          )}
        </section>

        {result && (
          <section className="results-section">
            <div className="results-heading">
              <div>
                <div className="eyebrow">ANALYSIS COMPLETE</div>
                <h2>Analysis Results</h2>
              </div>
              <button className="download-button" onClick={downloadReport}>
                <Download size={16} /> Export JSON
              </button>
            </div>

            <div className="result-grid">
              <div className="result-card">
                <div className="card-icon blue"><ImageIcon /></div>
                <span>Image Format</span>
                <strong>{result.detected_format || "Unknown"}</strong>
              </div>
              <div className="result-card">
                <div className="card-icon purple"><FileSearch /></div>
                <span>Resolution</span>
                <strong>
                  {result.dimensions_pixels?.width} × {result.dimensions_pixels?.height}
                </strong>
              </div>
              <div className="result-card">
                <div className="card-icon green"><Fingerprint /></div>
                <span>SHA-256</span>
                <strong className="small-value">Generated</strong>
              </div>
              <div className="result-card">
                <div className="card-icon orange"><Camera /></div>
                <span>EXIF Metadata</span>
                <strong>{Object.keys(result.exif_metadata || {}).length} fields</strong>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-title">
                <FileSearch size={19} />
                <h3>Image Properties</h3>
              </div>
              <div className="property-list">
                <Property label="Filename" value={result.file_name} />
                <Property label="File size" value={`${(result.file_size_bytes / 1024).toFixed(2)} KB`} />
                <Property label="Extension" value={result.file_extension} />
                <Property label="Detected format" value={result.detected_format} />
                <Property label="Colour mode" value={result.color_mode} />
                <Property label="Dimensions" value={`${result.dimensions_pixels?.width} × ${result.dimensions_pixels?.height}`} />
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-title">
                <Fingerprint size={19} />
                <h3>File Integrity</h3>
              </div>
              <p className="field-label">SHA-256 HASH</p>
              <div className="hash-value">{result.sha256}</div>
              <p className="helper-text">
                This fingerprint can be used to check whether another file
                has exactly the same contents.
              </p>
            </div>

            <div className="detail-card">
              <div className="detail-title">
                <Camera size={19} />
                <h3>EXIF Metadata</h3>
              </div>
              {Object.keys(result.exif_metadata || {}).length > 0 ? (
                <div className="property-list">
                  {Object.entries(result.exif_metadata).map(([key, value]) => (
                    <Property key={key} label={key} value={String(value)} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Camera size={22} />
                  <span>No EXIF metadata found.</span>
                </div>
              )}
            </div>

            <div className="detail-card">
              <div className="detail-title">
                <ScanSearch size={19} />
                <h3>Error Level Analysis</h3>
                <span className={`mini-status ${result.ela?.available ? "available" : ""}`}>
                  {result.ela?.available ? "Generated" : "Unavailable"}
                </span>
              </div>
              {result.ela?.available ? (
                <>
                  <div className="ela-image">
                    <img src={getElaUrl(result.ela.image_url)} alt="ELA analysis output" />
                  </div>
                  <div className="ela-info">
                    <span>JPEG quality: {result.ela.quality}</span>
                    <span>Amplification: {result.ela.scale}×</span>
                  </div>
                  <p className="helper-text">
                    Brighter areas represent larger compression differences.
                    These differences are not proof of image manipulation.
                  </p>
                </>
              ) : (
                <div className="empty-state">
                  <span>{result.ela?.reason || "ELA is not available for this image."}</span>
                </div>
              )}
            </div>

            <div className="detail-card">
              <div className="detail-title">
                <CheckCircle2 size={19} />
                <h3>Observations</h3>
              </div>
              {observations.length ? (
                observations.map((item, index) => (
                  <div className="observation" key={index}>
                    <CheckCircle2 size={16} /> {item}
                  </div>
                ))
              ) : (
                <p className="helper-text">No additional observations returned.</p>
              )}
            </div>

            <div className="assessment-note">
              <AlertCircle size={19} />
              <p>{result.assessment_note}</p>
            </div>

            <p className="evidence-id">Evidence ID: {result.evidence_id}</p>
          </section>
        )}
      </main>

      <footer>
        <Shield size={15} /> ImageGuard <span>·</span> Digital Image Forensics
      </footer>
    </div>
  );
}

function Property({ label, value }) {
  return (
    <div className="property-row">
      <span>{label}</span>
      <strong>{value ?? "Not available"}</strong>
    </div>
  );
}

export default App;
