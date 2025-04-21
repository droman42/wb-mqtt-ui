/**
 * Utilities for handling grid positions for the Remote Simulator
 */

/**
 * Parse a grid position string (e.g., 'A0', 'B3') into row and column indices
 * Row is represented by a letter (A-Z), Column is represented by a number (0-3)
 * 
 * @param position Position string in format letter+number (e.g., 'A0', 'B3')
 * @returns Object containing rowIndex and colIndex, or null if invalid format
 */
export function parseGridPosition(position: string): { rowIndex: number, colIndex: number } | null {
  // Position format should be a letter followed by a number
  const match = position?.match(/^([A-Z])(\d)$/i);
  
  if (!match) {
    return null;
  }
  
  const [, rowLetter, colNumber] = match;
  
  // Convert row letter to number (A=0, B=1, etc.)
  const rowIndex = rowLetter.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
  
  // Parse column number (0-3)
  const colIndex = parseInt(colNumber, 10);
  
  // Validate column index is between 0 and 3
  if (colIndex < 0 || colIndex > 3) {
    return null;
  }
  
  return { rowIndex, colIndex };
}

/**
 * Find the highest row index in an array of positions
 * Useful for determining how many rows to display
 * 
 * @param positions Array of position strings
 * @returns The highest row index, or -1 if no valid positions
 */
export function findMaxRowIndex(positions: string[]): number {
  if (!positions || positions.length === 0) {
    return -1;
  }
  
  let maxRowIndex = -1;
  
  positions.forEach(position => {
    const parsed = parseGridPosition(position);
    if (parsed && parsed.rowIndex > maxRowIndex) {
      maxRowIndex = parsed.rowIndex;
    }
  });
  
  return maxRowIndex;
}

/**
 * Check if a position belongs to a specific row
 * 
 * @param position Position string (e.g., 'A0', 'B3')
 * @param rowIndex Row index to check against (0 for A, 1 for B, etc.)
 * @returns True if the position belongs to the specified row
 */
export function isPositionInRow(position: string, rowIndex: number): boolean {
  const parsed = parseGridPosition(position);
  return parsed !== null && parsed.rowIndex === rowIndex;
}

/**
 * Convert a command position to CSS grid-column style based on colIndex
 * 
 * @param position Position string (e.g., 'A0', 'B3')
 * @returns CSS grid-column string, e.g., '1' for position 'A0'
 */
export function positionToGridColumn(position: string): string | null {
  const parsed = parseGridPosition(position);
  
  if (!parsed) {
    return null;
  }
  
  // Grid columns are 1-indexed in CSS, but our position is 0-indexed
  return (parsed.colIndex + 1).toString();
}

/**
 * Group commands by row (A, B, C, etc.)
 * 
 * @param commands Array of commands with position property
 * @returns Object with row letters as keys and arrays of commands as values
 */
export function groupCommandsByRow(commands: any[]): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  
  commands.forEach(command => {
    if (!command.position) {
      return;
    }
    
    const match = command.position.match(/^([A-Z])/i);
    if (!match) {
      return;
    }
    
    const rowLetter = match[1].toUpperCase();
    
    if (!result[rowLetter]) {
      result[rowLetter] = [];
    }
    
    result[rowLetter].push(command);
  });
  
  return result;
}

/**
 * Checks if a group is a special group that should occupy a full row
 * 
 * @param groupName Name of the group
 * @returns True if it's a special group (menu, touchpad)
 */
export function isSpecialGroup(groupName: string): boolean {
  const specialGroups = ['menu', 'touchpad'];
  return specialGroups.includes(groupName.toLowerCase());
} 