# ImageGuard – Digital Image Forensics Tool

**ImageGuard** is a web-based digital image forensics tool designed to perform preliminary forensic analysis of digital images. It examines image properties, extracts available EXIF metadata, calculates cryptographic hashes, checks file format consistency, and generates Error Level Analysis (ELA) visualizations.

The goal of ImageGuard is to help users inspect digital images and identify forensic indicators that may warrant further investigation.

> **Disclaimer:** ImageGuard is a preliminary forensic analysis tool. Its results do not independently establish whether an image is authentic, manipulated, or AI-generated.

---

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Understanding the Analysis](#understanding-the-analysis)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Sample Analysis Output](#sample-analysis-output)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)

---

## Features

### 1. Image Property Extraction
Extracts basic information about an uploaded image, including:
- Image dimensions (width and height).
- Image format.
- Color mode.
- File size.

### 2. EXIF Metadata Extraction
Extracts available Exchangeable Image File Format (EXIF) metadata.

Depending on the image, this may include:
- Camera manufacturer and model.
- Date and time information.
- Image orientation.
- Resolution information.
- Software used to process the image.

### 3. SHA-256 Hash Generation
Generates a SHA-256 cryptographic hash for the uploaded image.

A hash acts as a digital fingerprint of the file. Even a small change to the file generally produces a different hash.

This can help establish whether two copies of an image are byte-for-byte identical.

### 4. File Extension and Format Verification
Compares the file extension with the actual image format detected by the image-processing library.

For example:
- Filename: `image.jpg`
- Detected format: `PNG`

Such inconsistencies are reported for further inspection.

### 5. Error Level Analysis (ELA)
Generates an ELA visualization by recompressing a JPEG image at a specified quality level and comparing it with the original.

Differences are amplified to make variations in compression error more visible.

ELA can help investigators identify regions that deserve closer examination.

### 6. Structured Analysis Report
Returns the analysis results in JSON format, including:
- Evidence identifier.
- Image properties.
- EXIF metadata.
- SHA-256 hash.
- Format consistency information.
- Observations.
- ELA availability and parameters.
- Assessment disclaimer.

---

## How It Works

ImageGuard follows a simple upload-and-analysis workflow.

1. **Image Upload:** The user selects an image through the React frontend.
2. **Backend Processing:** The image is sent to the FastAPI backend.
3. **Image Validation:** The backend checks whether the uploaded file can be processed as an image.
4. **Property Extraction:** Image dimensions, format, color mode, and file size are extracted.
5. **Metadata Extraction:** Available EXIF information is retrieved.
6. **Hash Calculation:** A SHA-256 hash is generated for the original file.
7. **Format Verification:** The filename extension is compared with the detected image format.
8. **ELA Generation:** An ELA visualization is generated for supported JPEG images.
9. **Results Display:** The frontend displays the analysis results and provides access to the ELA visualization and JSON report.

---

## Understanding the Analysis

### SHA-256 Hash

SHA-256 is a cryptographic hashing algorithm that produces a 256-bit digest, generally represented as a 64-character hexadecimal string.

For example:

`4701b2b8ad4a1bdf86791bd4f5444562acc7609e5fc1b49e52b161c99f1f7a07`

If two files produce the same SHA-256 hash, they are considered identical for practical file-integrity verification purposes.

However, a hash alone cannot determine whether an image is original or manipulated. It is most useful when compared against a previously recorded trusted hash.

### EXIF Metadata

EXIF metadata stores information associated with an image, often including camera details, timestamps, and orientation.

Metadata can provide useful context about an image's history, but it should not be treated as proof of authenticity.

EXIF data can be modified, removed, or rewritten by image-processing software.

### Error Level Analysis (ELA)

JPEG images use lossy compression. When an image is recompressed, different regions may exhibit different compression errors.

ImageGuard:
1. Opens the original JPEG image.
2. Recompresses it at JPEG quality 90.
3. Calculates the pixel differences between the original and recompressed versions.
4. Amplifies those differences by a factor of 10.
5. Produces an ELA visualization.

Brighter regions indicate larger differences in the comparison image. These differences can have several explanations, including edges, textures, compression history, or editing.

**Important:** Bright regions do not automatically indicate image manipulation. ELA is an investigative aid, not a definitive manipulation detector.

---

## Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React | User interface |
| Frontend tooling | Vite | Development server and build tooling |
| Styling | CSS | Responsive interface |
| Icons | Lucide React | Interface icons |
| Backend | Python | Analysis logic |
| API framework | FastAPI | Backend API |
| Image processing | Pillow | Image loading, properties, EXIF, and ELA |
| File integrity | hashlib | SHA-256 calculation |
| Data exchange | JSON | Structured analysis results |

---

## Project Structure

```text
ImageGuard/
│
├── backend/
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       │
│       └── services/
│           ├── __init__.py
│           ├── hashing.py
│           ├── ela.py
│           └── image_analysis.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── evidence/
├── artifacts/
├── .gitignore
└── README.md
```

### Backend Modules

| File | Responsibility |
|---|---|
| `main.py` | Initializes FastAPI, configures CORS, and defines API endpoints |
| `config.py` | Defines application directories and file-size configuration |
| `image_analysis.py` | Coordinates image analysis operations |
| `hashing.py` | Calculates SHA-256 hashes |
| `ela.py` | Generates Error Level Analysis images |

### Frontend

The React frontend handles image selection, upload, previews, analysis results, ELA visualization, and JSON report downloads.

---

## Installation and Setup

### Prerequisites

Install the following before running ImageGuard:

- Python 3.10 or newer.
- Node.js and npm.
- Git (optional, for cloning the repository).

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ImageGuard.git
cd ImageGuard
```

Replace `YOUR_USERNAME` with the GitHub username that owns the repository.

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

If you are installing dependencies individually:

```bash
pip install fastapi "uvicorn[standard]" python-multipart Pillow
```

### 3. Set Up the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the Node.js dependencies:

```bash
npm install
```

---

## Running the Application

ImageGuard requires both the backend and frontend development servers to be running.

### Start the Backend

From the `backend` directory, activate the virtual environment if necessary and run:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend API:

`http://localhost:8000`

Interactive API documentation:

`http://localhost:8000/docs`

### Start the Frontend

From the `frontend` directory, run:

```bash
npm run dev
```

Frontend:

`http://localhost:5173`

Open the frontend URL in your browser to use ImageGuard.

### Accessing ImageGuard from a Mobile Device

To access the application from a phone:

1. Connect your phone and computer to the same Wi-Fi network.
2. Find your computer's local IPv4 address using:

```powershell
ipconfig
```

3. Start the backend so it accepts connections from the local network:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

4. Start the frontend with network access enabled:

```bash
npm run dev -- --host 0.0.0.0
```

5. Open the frontend using your computer's local IP address:

`http://YOUR_PC_IP:5173`

The frontend API configuration must use the browser's hostname to communicate with the backend:

```javascript
const API_BASE_URL = `http://${window.location.hostname}:8000`;
```

Ensure that your firewall permits the required local network connections.

---

## API Endpoints

ImageGuard exposes the following API endpoints.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/analyze` | Uploads an image and performs forensic analysis |
| GET | `/api/analysis/{evidence_id}/ela` | Retrieves the generated ELA visualization |

### POST `/analyze`

Accepts an image through a multipart/form-data request.

**Request parameter:**
- `file`: Image file to analyze.

**Response:**

Returns a JSON object containing the evidence identifier, image properties, EXIF metadata, SHA-256 hash, observations, ELA information, and assessment note.

### GET `/api/analysis/{evidence_id}/ela`

Retrieves the ELA visualization associated with an analyzed image.

---

## Sample Analysis Output

The following is a simplified example of the kind of information returned by ImageGuard:

```json
{
  "evidence_id": "example-id",
  "filename": "sample.jpg",
  "file_size": 1821828,
  "properties": {
    "format": "JPEG",
    "width": 3264,
    "height": 2448,
    "mode": "RGB"
  },
  "hash": {
    "algorithm": "SHA-256",
    "value": "example-sha256-hash"
  },
  "exif": {
    "Make": "Samsung",
    "Model": "SM-M317F"
  },
  "observations": [
    "No basic metadata or extension inconsistency detected."
  ],
  "ela": {
    "available": true,
    "quality": 90,
    "scale": 10
  }
}
```

*This is an illustrative example, not a guaranteed exact API response schema.*

---

## Limitations

ImageGuard is designed for preliminary digital image inspection. Its current implementation has the following limitations:

- ELA is currently supported for JPEG images only.
- EXIF metadata may be missing, modified, or removed.
- SHA-256 verifies file integrity when a trusted comparison hash is available; it does not identify image manipulation.
- Extension and format mismatches indicate inconsistencies, not necessarily malicious activity.
- ELA patterns are not definitive evidence of editing.
- The application does not currently provide automated AI-generated image detection.
- The application does not conclusively identify manipulated regions or establish image authenticity.

Results should be interpreted alongside other forensic evidence and investigation methods.

---

## Future Improvements

Potential areas for further development include:

- Additional image forensic analysis techniques.
- Support for more image formats in forensic comparisons.
- Image metadata timeline and visualization.
- Reference hash comparison for integrity verification.
- More advanced forensic reporting.
- Integration of additional image manipulation analysis methods.

---

## Author

**ImageGuard – Digital Image Forensics Tool**

Developed as an academic mini-project to explore digital image analysis, file integrity verification, metadata extraction, and preliminary image forensics.

---

## License

This project is intended for educational and research purposes. A formal open-source license can be added if the project is to be distributed or reused by others.
