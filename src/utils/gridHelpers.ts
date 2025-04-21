/**
 * Grid Helper Utilities
 * Functions to manage command positioning and grouping in the RemoteSimulator
 */

/**
 * Interface representing a command with position and group info
 */
interface PositionedCommand {
  position?: string;
  group?: string;
  name?: string;
  action?: string;
  topic?: string;
  [key: string]: any;
}

/**
 * Group commands by row letter
 */
export function getCommandsByRow(commands: PositionedCommand[]): Record<string, PositionedCommand[]> {
  const rows: Record<string, PositionedCommand[]> = {};
  
  commands.forEach(cmd => {
    if (!cmd.position) return;
    
    const match = cmd.position.match(/^([A-Z])/i);
    if (match) {
      const rowLetter = match[1].toUpperCase();
      if (!rows[rowLetter]) {
        rows[rowLetter] = [];
      }
      rows[rowLetter].push(cmd);
    }
  });
  
  return rows;
}

/**
 * Get command at specific position
 */
export function getCommandAtPosition(commands: PositionedCommand[], position: string): PositionedCommand | undefined {
  return commands.find(cmd => 
    cmd.position && cmd.position.toUpperCase() === position.toUpperCase()
  );
}

/**
 * Group commands for a specific row by their group attribute
 */
export function getGroupedCommandsForRow(rowCommands: PositionedCommand[]): Record<string, PositionedCommand[]> {
  const groupedCommands: Record<string, PositionedCommand[]> = {};
  
  rowCommands.forEach(cmd => {
    const group = cmd.group || 'none';
    if (!groupedCommands[group]) {
      groupedCommands[group] = [];
    }
    groupedCommands[group].push(cmd);
  });
  
  return groupedCommands;
}

/**
 * Get cell positions for each group
 */
export function getGroupCellPositions(commands: PositionedCommand[]): Record<string, string[]> {
  const groupPositions: Record<string, string[]> = {};
  
  commands.forEach(cmd => {
    if (!cmd.position || !cmd.group) return;
    
    if (!groupPositions[cmd.group]) {
      groupPositions[cmd.group] = [];
    }
    
    groupPositions[cmd.group].push(cmd.position);
  });
  
  return groupPositions;
}

/**
 * Check if a cell position belongs to a specific group
 */
export function isCellInGroup(cellPosition: string, groupName: string, groupPositions: Record<string, string[]>): boolean {
  return groupPositions[groupName]?.includes(cellPosition) || false;
}

/**
 * Calculate group bounds for CSS grid styling
 * Returns an object with row/column start/end information for each group
 */
export function calculateGroupBounds(groupPositions: Record<string, string[]>): Record<string, { 
  gridArea: string;
  extraStyles: {
    margin: string;
    padding: string;
  };
}> {
  const bounds: Record<string, { 
    gridArea: string;
    extraStyles: {
      margin: string;
      padding: string;
    };
  }> = {};
  
  Object.entries(groupPositions).forEach(([groupName, positions]) => {
    if (positions.length === 0) return;
    
    // Initialize with extreme values
    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;
    
    positions.forEach(pos => {
      const match = pos.match(/^([A-Z])(\d+)$/i);
      if (match) {
        const rowLetter = match[1].toUpperCase();
        const rowNum = rowLetter.charCodeAt(0) - 'A'.charCodeAt(0) + 1; // 1-based row index for grid-area
        const col = parseInt(match[2]) + 1; // 1-based column index for grid-area
        
        minRow = Math.min(minRow, rowNum);
        maxRow = Math.max(maxRow, rowNum);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
      }
    });
    
    // Define the grid area using grid-row-start, grid-row-end, grid-column-start, grid-column-end
    const gridArea = `${minRow} / ${minCol} / ${maxRow + 1} / ${maxCol + 1}`;
    
    bounds[groupName] = {
      gridArea,
      extraStyles: {
        margin: '-1px', // Slightly larger to compensate for borders
        padding: '1px'  // Add padding within group
      }
    };
  });
  
  return bounds;
}

/**
 * Generate a unique key for a command
 */
export function generateCommandKey(command: PositionedCommand): string {
  if (!command) return 'empty';
  if (command.name) return command.name;
  if (command.action) return command.action;
  if (command.topic) return command.topic;
  return Math.random().toString(36).substring(2, 9);
} 