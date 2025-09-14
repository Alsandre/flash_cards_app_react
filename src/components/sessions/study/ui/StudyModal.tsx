import React from "react";
import {Button} from "../../../ui";

/**
 * StudyModal - Study session modal dialog component
 * @level 1 (Primitive Component)
 * @coupling None - pure props-based modal
 */

interface StudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  confirmVariant?: "primary" | "secondary" | "danger";
  showCancel?: boolean;
}

const StudyModal: React.FC<StudyModalProps> = ({isOpen, onClose, title, children, confirmText = "Confirm", cancelText = "Cancel", onConfirm, confirmVariant = "primary", showCancel = true}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
              <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">{children}</div>

          {/* Actions */}
          <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-700/50 flex justify-end space-x-3">
            {showCancel && (
              <Button variant="ghost" onClick={onClose}>
                {cancelText}
              </Button>
            )}
            {onConfirm && (
              <Button variant={confirmVariant === "danger" ? "ghost" : confirmVariant} onClick={handleConfirm} className={confirmVariant === "danger" ? "text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20" : ""}>
                {confirmText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyModal;
