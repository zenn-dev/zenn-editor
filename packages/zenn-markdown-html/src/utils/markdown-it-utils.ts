/**
 * Utility exports from markdown-it
 *
 * Starting from markdown-it v14+, internal utilities are no longer directly
 * importable from 'markdown-it/lib/common/utils'. Instead, they're accessible
 * through the markdown-it instance's utils property.
 *
 * This file provides a centralized way to access these utilities.
 */

import MarkdownIt from 'markdown-it';

// Create a temporary instance to extract utilities
const md = new MarkdownIt();

// Export commonly used utilities
export const escapeHtml = md.utils.escapeHtml;
export const unescapeAll = md.utils.unescapeAll;
export const isSpace = md.utils.isSpace;

// Export the entire utils object if needed
export const utils = md.utils;
