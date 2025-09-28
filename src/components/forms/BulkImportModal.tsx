import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { loadCards } from '../../store/slices/cardSlice';
import { loadGroups } from '../../store/slices/groupSlice';
import { getCardRepo, getGroupRepo } from '../../services/repositoryService';
import { DEFAULT_CARD_VALUES } from '../../types/card-schema';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// Debug tracking for component lifecycle
let componentInstanceId = 0;

interface BulkImportModalProps {
  isOpen: boolean;
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface CardData {
  content: string;
  answer: string;
  hint?: string;
}

interface ImportProgress {
  total: number;
  completed: number;
  failed: number;
  errors: string[];
  isRunning: boolean;
  isCancelled: boolean;
  isComplete: boolean;
}

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_CARDS = 500;

const BulkImportModalComponent: React.FC<BulkImportModalProps> = ({
  isOpen,
  groupId,
  onClose,
  onSuccess,
}) => {
  // Assign unique ID to track component recreation
  const [instanceId] = useState(() => ++componentInstanceId);
  console.log(`🏗️ [BulkImport-${instanceId}] Component render - isOpen: ${isOpen}, groupId: ${groupId}`);
  
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController>(null);
  const isImportRunningRef = useRef<boolean>(false);

  const [uploadedCards, setUploadedCards] = useState<CardData[]>([]);
  const [validationError, setValidationError] = useState<string>('');
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    errors: [],
    isRunning: false,
    isCancelled: false,
    isComplete: false,
  });

  // Debug progress changes and potential recreation triggers
  useEffect(() => {
    console.log(`📊 [BulkImport-${instanceId}] Progress changed:`, {
      isRunning: progress.isRunning,
      isComplete: progress.isComplete,
      completed: progress.completed,
      total: progress.total
    });
  }, [progress, instanceId]);

  // Reset state when modal opens/closes - CRITICAL DEBUG POINT
  useEffect(() => {
    console.log(`🔄 [BulkImport-${instanceId}] Modal isOpen changed to: ${isOpen}`);
    console.log(`🔄 [BulkImport-${instanceId}] Current progress.isRunning: ${progress.isRunning}`);
    console.log(`🔄 [BulkImport-${instanceId}] This effect triggered by:`, { isOpen, 'progress.isRunning': progress.isRunning });
    
    if (!isOpen) {
      console.log(`🧹 [BulkImport-${instanceId}] Modal closed - checking if we should reset state`);
      
      // Don't reset if import is currently running
      if (progress.isRunning) {
        console.log(`⚠️ [BulkImport-${instanceId}] Import is running - NOT resetting state to prevent abort`);
        return;
      }
      
      console.log(`🧹 [BulkImport-${instanceId}] Safe to reset modal state`);
      
      setUploadedCards([]);
      setValidationError('');
      setProgress({
        total: 0,
        completed: 0,
        failed: 0,
        errors: [],
        isRunning: false,
        isCancelled: false,
        isComplete: false,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, progress.isRunning, instanceId]);

  // Track component mounting/unmounting - CRITICAL FOR RECREATION DETECTION
  useEffect(() => {
    console.log(`🏗️ [BulkImport-${instanceId}] Component mounted`);
    return () => {
      console.log(`💥 [BulkImport-${instanceId}] Component unmounting`);
      console.log(`💥 [BulkImport-${instanceId}] isImportRunningRef.current: ${isImportRunningRef.current}`);
      console.log(`💥 [BulkImport-${instanceId}] RECREATION DETECTED - Previous instance being destroyed`);
      
      // Use ref instead of state to get immediate value
      if (abortControllerRef.current && !isImportRunningRef.current) {
        console.log(`🧹 [BulkImport-${instanceId}] Component unmounting - aborting controller (import not running)`);
        abortControllerRef.current.abort();
      } else if (abortControllerRef.current && isImportRunningRef.current) {
        console.log(`⚠️ [BulkImport-${instanceId}] Component unmounting but import is running - NOT aborting to prevent interference`);
      }
    };
  }, [instanceId]);

  const validateCardData = (item: unknown): item is CardData => {
    if (typeof item !== 'object' || item === null) {
      return false;
    }
    
    const obj = item as Record<string, unknown>;
    return (
      typeof obj.content === 'string' &&
      typeof obj.answer === 'string' &&
      obj.content.trim().length > 0 &&
      obj.answer.trim().length > 0 &&
      (obj.hint === undefined || typeof obj.hint === 'string')
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setValidationError('');
    setUploadedCards([]);

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      setValidationError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    // File type validation
    if (!file.name.toLowerCase().endsWith('.json')) {
      setValidationError('Please upload a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        // Validate JSON structure
        if (!Array.isArray(jsonData)) {
          setValidationError('JSON file must contain an array of cards');
          return;
        }

        // Cards count validation
        if (jsonData.length === 0) {
          setValidationError('JSON file is empty');
          return;
        }

        if (jsonData.length > MAX_CARDS) {
          setValidationError(`Too many cards. Maximum is ${MAX_CARDS} cards per import`);
          return;
        }

        // Validate each card
        const validCards: CardData[] = [];
        const invalidCards: number[] = [];

        jsonData.forEach((item, index) => {
          if (validateCardData(item)) {
            validCards.push({
              content: item.content.trim(),
              answer: item.answer.trim(),
              hint: item.hint?.trim() || undefined,
            });
          } else {
            invalidCards.push(index + 1);
          }
        });

        if (invalidCards.length > 0) {
          setValidationError(
            `Invalid card data at positions: ${invalidCards.join(', ')}. Each card must have 'content' and 'answer' fields.`
          );
          return;
        }

        setUploadedCards(validCards);
      } catch {
        setValidationError('Invalid JSON file format');
      }
    };

    reader.onerror = () => {
      setValidationError('Failed to read file');
    };

    reader.readAsText(file);
  };

  const handleStartImport = async () => {
    console.log(`🚀 [BulkImport-${instanceId}] Starting import process`);
    console.log(`📊 [BulkImport-${instanceId}] Cards to import: ${uploadedCards.length}`);
    console.log(`🎯 [BulkImport-${instanceId}] Target groupId: ${groupId}`);

    if (uploadedCards.length === 0) {
      console.log(`❌ [BulkImport-${instanceId}] No cards to import, aborting`);
      return;
    }

    abortControllerRef.current = new AbortController();
    isImportRunningRef.current = true;
    console.log(`🎮 [BulkImport-${instanceId}] AbortController created, isImportRunningRef set to true`);
    
    const initialProgress = {
      total: uploadedCards.length,
      completed: 0,
      failed: 0,
      errors: [],
      isRunning: true,
      isCancelled: false,
      isComplete: false,
    };
    
    console.log(`📈 [BulkImport-${instanceId}] Setting initial progress - isRunning: true`);
    setProgress(initialProgress);

    for (let i = 0; i < uploadedCards.length; i++) {
      // Check if cancelled
      if (abortControllerRef.current.signal.aborted) {
        console.log(`🛑 [BulkImport-${instanceId}] AbortController signal is aborted!`);
        isImportRunningRef.current = false;
        setProgress(prev => ({
          ...prev,
          isRunning: false,
          isCancelled: true,
          isComplete: true,
        }));
        return;
      }

      try {
        // Get repository and create card directly (no Redux update)
        const cardRepo = getCardRepo();
        const now = new Date();
        await cardRepo.create({
          ...DEFAULT_CARD_VALUES,
          groupId,
          content: uploadedCards[i].content,
          answer: uploadedCards[i].answer,
          hint: uploadedCards[i].hint || '',
          createdAt: now,
          updatedAt: now,
        });

        setProgress(prev => ({
          ...prev,
          completed: prev.completed + 1,
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setProgress(prev => ({
          ...prev,
          failed: prev.failed + 1,
          errors: [...prev.errors, `Card ${i + 1}: ${errorMessage}`],
        }));
      }
    }

    console.log(`🏁 [BulkImport-${instanceId}] All cards processed, marking as complete`);
    
    // Mark as complete
    isImportRunningRef.current = false;
    setProgress(prev => ({
      ...prev,
      isRunning: false,
      isComplete: true,
    }));

    // CRITICAL DEBUG: Update group card count like manual card creation does
    console.log(`🔢 [BulkImport-${instanceId}] CRITICAL: Updating group card count`);
    try {
      // Get actual current card count from database (like manual card creation)
      const cardRepo = getCardRepo();
      const groupRepo = getGroupRepo();
      
      const currentCards = await cardRepo.findByGroupId(groupId);
      const actualCardCount = currentCards.length;
      
      console.log(`🔢 [BulkImport-${instanceId}] Current cards in DB for group ${groupId}: ${actualCardCount}`);
      
      await groupRepo.update(groupId, {
        cardCount: actualCardCount,
      });
      
      console.log(`🔢 [BulkImport-${instanceId}] Group card count updated to: ${actualCardCount}`);
    } catch (groupUpdateError) {
      console.error(`❌ [BulkImport-${instanceId}] Failed to update group card count:`, groupUpdateError);
    }

    console.log(`✨ [BulkImport-${instanceId}] Import process completed - waiting for user to finish`);
    // NOTE: No automatic Redux dispatches or onSuccess callback
    // User must click "Finish Import" to complete the process
  };

  const handleCancel = () => {
    console.log(`🛑 [BulkImport-${instanceId}] Cancel button clicked`);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleClose = () => {
    console.log(`🚪 [BulkImport-${instanceId}] Close requested, isRunning: ${progress.isRunning}`);
    if (progress.isRunning) {
      console.log(`⚠️ [BulkImport-${instanceId}] Prevented close during import`);
      return;
    }
    console.log(`✅ [BulkImport-${instanceId}] Calling onClose`);
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    if (progress.isRunning) {
      return; // Prevent outside click during import
    }
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleModalClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bulk Import Cards</h2>
          {!progress.isRunning && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="text-gray-500 hover:text-gray-700 text-xl"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>

        {/* File Upload Section */}
        {!progress.isRunning && !progress.isComplete && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select JSON File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum file size: 1MB, Maximum cards: {MAX_CARDS}
              </p>
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{validationError}</p>
              </div>
            )}

            {uploadedCards.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">
                  ✓ {uploadedCards.length} valid cards ready for import
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button 
                variant="secondary" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartImport();
                }}
                disabled={uploadedCards.length === 0}
              >
                Start Import
              </Button>
            </div>
          </div>
        )}

        {/* Progress Section */}
        {progress.isRunning && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm font-medium">Importing cards...</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress.completed + progress.failed} / {progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((progress.completed + progress.failed) / progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-green-600">
                ✓ Success: {progress.completed}
              </div>
              <div className="text-red-600">
                ✗ Failed: {progress.failed}
              </div>
            </div>

            <Button 
              variant="secondary" 
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }} 
              className="w-full"
            >
              Cancel Import
            </Button>
          </div>
        )}

        {/* Results Section */}
        {progress.isComplete && (
          <div className="space-y-4">
            <div className="text-center">
              {progress.isCancelled ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-600 font-medium">Import Cancelled</p>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-600 font-medium">Import Complete!</p>
                  <p className="text-xs text-green-500 mt-1">
                    Click "Finish Import" to refresh the card list and see your new cards.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-green-600">
                ✓ Successfully created: {progress.completed}
              </div>
              <div className="text-red-600">
                ✗ Failed: {progress.failed}
              </div>
            </div>

            {progress.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto">
                <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
                <div className="space-y-1">
                  {progress.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-500 bg-red-50 p-2 rounded">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={(e) => {
                console.log(`🏁 [BulkImport-${instanceId}] Finish Import button clicked`);
                console.log(`🔄 [BulkImport-${instanceId}] Now dispatching Redux updates`);
                e.stopPropagation();
                
                // Dispatch Redux updates to refresh the UI
                dispatch(loadCards());
                dispatch(loadGroups());
                
                console.log(`📞 [BulkImport-${instanceId}] Calling onSuccess callback`);
                onSuccess();
                
                console.log(`🚪 [BulkImport-${instanceId}] Closing modal after successful finish`);
                handleClose();
              }} 
              className="w-full"
            >
              Finish Import
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Memoize the component to prevent recreation on parent re-renders
export const BulkImportModal = React.memo(BulkImportModalComponent);
