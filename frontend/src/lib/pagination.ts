/**
 * Default rows per page across the server-paginated list pages. Kept in a plain
 * module (no "use client") so server components can use it as a real value —
 * importing it from a client module would hand the server an opaque reference.
 */
export const PAGE_SIZE = 24;
