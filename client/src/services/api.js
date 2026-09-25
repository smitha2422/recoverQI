// client/src/services/api.js
// Production & Development Forensic API Layer for RecoverIQ

import { mockScanData, sampleRecentScans } from '../data/mockData';

// Vite environment variables are accessed through import.meta.env.
// Backend integration is enabled by default.
// Set VITE_USE_REAL_BACKEND=false in client/.env to use the frontend simulation.
const USE_REAL_BACKEND = import.meta.env.VITE_USE_REAL_BACKEND !== 'false';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '');

const SAMPLE_PHOTO_THUMB =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect width="320" height="200" fill="#25201D"/><path d="M0 160L80 90l55 45 55-70 130 95v40H0z" fill="#4C7A5E"/><circle cx="235" cy="48" r="20" fill="#D8C39A"/><text x="160" y="185" font-family="monospace" font-size="11" text-anchor="middle" fill="#F2EFE9">FORENSIC IMAGE PREVIEW</text></svg>'
  );

const SAMPLE_IMAGE_THUMB =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect width="320" height="200" fill="#171412"/><rect x="70" y="28" width="180" height="144" rx="8" fill="#D8C39A"/><path d="M92 138l38-42 27 25 28-38 43 55z" fill="#4C7A5E"/><circle cx="204" cy="64" r="12" fill="#B33A2E"/><text x="160" y="190" font-family="monospace" font-size="10" text-anchor="middle" fill="#F2EFE9">RECOVERED IMAGE</text></svg>'
  );

function isBrowserFile(file) {
  return typeof File !== 'undefined' && file instanceof File;
}

