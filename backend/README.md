# RecoverIQ — Recovery & Reconstruction Engine

RecoverIQ is a digital file recovery and reconstruction system designed to identify, carve, analyze, reconstruct, and validate recoverable files from raw binary data.

This repository contains the **Member 1 backend — Recovery & Reconstruction Engine**.

---

## 👥 Team Architecture

RecoverIQ is divided into three major modules:

### Member 1 — Recovery & Reconstruction Engine

Responsible for:

- Binary signature scanning
- File carving
- Fragment discovery
- Fragment compatibility analysis
- Compatibility graph generation
- Fragment reconstruction
- Recovery confidence scoring
- SHA-256 integrity verification
- Recovered-file storage
- Recovery API endpoints
- File downloads

### Member 2 — Frontend & Investigation Workspace

Responsible for:

- React frontend
- Evidence upload interface
- Scan/recovery progress
- Investigation workspace
- Fragment relationship visualization
- Recovered artifact table
- File previews
- Download controls

### Member 3 — Intelligence, Integrity & Evaluation

Responsible for:

- Advanced file integrity analysis
- File-format validation
- AI-assisted classification
- Recovery candidate evaluation
- Recovery reports
- Test datasets
- Benchmarks and evaluation

---

# 🏗️ Backend Architecture

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   └── recovery_routes.py
│   │
│   ├── core/
│   │   ├── scanner.py
│   │   ├── signatures.py
│   │   ├── carver.py
│   │   ├── fragments.py
│   │   ├── compatibility.py
│   │   ├── reconstruction.py
│   │   ├── integrity.py
│   │   └── storage.py
│   │
│   └── models/
│       └── schemas.py
│
├── tests/
│
├── uploads/
├── recovered/
│
├── requirements.txt
└── README.md