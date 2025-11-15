"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ArrowLeft, RotateCw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { authService } from '../services/authService';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.93/build/pdf.worker.min.mjs`;

interface PdfBookReaderProps {
  pdfUrl: string;
  bookTitle?: string;
  bookSlug?: string;
  onClose: () => void;
}

interface PointerInfo { x: number; y: number }
interface PinchState { distance: number; centerX: number; centerY: number; initialScale: number }
interface PanState { startX: number; startY: number; initialScrollLeft: number; initialScrollTop: number }

const PdfBookReader: React.FC<PdfBookReaderProps> = ({ pdfUrl, bookTitle, bookSlug, onClose }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uiHidden, setUiHidden] = useState<boolean>(false);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string>('');
  const [pageInput, setPageInput] = useState<string>('1');
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [lastPageRead, setLastPageRead] = useState<number>(1);
  const sessionTimeSpent = useRef<number>(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const activePointersRef = useRef<Map<number, PointerInfo>>(new Map());
  const pinchStateRef = useRef<PinchState | null>(null);
  const panStateRef = useRef<PanState | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressToggleRef = useRef<boolean>(false);

  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided');
      return;
    }
    let finalUrl = pdfUrl;
    if (pdfUrl.includes('drive.google.com')) {
      const fileIdMatch = pdfUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch) {
        finalUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
      }
    }
    if (pdfUrl.includes('dropbox.com') && !pdfUrl.includes('dl=1')) {
      finalUrl = pdfUrl.replace('dl=0', 'dl=1');
    }
    setProcessedPdfUrl(finalUrl);
  }, [pdfUrl]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }, []);

  const onDocumentLoadProgress = useCallback(({ loaded, total }: { loaded: number; total: number }) => {
    if (total > 0) {
      const progress = Math.round((loaded / total) * 100);
      setLoadingProgress(progress);
    }
  }, []);

  const trackReadingProgress = useCallback(async (currentPage: number, totalPages: number) => {
    if (!bookSlug || !numPages) return;
    try {
      const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
      sessionTimeSpent.current += timeSpent;
      if (lastPageRead !== currentPage) {
        await authService.trackReadingSession(bookSlug, lastPageRead, timeSpent);
      }
      await authService.updateBookProgress(bookSlug, currentPage, totalPages);
      setLastPageRead(currentPage);
      setSessionStartTime(Date.now());
    } catch {}
  }, [bookSlug, numPages, sessionStartTime, lastPageRead]);

  const goToPreviousPage = useCallback(() => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      setPageInput(newPage.toString());
      if (numPages) {
        trackReadingProgress(newPage, numPages);
      }
    }
  }, [pageNumber, numPages, trackReadingProgress]);

  const goToNextPage = useCallback(() => {
    if (numPages && pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      setPageInput(newPage.toString());
      trackReadingProgress(newPage, numPages);
    }
  }, [pageNumber, numPages, trackReadingProgress]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && numPages && page <= numPages) {
      setPageNumber(page);
      trackReadingProgress(page, numPages);
    } else {
      setPageInput(pageNumber.toString());
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  const getDistance = (p1: PointerInfo, p2: PointerInfo): number => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  const getCenter = (p1: PointerInfo, p2: PointerInfo) => ({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });

  const documentOptions = useMemo(() => ({
    cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    disableAutoFetch: false,
    disableStream: false
  }), []);

  const handleClose = useCallback(async () => {
    if (bookSlug) {
      try {
        const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
        sessionTimeSpent.current += timeSpent;
        await authService.trackReadingSession(bookSlug, lastPageRead, timeSpent);
      } catch {}
    }
    onClose();
  }, [bookSlug, sessionStartTime, lastPageRead, onClose]);

  useEffect(() => {}, []);

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      <button
        aria-label="Back to Book Details"
        data-no-toggle="true"
        data-no-swipe="true"
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
        className="fixed left-4 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 20px)' }}
      >
        <ArrowLeft size={24} />
        <span className="ml-1 text-sm font-medium hidden sm:inline">Back</span>
      </button>

      <div className={`${uiHidden ? 'hidden md:flex' : 'flex'} bg-white shadow-md px-4 py-3 items-center justify-between`} data-no-toggle="true" data-no-swipe="true">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-800 truncate max-w-xs">{bookTitle || 'PDF Reader'}</h1>
            {bookSlug && (
              <p className="text-sm text-gray-600 truncate max-w-xs">{bookSlug}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-2">
            <button onClick={zoomOut} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded" aria-label="Zoom out">
              <ZoomOut size={20} />
            </button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded" aria-label="Zoom in">
              <ZoomIn size={20} />
            </button>
            <button onClick={rotate} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded" aria-label="Rotate">
              <RotateCw size={20} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={goToPreviousPage} disabled={pageNumber <= 1} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Previous page">
              <ChevronLeft size={20} />
            </button>
            <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-1">
              <input type="number" min="1" max={numPages || 1} value={pageInput} onChange={handlePageInputChange} className="w-12 px-1 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
              <span className="text-sm text-gray-600">of {numPages || '?'}</span>
            </form>
            <button onClick={goToNextPage} disabled={!numPages || pageNumber >= numPages} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Next page">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={viewerRef}
        className="flex-1 overflow-auto bg-gray-800 flex items-center justify-center p-4 relative select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
          const container = viewerRef.current;
          if (!container) return;
          const tgt = e.target as HTMLElement;
          if (tgt.closest('[data-no-swipe="true"]')) {
            return;
          }
          (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
          activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (activePointersRef.current.size === 1) {
            pointerStartRef.current = { x: e.clientX, y: e.clientY };
            panStateRef.current = {
              startX: e.clientX,
              startY: e.clientY,
              initialScrollLeft: container.scrollLeft,
              initialScrollTop: container.scrollTop
            };
          } else if (activePointersRef.current.size === 2) {
            const pointers = Array.from(activePointersRef.current.values());
            const distance = getDistance(pointers[0], pointers[1]);
            const center = getCenter(pointers[0], pointers[1]);
            pinchStateRef.current = { distance, centerX: center.x, centerY: center.y, initialScale: scale };
            panStateRef.current = null;
          }
        }}
        onPointerMove={(e) => {
          if (!activePointersRef.current.has(e.pointerId)) return;
          activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (activePointersRef.current.size === 2 && pinchStateRef.current) {
            const pointers = Array.from(activePointersRef.current.values());
            const distance = getDistance(pointers[0], pointers[1]);
            const scaleChange = distance / pinchStateRef.current.distance;
            const newScale = Math.max(0.5, Math.min(3, pinchStateRef.current.initialScale * scaleChange));
            setScale(newScale);
          } else if (activePointersRef.current.size === 1 && panStateRef.current) {
            const container = viewerRef.current;
            if (!container) return;
            const dx = e.clientX - panStateRef.current.startX;
            const dy = e.clientY - panStateRef.current.startY;
            container.scrollLeft = panStateRef.current.initialScrollLeft - dx;
            container.scrollTop = panStateRef.current.initialScrollTop - dy;
          }
        }}
        onPointerUp={(e) => {
          if (!activePointersRef.current.has(e.pointerId)) return;
          activePointersRef.current.delete(e.pointerId);
          if (activePointersRef.current.size === 0) {
            if (pointerStartRef.current && panStateRef.current) {
              const dx = e.clientX - pointerStartRef.current.x;
              const dy = e.clientY - pointerStartRef.current.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance > 50 && Math.abs(dx) > Math.abs(dy)) {
                suppressToggleRef.current = true;
                if (dx < 0) {
                  goToNextPage();
                } else {
                  goToPreviousPage();
                }
              }
            }
            panStateRef.current = null;
            pointerStartRef.current = null;
          }
        }}
        onPointerCancel={(e) => {
          activePointersRef.current.delete(e.pointerId);
          pinchStateRef.current = null;
          panStateRef.current = null;
        }}
        onDoubleClick={() => {
          setScale((prev) => (prev < 1.2 ? 2 : 1));
        }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[data-no-toggle="true"]')) return;
          if (suppressToggleRef.current) {
            suppressToggleRef.current = false;
            return;
          }
          setUiHidden((prev) => !prev);
        }}
        onClickCapture={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('a[href]')) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {loading && (
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading PDF... {loadingProgress}%</p>
            <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto mt-2">
              <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
            </div>
          </div>
        )}

        {numPages && scale <= 1.1 && (
          <>
            <button type="button" aria-label="Previous page" data-no-toggle="true" onClick={(e) => { e.stopPropagation(); goToPreviousPage(); }} disabled={pageNumber <= 1} className="absolute left-0 top-0 bottom-0 w-16 z-10 opacity-0 hover:opacity-20 bg-white transition-opacity disabled:cursor-not-allowed" />
            <button type="button" aria-label="Next page" data-no-toggle="true" onClick={(e) => { e.stopPropagation(); goToNextPage(); }} disabled={!numPages || pageNumber >= numPages} className="absolute right-0 top-0 bottom-0 w-16 z-10 opacity-0 hover:opacity-20 bg-white transition-opacity disabled:cursor-not-allowed" />
          </>
        )}

        {!uiHidden && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm md:hidden">
            Swipe to navigate • Tap to hide controls
          </div>
        )}

        <div className={`${uiHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'} md:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-4 transition-all duration-300 z-20`} data-no-toggle="true" data-no-swipe="true">
          <button onClick={goToPreviousPage} disabled={pageNumber <= 1} className="p-2 text-white hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Previous page">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center space-x-2 text-white">
            <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-1">
              <input type="number" min="1" max={numPages || 1} value={pageInput} onChange={handlePageInputChange} className="w-12 px-1 py-1 text-xs text-center bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400" />
              <span className="text-xs">of {numPages || '?'}</span>
            </form>
          </div>
          <button onClick={goToNextPage} disabled={!numPages || pageNumber >= numPages} className="p-2 text-white hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Next page">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className={`${uiHidden ? 'opacity-0' : 'opacity-100'} absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30 transition-opacity duration-300`}>
          <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: numPages ? `${(pageNumber / numPages) * 100}%` : '0%' }} />
        </div>

        {error && (
          <div className="absolute inset-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-start justify-between">
            <div>
              <strong className="font-bold">Error loading PDF</strong>
              <p className="mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900" aria-label="Close error">
              <X size={20} />
            </button>
          </div>
        )}

        {!error && (
          <div className="bg-white shadow-lg max-w-full">
            <Document
              file={processedPdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              onLoadProgress={onDocumentLoadProgress}
              onSourceSuccess={() => {}}
              onSourceError={() => {}}
              options={documentOptions}
              loading={null}
              className="react-pdf__Document"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderAnnotationLayer={true}
                renderTextLayer={true}
                onLoadSuccess={() => {}}
                onLoadError={() => {}}
                onRenderSuccess={() => {}}
                onRenderError={() => {}}
                loading={null}
                className="react-pdf__Page"
                canvasBackground="white"
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfBookReader;