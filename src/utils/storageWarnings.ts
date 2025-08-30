// Mobile storage persistence utilities
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isStandalone = () => {
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
};

export const getStorageWarning = () => {
  if (isIOS() && !isStandalone()) {
    return {
      type: "warning",
      message: "For better data persistence on iOS, add this app to your home screen",
      action: "Add to Home Screen",
    };
  }

  if (isMobile()) {
    return {
      type: "info",
      message: "Your flashcards are stored locally. Export regularly to backup your data",
      action: "Export Data",
    };
  }

  return null;
};

// Check if storage is likely to persist
export const checkStoragePersistence = async (): Promise<boolean> => {
  if ("storage" in navigator && "persist" in navigator.storage) {
    return await navigator.storage.persist();
  }
  return false;
};
