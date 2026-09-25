# RecoverIQ

### Intelligent Digital File Recovery & Reconstruction System

RecoverIQ is a digital file recovery and reconstruction platform designed to identify recoverable file fragments from raw binary data, reconstruct damaged or fragmented files, validate their integrity, and provide recovered artifacts through an investigation-focused interface.

---

## 🚀 Overview

When files are deleted, corrupted, fragmented, or partially damaged, recovering them can require identifying file signatures and reconstructing meaningful data from available binary fragments.

RecoverIQ provides a structured recovery pipeline:

```text
Raw Binary Evidence
        ↓
Signature Detection
        ↓
File Carving
        ↓
Fragment Discovery
        ↓
Compatibility Analysis
        ↓
Fragment Reconstruction
        ↓
Integrity Validation
        ↓
Recovered Artifact
        ↓
Download & Investigation

The system currently supports recovery candidates for:

JPEG
PNG
PDF
✨ Key Features
🔍 Binary Signature Detection

Scans raw binary data and identifies known file signatures.

Supported formats:

File Type	Header	Footer
JPEG	FF D8 FF	FF D9
PNG	PNG signature	IEND
PDF	%PDF-	%%EOF
🧩 File Carving

Extracts file candidates directly from binary data using known file signatures.

Supports:

Complete files
Partial files
Multiple files inside a single binary source
🧱 Fragment Discovery

Converts carved candidates into structured fragments containing:

Fragment ID
File type
Start offset
End offset
Size
Completion status
🔗 Compatibility Graph

Analyzes relationships between fragments to determine whether they can potentially belong to the same recovered file.

Compatibility considers:

File type
Binary position
Fragment overlap
Distance between fragments

Each compatible relationship receives a confidence score.

♻️ File Reconstruction

Builds recovery candidates by ordering compatible fragments and reconstructing their binary content.

The reconstruction engine provides:

Fragment ordering
Compatible fragment chains
Reconstruction confidence scores
File-type-based reconstruction
🔐 Integrity Validation

Recovered artifacts are validated using:

SHA-256 hashing
File header validation
File footer validation
File-type validation
Empty-file detection

Example:

SHA-256
↓
Header Check
↓
Footer Check
↓
Integrity Result
💾 Recovered File Storage

Recovered artifacts are safely stored and assigned generated filenames.

Example:

recovered_jpeg_a1b2c3d4.jpg
recovered_pdf_e5f6g7h8.pdf
📥 Artifact Download

Recovered files can be downloaded directly through the backend API.

🖥️ System Architecture

                    ┌─────────────────────┐
                    │      React UI       │
                    │  Investigation App  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     FastAPI API     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌────────────┐
        │ Scanner  │    │  Carver  │    │ Integrity  │
        └────┬─────┘    └────┬─────┘    └─────┬──────┘
             │               │                 │
             └───────────────┼─────────────────┘
                             ▼
                    ┌─────────────────┐
                    │    Fragments    │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │  Compatibility  │
                    │      Graph      │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │ Reconstruction  │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │ Recovered Files │
                    └─────────────────┘
🛠️ Technology Stack
Frontend
React
Vite
JavaScript
HTML
CSS
Backend
Python
FastAPI
Uvicorn
Recovery Engine
Binary signature analysis
File carving
Fragment analysis
Compatibility graph
Reconstruction algorithms
SHA-256 integrity validation
Testing
Pytest
FastAPI TestClient
Version Control
Git
GitHub
📁 Project Structure
RecoverIQ/
│
├── backend/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── recovery_routes.py
│   │   │
│   │   ├── core/
│   │   │   ├── scanner.py
│   │   │   ├── signatures.py
│   │   │   ├── carver.py
│   │   │   ├── fragments.py
│   │   │   ├── compatibility.py
│   │   │   ├── reconstruction.py
│   │   │   ├── integrity.py
│   │   │   └── storage.py
│   │   │
│   │   ├── models/
│   │   │   └── schemas.py
│   │   │
│   │   └── main.py
│   │
│   ├── tests/
│   │   ├── test_api.py
│   │   ├── test_carver.py
│   │   ├── test_compatibility.py
│   │   ├── test_fragments.py
│   │   ├── test_integrity.py
│   │   ├── test_reconstruction.py
│   │   ├── test_scanner.py
│   │   └── test_storage.py
│   │
│   ├── recovered/
│   ├── uploads/
│   ├── requirements.txt
│   └── README.md
│
└── frontend/
    └── React + Vite application
🌐 Backend API

Base URL during development:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs
Health Check
GET /

Returns the project status.

Example:

{
  "project": "RecoverIQ",
  "status": "running"
}
API Health
GET /health

Example:

{
  "status": "healthy"
}
Scan Evidence
POST /api/recovery/scan

Uploads binary evidence and scans it for known file signatures.

Example response:

{
  "filename": "evidence.bin",
  "size": 1024,
  "signatures_found": 2,
  "matches": [
    {
      "file_type": "jpeg",
      "offset": 120,
      "signature": "ffd8ff"
    },
    {
      "file_type": "pdf",
      "offset": 560,
      "signature": "255044462d"
    }
  ]
}
Recover Files
POST /api/recovery/recover

Runs the complete recovery pipeline:

Upload
 ↓
Scan
 ↓
Carve
 ↓
Create Fragments
 ↓
Compatibility Analysis
 ↓
Reconstruction
 ↓
Integrity Validation
 ↓
Storage

Example result:

{
  "status": "recovery_candidate_created",
  "signatures_found": 2,
  "fragments_found": 2,
  "recovered_files": 2
}

Recovery metadata includes:

File type
File size
Recovery status
Confidence score
Fragment IDs
SHA-256
Integrity status
Header validation
Footer validation
Download Recovered Artifact
GET /api/recovery/download/{filename}

Downloads a recovered artifact.

Example:

GET /api/recovery/download/recovered_jpeg_a1b2c3d4.jpg
🧪 Testing

RecoverIQ includes automated tests for the recovery engine and API.

Run:

python -m pytest

Current backend test status:

37 passed

Test coverage includes:

API endpoints
Signature scanning
JPEG/PNG/PDF carving
Partial file detection
Fragment creation
Fragment compatibility
Compatibility graph
Reconstruction
Confidence scoring
SHA-256 integrity
File validation
File storage
Artifact downloads
⚙️ Backend Setup
1. Clone the repository
git clone https://github.com/Yashaswini-2006-4/recoverQI.git
cd recoverQI
2. Open backend
cd backend
3. Create virtual environment
python -m venv venv
4. Activate virtual environment

Windows PowerShell:

.\venv\Scripts\Activate.ps1
5. Install dependencies
pip install -r requirements.txt
6. Run tests
python -m pytest
7. Start backend
uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

Swagger:

http://127.0.0.1:8000/docs
🎨 Frontend Setup

Open a second terminal and navigate to the frontend directory.

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally run at:

http://localhost:5173
🌿 Git Branch Strategy

RecoverIQ uses separate branches for team development.

main
│
├── member-1
├── member-2
└── member-3
Member 1

Recovery & Reconstruction Engine

member-1
Member 2

Frontend & Investigation Workspace

member-2
Member 3

Intelligence, Integrity & Evaluation

member-3

Changes are integrated into main after testing and review.

👥 Team Responsibilities
Member	Responsibility
Member 1	Recovery & Reconstruction Engine
Member 2	Frontend & Investigation Workspace
Member 3	Intelligence, Integrity & Evaluation
🔬 Recovery Methodology

RecoverIQ follows a signature-driven recovery approach.

Step 1 — Detection

Search binary evidence for known file signatures.

Step 2 — Carving

Extract data between recognized file headers and footers.

Step 3 — Fragment Analysis

Represent recovered candidates as structured fragments.

Step 4 — Compatibility

Determine whether fragments can potentially belong together.

Step 5 — Reconstruction

Build recovery candidates from compatible fragment chains.

Step 6 — Validation

Verify headers, footers, file type, and SHA-256.

Step 7 — Storage

Store the recovered artifact for investigation and download.

📌 Current Limitations

RecoverIQ is currently a prototype recovery and reconstruction system.

The current reconstruction approach uses:

File signatures
Binary offsets
Fragment compatibility
Distance-based scoring

Real-world forensic recovery may require additional techniques such as:

Filesystem metadata analysis
Sector-level reconstruction
Advanced JPEG structure analysis
PNG chunk validation
PDF object reconstruction
Entropy analysis
Filesystem-specific recovery methods

These can be incorporated in future versions.

🎯 Future Improvements
Advanced fragmented-file reconstruction
More file formats
Filesystem-aware recovery
Advanced corruption analysis
AI-assisted artifact classification
Recovery candidate ranking
Detailed forensic reports
Evidence visualization
Recovery confidence analytics
Benchmark datasets
🏆 Project Goal

RecoverIQ aims to transform raw binary evidence into meaningful, validated recovery candidates through an automated and explainable recovery pipeline.

DETECT
  ↓
CARVE
  ↓
ANALYZE
  ↓
RECONSTRUCT
  ↓
VALIDATE
  ↓
STORE
  ↓
RECOVER
📄 Project Status

Development Status: Active Development

Backend: Functional

Recovery Engine: Functional

Frontend: In Development / Integration

Testing: 37 backend tests passing

RecoverIQ

Recover. Reconstruct. Validate.

Built as a collaborative engineering project using modern web technologies and binary recovery techniques.