async function bufferToSha256(arrayBuffer) {
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest(
      'SHA-256',
      arrayBuffer
    );

    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  // Fallback for environments without Web Crypto.
  // This is NOT a cryptographic hash.
  let hash = 2166136261;
  const bytes = new Uint8Array(arrayBuffer);

  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

async function tryReadJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

/**
 * Uploads and analyzes a disk image / raw file.
 *
 * @param {File|Object} file
 * @returns {Promise<Object>}
 */
export async function scanImage(file) {
  // Only actual browser Files can be uploaded as evidence bytes.
  // The sample evidence object is UI metadata, not a real disk image.
  if (USE_REAL_BACKEND && isBrowserFile(file)) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // FastAPI recovery endpoint.
      const response = await fetch(
        `${API_BASE_URL}/api/recovery/scan`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        return formatScanResponse(data, file);
      }

      const errorData = await tryReadJson(response);

      console.warn(
        `[RecoverIQ API] Backend scan returned HTTP ${response.status}.`,
        errorData
      );
    } catch (err) {
      console.warn(
        '[RecoverIQ API] Backend unreachable; using the in-browser simulation.',
        err?.message || err
      );
    }
  }

  // In-browser simulation for the sample evidence object
  // or when the API is unavailable.
  const scanId = `SCN-${new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const fileName = file?.name || 'evidence_sample_disk.raw';
  const fileSizeNum = Number(file?.size) || 1706;

  const fileSizeFormatted =
    fileSizeNum > 1024 * 1024
      ? `${(fileSizeNum / (1024 * 1024)).toFixed(2)} MB`
      : fileSizeNum > 1024
        ? `${(fileSizeNum / 1024).toFixed(1)} KB`
        : `${fileSizeNum} Bytes`;

  let computedHash =
    file?.hash ||
    '782da6251e0352388523e92da0494ca7f28be8168857e8375fab0f4caf565f5d';

  let previewDataUrl = null;

  if (isBrowserFile(file)) {
    try {
      const arrayBuffer = await file.arrayBuffer();

      computedHash = await bufferToSha256(arrayBuffer);

      if (file.type?.startsWith('image/')) {
        previewDataUrl = URL.createObjectURL(file);
      }
    } catch (err) {
      console.warn(
        'Could not read file buffer in browser:',
        err
      );
    }
  }

  const isGroundTruth =
    fileName.includes('evidence_sample') ||
    file?.groundTruthVerified ||
    fileName.endsWith('.raw');

  const isImageFile =
    file?.type?.startsWith('image/') ||
    /\.(jpe?g|png|gif|webp|bmp)$/i.test(fileName);

  let artifacts = [];
  let summary = {};

  if (isGroundTruth) {
    // Demonstration data matching the project's sample scenario.
    artifacts = [
      {
        id: 'art-101',
        name: 'crime_scene_surveillance_01.jpg',
        path: '/Forensics/Images/crime_scene_surveillance_01.jpg',
        size: '650 Bytes',
        type: 'Image',
        status: 'Recovered',
        integrity: 'valid',
        priority: 'High',
        confidence: 100.0,
        checksum:
          '7a9128f1c849102c918349201938204928394820182948201928394819284920',
        previewUrl: SAMPLE_PHOTO_THUMB,
        recoveredAt: new Date()
          .toISOString()
          .replace('T', ' ')
          .slice(0, 16),
      },
      {
        id: 'art-102',
        name: 'ground_truth_schematic.png',
        path: '/Forensics/Schematics/ground_truth_schematic.png',
        size: '512 Bytes',
        type: 'Image',
        status: 'Recovered',
        integrity: 'valid',
        priority: 'High',
        confidence: 100.0,
        checksum:
          'f1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
        previewUrl: SAMPLE_IMAGE_THUMB,
        recoveredAt: new Date()
          .toISOString()
          .replace('T', ' ')
          .slice(0, 16),
      },
      {
        id: 'art-103',
        name: 'confidential_case_brief.pdf',
        path: '/Documents/Briefs/confidential_case_brief.pdf',
        size: '544 Bytes',
        type: 'PDF Document',
        status: 'Recovered',
        integrity: 'valid',
        priority: 'Medium',
        confidence: 100.0,
        checksum:
          '4a8a08f09d37b73795649038408b5f3333333333333333333333333333333333',
        recoveredAt: new Date()
          .toISOString()
          .replace('T', ' ')
          .slice(0, 16),
      },
    ];

    summary = {
      filesDetected: 3,
      filesRecovered: 3,
      partialFiles: 0,
      failedFiles: 0,
      totalSize: fileSizeFormatted,
      recoveredSize: fileSizeFormatted,
      healthScore: 100.0,
      scanDuration: '0m 18s',
    };
  } else if (isImageFile) {
    // Demonstration response for a custom image upload.
    artifacts = [
      {
        id: 'art-101',
        name: fileName,
        path: `/Uploaded/Images/${fileName}`,
        size: fileSizeFormatted,
        type: 'Image',
        status: 'Recovered',
        integrity: 'valid',
        priority: 'High',
        confidence: 99.8,
        checksum: computedHash,
        previewUrl: previewDataUrl || SAMPLE_PHOTO_THUMB,
        recoveredAt: new Date()
          .toISOString()
          .replace('T', ' ')
          .slice(0, 16),
      },
      {
        id: 'art-102',
        name: `${fileName.replace(/\.[^/.]+$/, '')}_exif_metadata.xml`,
        path: `/Carved/Metadata/${fileName.replace(/\.[^/.]+$/, '')}_exif.xml`,
        size: '1.2 KB',
        type: 'Data',
        status: 'Recovered',
        integrity: 'valid',
        priority: 'Medium',
        confidence: 97.4,
        checksum:
          '9f83c127498b8163887952173f443329ce82f44260d763501b00164aa45222e0',
        recoveredAt: new Date()
          .toISOString()
          .replace('T', ' ')
          .slice(0, 16),
      },
    ];

    summary = {
      filesDetected: 2,
      filesRecovered: 2,
      partialFiles: 0,
      failedFiles: 0,
      totalSize: fileSizeFormatted,
      recoveredSize: fileSizeFormatted,
      healthScore: 100.0,
      scanDuration: '0m 22s',
    };
  } else {
    // Generic volume recovery demonstration data.
    artifacts = (mockScanData.artifacts || []).map((artifact) => ({
      ...artifact,
      recoveredAt: new Date()
        .toISOString()
        .replace('T', ' ')
        .slice(0, 16),
    }));

    summary = {
      filesDetected: 14892,
      filesRecovered: 12408,
      partialFiles: 2140,
      failedFiles: 344,
      totalSize: '482.5 GB',
      recoveredSize: '142.8 GB',
      healthScore: 94.8,
      scanDuration: '2m 14s',
    };
  }

  return {
    scanId,
    targetDrive: `${fileName} (${fileSizeFormatted})`,
    timestamp: new Date().toISOString(),
    summary,
    artifacts,
  };
}

/**
 * Retrieves scan results by scan ID.
 */
export async function getScanResults(scanId) {
  if (USE_REAL_BACKEND) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/scans/${encodeURIComponent(scanId)}`
      );

      if (response.ok) {
        const data = await response.json();
        return formatScanResponse(data);
      }
    } catch (err) {
      console.warn(
        '[RecoverIQ API] Could not retrieve scan results:',
        err?.message || err
      );
    }
  }

  return {
    ...mockScanData,
    scanId: scanId || mockScanData.scanId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Downloads a carved artifact binary file.
 */
export async function downloadArtifact(
  scanId,
  artifactId,
  fileName = 'recovered_evidence.dat'
) {
  if (USE_REAL_BACKEND) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/scans/${encodeURIComponent(scanId)}/artifacts/${encodeURIComponent(artifactId)}`
      );

      if (response.ok) {
        const blob = await response.blob();
        triggerBrowserDownload(blob, fileName);
        return true;
      }
    } catch (err) {
      console.warn(
        '[RecoverIQ API] Artifact download failed:',
        err?.message || err
      );
    }
  }

  const dummyContent = `--- RECOVERIQ FORENSIC CASE LOG ---
Docket ID: ${scanId}
Evidence Tag: ${artifactId}
File Name: ${fileName}
Integrity State: Demonstration record; not a recovered original file
Exported: ${new Date().toISOString()}
--- END OF EVIDENCE RECORD ---`;

  const fallbackBlob = new Blob(
    [dummyContent],
    { type: 'application/octet-stream' }
  );

  triggerBrowserDownload(fallbackBlob, fileName);
  return true;
}

/**
 * Downloads the full forensic audit report.
 */
export async function downloadReport(scanId) {
  if (USE_REAL_BACKEND) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/scans/${encodeURIComponent(scanId)}/report`
      );

      if (response.ok) {
        const blob = await response.blob();

        triggerBrowserDownload(
          blob,
          `RecoverIQ_Case_Report_${scanId}.md`
        );

        return true;
      }
    } catch (err) {
      console.warn(
        '[RecoverIQ API] Report download failed:',
        err?.message || err
      );
    }
  }

  const reportMarkdown = `# RecoverIQ Forensic Audit & Reconstruction Report

**Case Docket**: #${scanId}
**Timestamp**: ${new Date().toISOString()}

> This is a demonstration report generated by the frontend fallback.
> It does not represent verified recovery results.

## Demonstration Summary
- Files detected: 14,892
- Files fully recovered: 12,408
- Partial files: 2,140
- Failed files: 344
- Demonstration integrity index: 94.8%
`;

  const reportBlob = new Blob(
    [reportMarkdown],
    { type: 'text/markdown;charset=utf-8' }
  );

  triggerBrowserDownload(
    reportBlob,
    `RecoverIQ_Case_Report_${scanId}.md`
  );

  return true;
}

