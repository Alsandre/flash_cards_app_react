import {configureStore} from "@reduxjs/toolkit";
import {cardSlice} from "./slices/cardSlice";
import {sessionSlice} from "./slices/sessionSlice";
import {groupSlice} from "./slices/groupSlice";
import {uiSlice} from "./slices/uiSlice";
import {persistenceMiddleware} from "./middleware/persistence";

export const store = configureStore({
  reducer: {
    cards: cardSlice.reducer,
    sessions: sessionSlice.reducer,
    groups: groupSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types completely
        ignoredActions: ["persist/PERSIST"],
        // Custom serialization check - allow Date objects
        isSerializable: (value: any) => {
          // Allow Date objects
          if (value instanceof Date) return true;
          // Use default serialization check for everything else
          return typeof value !== "object" || value === null || Array.isArray(value) || value.constructor === Object;
        },
      },
    }).concat(persistenceMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
