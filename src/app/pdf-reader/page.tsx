"use client";
import React from 'react';
import PdfBookReader from '../../components/PdfBookReader';

export default function PdfReaderPage() {
  const [open, setOpen] = React.useState(true);
  if (!open) {
    return <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100"></div>;
  }
  return (
    <PdfBookReader pdfUrl="/Gayatri-Mahavigyan-Hindi.pdf" onClose={() => setOpen(false)} />
  );
}