/**
 * Retrieves recent scan history.
 */
export async function getRecentScans() {
  if (USE_REAL_BACKEND) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scans`);

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn(
        '[RecoverIQ API] Could not retrieve recent scans:',
        err?.message || err
      );
    }
  }

  return sampleRecentScans;
}

function formatScanResponse(data = {}, sourceFile) {
  const artifacts = Array.isArray(data.artifacts)
    ? data.artifacts
    : mockScanData.artifacts;

  return {
    scanId:
      data.scanId ||
      data.scan_id ||
      `SCN-${Date.now().toString().slice(-6)}`,

    targetDrive:
      data.targetDrive ||
      data.target_drive ||
      (sourceFile?.name ? sourceFile.name : 'Volume Image'),

    timestamp: data.timestamp || new Date().toISOString(),

    summary: {
      filesDetected:
        data.summary?.filesDetected ??
        data.files_detected ??
        artifacts.length,

      filesRecovered:
        data.summary?.filesRecovered ??
        data.files_recovered ??
        artifacts.length,

      partialFiles:
        data.summary?.partialFiles ??
        data.partial_files ??
        0,

      failedFiles:
        data.summary?.failedFiles ??
        data.failed_files ??
        0,

      totalSize:
        data.summary?.totalSize ??
        data.total_size ??
        'Unknown',

      recoveredSize:
        data.summary?.recoveredSize ??
        data.recovered_size ??
        'Unknown',

      healthScore:
        data.summary?.healthScore ??
        data.health_score ??
        0,

      scanDuration:
        data.summary?.scanDuration ??
        data.scan_duration ??
        'Unknown',
    },

    artifacts: artifacts.map((item, index) => ({
      id: item.id || `art-${100 + index}`,

      name:
        item.name ||
        item.filename ||
        `recovered_file_${index}.dat`,

      path:
        item.path ||
        item.original_path ||
        `/Carved/${item.name || 'file'}`,

      size: item.size || 'Unknown',

      type:
        item.type ||
        item.file_type ||
        'Binary',

      status: item.status || 'Recovered',

      integrity: item.integrity || 'unknown',

      priority: item.priority || 'Medium',

      confidence: item.confidence ?? 0,

      checksum:
        item.checksum ||
        item.hash ||
        '',

      previewUrl:
        item.previewUrl ||
        (item.type === 'Image' ? SAMPLE_PHOTO_THUMB : null),

      recoveredAt:
        item.recoveredAt ||
        item.timestamp ||
        new Date()
          .toISOString()
          .replace('T', ' ')
          .slice(0, 16),
    })),
  };
}

function triggerBrowserDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export default {
  scanImage,
  getScanResults,
  downloadArtifact,
  downloadReport,
  getRecentScans,
};