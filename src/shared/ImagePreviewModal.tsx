/**
 * ImagePreviewModal — React equivalent of Angular's ImagePreviewModelComponent
 * Angular: src/app/shared/image-preview-model/image-preview-model.component.ts
 */
import React from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  title = 'Image Preview',
}) => {
  const [index, setIndex] = React.useState(initialIndex);
  const [zoom, setZoom] = React.useState(1);

  React.useEffect(() => { setIndex(initialIndex); }, [initialIndex]);
  React.useEffect(() => { setZoom(1); }, [index]);

  if (!isOpen || !images.length) return null;

  const currentImage = images[index];
  const canPrev = index > 0;
  const canNext = index < images.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Header */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[210] flex items-center gap-3">
          <span className="text-white text-sm font-semibold bg-black/40 px-3 py-1 rounded-full">
            {title} {images.length > 1 ? `(${index + 1}/${images.length})` : ''}
          </span>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 z-[210] flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-lg transition"><ZoomIn size={16} /></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-lg transition"><ZoomOut size={16} /></button>
          <a href={currentImage} download className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-lg transition"><Download size={16} /></a>
          <button onClick={onClose} className="p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition"><X size={16} /></button>
        </div>

        {/* Navigation */}
        {canPrev && (
          <button onClick={() => setIndex(i => i - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-[210] w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition">
            <ChevronLeft size={24} />
          </button>
        )}
        {canNext && (
          <button onClick={() => setIndex(i => i + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-[210] w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition">
            <ChevronRight size={24} />
          </button>
        )}

        {/* Image */}
        <motion.img
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          src={currentImage}
          alt={`Preview ${index + 1}`}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
          style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
          draggable={false}
        />
      </motion.div>
    </AnimatePresence>
  );
};
