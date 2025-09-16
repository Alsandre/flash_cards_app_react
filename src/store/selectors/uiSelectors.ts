import type {RootState} from "../store";

// Base selectors
export const selectUIState = (state: RootState) => state.ui;
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectCurrentRoute = (state: RootState) => state.ui.currentRoute;
export const selectIsLoading = (state: RootState) => state.ui.isLoading;
export const selectError = (state: RootState) => state.ui.error;
