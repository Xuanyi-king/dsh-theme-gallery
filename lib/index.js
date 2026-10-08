import { attachSelectionRoute } from './selection-route.js';
import { attachUpdateRoutes } from './update-host.js';
export const name = 'dsh-theme-gallery';
export function apply(ctx) { attachSelectionRoute(ctx); attachUpdateRoutes(ctx); }
