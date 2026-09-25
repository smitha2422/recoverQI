import React, { useRef, useState } from 'react';
import { scanImage } from '../services/api';
import {
  Tag,
  Pin,
  AlertTriangle,
  Loader2,
  Sparkles,
  Sliders,
  Play,
  FileCheck,
  Image as ImageIcon,
} from 'lucide-react';

const GROUND_TRUTH_FILE = {
  name: 'evidence_sample_disk.raw',
  size: 1706,
  type: 'application/octet-stream',
  groundTruthVerified: true,
  hash: '782da6251e0352388523e92da0494ca7f28be8168857e8375fab0f4caf565f5d',
};

export default function FileUploader({
  onScanComplete,
  isScanning,
  setIsScanning,
  onOpenPhotoAnalysis,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanMode, setScanMode] = useState('smart');
  const [scanProgress, setScanProgress] = useState(0);
  const [currentSector, setCurrentSector] = useState('0x00000000');
  const [scanStatusMessage, setScanStatusMessage] = useState('Idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file || isScanning) return;
    setSelectedFile(file);
    setScanProgress(0);
    setErrorMessage('');
  };

  const handleInputChange = (event) => {
    handleFileSelect(event.target.files?.[0]);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    if (!isScanning) setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFileSelect(event.dataTransfer.files?.[0]);
  };

  const handleChooseFile = () => {
    if (!isScanning) fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    if (isScanning) return;
    setSelectedFile(null);
    setScanProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadGroundTruthEvidence = () => {
    if (isScanning) return;
    setSelectedFile(GROUND_TRUTH_FILE);
    setScanProgress(0);
    setErrorMessage('');
    return GROUND_TRUTH_FILE;
  };

  const formatFileSize = (bytes = 0) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const size = bytes / Math.pow(1024, index);
    return `${size.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
  };

  const handleStartScan = async () => {
    const targetFile = selectedFile || loadGroundTruthEvidence();
    if (!targetFile) return;

    setErrorMessage('');
    setIsScanning(true);
    setScanProgress(5);
    setScanStatusMessage('Mounting evidence stream & parsing sector table...');

    let progress = 10;
    const progressTimer = setInterval(() => {
      progress = Math.min(progress + Math.floor(Math.random() * 14) + 6, 94);
      setScanProgress(progress);
      setCurrentSector(
        `0x${Math.floor(Math.random() * 0xffffffff)
          .toString(16)
          .padStart(8, '0')
          .toUpperCase()}`,
      );

      if (progress < 35) {
        setScanStatusMessage(
          'Locating magic byte signatures: [FF D8 FF] JPEG, [89 50 4E 47] PNG, [%PDF-] PDF...',
        );
      } else if (progress < 70) {
        setScanStatusMessage('Carving unallocated raw clusters & tracing fragment affinities...');
      } else {
        setScanStatusMessage('Computing SHA-256 cryptographic ledgers & parity indices...');
      }
    }, 90);

    try {
      const apiResponse = await scanImage(targetFile);
      clearInterval(progressTimer);
      setScanProgress(100);
      setScanStatusMessage('Forensic scan complete.');
      if (onScanComplete) onScanComplete(apiResponse);
    } catch (err) {
      clearInterval(progressTimer);
      console.error('RecoverIQ scan error:', err);
      setScanProgress(0);
      setErrorMessage(err?.message || 'Unable to complete the forensic scan.');
    } finally {
      clearInterval(progressTimer);
      setIsScanning(false);
    }
  };

  const scanModes = [
    {
      id: 'smart',
      title: 'Smart Neural Carving',
      description: 'Magic signature scan & cross-cluster string matching.',
      Icon: Sparkles,
      iconClass: 'text-[#B33A2E]',
    },
    {
      id: 'deep',
      title: 'Deep RAW Cluster Carving',
      description: 'Direct low-level bitstream inspection across all sectors.',
      Icon: Sliders,
      iconClass: 'text-[#D8C39A]',
    },
    {
      id: 'quick',
      title: 'Partition Ledger Scan',
      description: 'MFT index & partition table recovery.',
      Icon: Play,
      iconClass: 'text-[#4C7A5E]',
    },
  ];

  return (
    <div className="ink-card relative rounded-lg border border-[#2F2926] p-6 sm:p-8">
      <div className="evidence-pin evidence-pin-top-left" />

      <div className="pl-3">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-document flex items-center gap-2 text-xl font-bold text-[#F2EFE9]">
              <Tag className="h-5 w-5 text-[#B33A2E]" />
              Evidence Vault — Volume Intake
            </h3>
            <p className="mt-0.5 text-xs text-[#A39D95]">
              Pin a raw disk dump, corrupted filesystem stream, or evidence photo to the board.
            </p>
          </div>

          {!selectedFile ? (
            <button
              type="button"
              onClick={loadGroundTruthEvidence}
              disabled={isScanning}
              className="inline-flex cursor-pointer items-center gap-2 rounded border border-[#B39F73]/40 bg-[#25201D] px-3 py-1.5 font-mono text-xs text-[#D8C39A] transition hover:bg-[#2F2926] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileCheck className="h-3.5 w-3.5 text-[#B33A2E]" />
              Pin Ground-Truth Evidence Disk
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClearFile}
              disabled={isScanning}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#3A332F] bg-[#25201D] px-3 py-1.5 font-mono text-xs text-[#A39D95] transition hover:bg-[#2F2926] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Unpin File
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded border border-[#B33A2E]/40 bg-[#B33A2E]/15 p-3 font-mono text-xs text-[#F2EFE9]">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#B33A2E]" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleChooseFile}
          role="button"
          tabIndex={isScanning ? -1 : 0}
          onKeyDown={(event) => {
            if (!isScanning && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              handleChooseFile();
            }
          }}
          className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-[#B33A2E] bg-[#B33A2E]/10'
              : selectedFile
                ? 'border-[#B39F73] bg-[#1C1816]'
                : 'border-[#3A332F] bg-[#171412] hover:border-[#B39F73]/60 hover:bg-[#1C1816]'
          } ${isScanning ? 'cursor-not-allowed opacity-80' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleInputChange}
            disabled={isScanning}
          />

          {selectedFile ? (
            <div className="kraft-card relative mx-auto max-w-lg rounded p-5 text-left shadow-md">
              <div className="evidence-pin evidence-pin-top-center" />
              <div className="flex items-center justify-between border-b border-[#B39F73] pb-2">
                <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-[#B33A2E]">
                  <Pin className="h-3 w-3" /> PINNED EVIDENCE TAG #01
                </span>
                <span className="font-mono text-[10px] text-[#4A5560]">
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>
              <p className="font-document mt-2 truncate text-base font-bold text-[#14110F]">
                {selectedFile.name}
              </p>
              <div className="mt-2 border-t border-[#B39F73]/40 pt-2">
                <span className="block font-mono text-[10px] uppercase text-[#4A5560]">
                  Source Bitstream Hash:
                </span>
                <p className="mt-0.5 break-all font-mono text-[11px] font-semibold text-[#14110F]">
                  {selectedFile.hash || 'Will be calculated during scan'}
                </p>
              </div>
              <span className="mt-2 block cursor-pointer font-mono text-[10px] text-[#B33A2E] underline">
                Click or drop a different file to replace
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#3A332F] bg-[#25201D] text-[#B33A2E]">
                <Pin className="h-6 w-6" />
              </div>
              <p className="font-document text-lg font-bold text-[#F2EFE9]">Pin evidence here</p>
              <p className="max-w-md font-mono text-xs text-[#A39D95]">
                Drop a raw disk dump (.raw, .img, .dd, .vmdk), corrupted photo, or click to browse local drives.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {scanModes.map(({ id, title, description, Icon, iconClass }) => (
            <button
              type="button"
              key={id}
              onClick={() => setScanMode(id)}
              disabled={isScanning}
              aria-pressed={scanMode === id}
              className={`rounded border p-3.5 text-left transition-all disabled:cursor-not-allowed ${
                scanMode === id
                  ? 'border-l-4 border-[#B33A2E] border-l-[#B33A2E] bg-[#25201D] text-[#F2EFE9]'
                  : 'border-[#2F2926] bg-[#171412] text-[#A39D95] hover:border-[#3A332F]'
              }`}
            >
              <div className="font-document mb-1 flex items-center gap-2 text-xs font-bold text-[#F2EFE9]">
                <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
                {title}
              </div>
              <p className="text-[11px] text-[#A39D95]">{description}</p>
            </button>
          ))}
        </div>

        {isScanning ? (
          <div className="mt-6 rounded border border-[#2F2926] bg-[#171412] p-4">
            <div className="mb-2 flex items-center justify-between gap-3 font-mono text-xs text-[#F2EFE9]">
              <span className="flex items-center gap-2 text-[#D8C39A]">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#B33A2E]" />
                {scanStatusMessage}
              </span>
              <span className="shrink-0 text-[#A39D95]">Sector: {currentSector}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded border border-[#3A332F] bg-[#25201D] p-0.5">
              <div
                className="h-full rounded bg-[#B33A2E] transition-all duration-150"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#A39D95]">
              <span>SCANNING EVIDENCE VOLUME &amp; CARVING ARTIFACTS</span>
              <span className="font-bold text-[#F2EFE9]">{scanProgress}%</span>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
            <div className="w-full sm:w-auto">
              {onOpenPhotoAnalysis && (
                <button
                  type="button"
                  onClick={onOpenPhotoAnalysis}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded border border-[#B39F73]/40 bg-[#1E1B18] px-4 py-2.5 font-document text-xs font-bold text-[#D8C39A] transition hover:bg-[#2A2420] sm:w-auto"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-[#4C7A5E]" />
                  Photo Analysis &amp; Deep Carve
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleStartScan}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-[#B33A2E] px-6 py-2.5 font-document text-xs font-bold tracking-wide text-[#F2EFE9] shadow-lg transition-all hover:scale-[1.02] hover:bg-[#9B2F25] active:scale-[0.98] sm:w-auto"
            >
              <Play className="h-4 w-4 fill-current" />
              Analyze &amp; Reconstruct Evidence
            </button>
          </div>
        )}
      </div>
    </div>
  );
}