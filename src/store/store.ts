import {configureStore, type Middleware} from "@reduxjs/toolkit";
import {cardSlice} from "./slices/cardSlice";
import {sessionSlice} from "./slices/sessionSlice";
import {groupSlice} from "./slices/groupSlice";
import {uiSlice} from "./slices/uiSlice";
import authSlice from "./slices/authSlice";
import syncSlice from "./slices/syncSlice";
// import {persistenceMiddleware} from "./middleware/persistence"; // Removed - no longer using IndexedDB persistence
import {authMiddleware} from "./middleware/authMiddleware";

export const store = configureStore({
  reducer: {
    cards: cardSlice.reducer,
    sessions: sessionSlice.reducer,
    groups: groupSlice.reducer,
    ui: uiSlice.reducer,
    auth: authSlice,
    sync: syncSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
        isSerializable: (value: unknown) => {
          if (value instanceof Date) return true;
          return typeof value !== "object" || value === null || Array.isArray(value) || value.constructor === Object;
        },
      },
    }).concat(authMiddleware as Middleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Define types to avoid circular reference
export type RootState = {
  cards: ReturnType<typeof cardSlice.reducer>;
  sessions: ReturnType<typeof sessionSlice.reducer>;
  groups: ReturnType<typeof groupSlice.reducer>;
  ui: ReturnType<typeof uiSlice.reducer>;
  auth: ReturnType<typeof authSlice>;
  sync: ReturnType<typeof syncSlice>;
};
export type AppDispatch = typeof store.dispatch;
