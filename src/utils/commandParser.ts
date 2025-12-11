export interface ParsedCommand {
  type: 'LOAD' | 'NEW_TAB' | 'CLOSE_TAB' | 'MARKET_VIEW' | 'SETTINGS' | 'HELP' | 'UNKNOWN';
  args: string[];
  raw: string;
}

export const parseCommand = (input: string): ParsedCommand => {
  const trimmed = input.trim().toUpperCase();
  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  switch (command) {
    case 'LOAD':
      return {
        type: 'LOAD',
        args,
        raw: input,
      };
    case 'NEW':
      if (parts[1] === 'TAB') {
        return {
          type: 'NEW_TAB',
          args: [],
          raw: input,
        };
      }
      break;
    case 'CLOSE':
      if (parts[1] === 'TAB') {
        return {
          type: 'CLOSE_TAB',
          args: parts.slice(2),
          raw: input,
        };
      }
      break;
    case 'MARKET':
      if (parts[1] === 'VIEW') {
        return {
          type: 'MARKET_VIEW',
          args: [],
          raw: input,
        };
      }
      break;
    case 'SETTINGS':
      return {
        type: 'SETTINGS',
        args: [],
        raw: input,
      };
    case 'HELP':
      return {
        type: 'HELP',
        args: [],
        raw: input,
      };
  }

  return {
    type: 'UNKNOWN',
    args: [],
    raw: input,
  };
};

export const getCommandSuggestions = (input: string, appNames: string[] = []): string[] => {
  const trimmed = input.trim().toUpperCase();
  const commands = [
    'LOAD',
    'NEW TAB',
    'CLOSE TAB',
    'MARKET VIEW',
    'SETTINGS',
    'HELP',
  ];

  // If input starts with "LOAD" or is empty, include app names
  const shouldIncludeApps = !trimmed || trimmed.startsWith('LOAD');
  
  let allSuggestions: string[] = [];
  
  if (!trimmed) {
    allSuggestions = [...commands];
    if (shouldIncludeApps) {
      allSuggestions.push(...appNames.map(name => `LOAD ${name}`));
    }
    return allSuggestions;
  }

  // Filter commands
  const matchingCommands = commands.filter(cmd => 
    cmd.startsWith(trimmed) || 
    cmd.includes(trimmed)
  );
  
  allSuggestions = [...matchingCommands];
  
  // If user typed "LOAD" or starts typing an app name, include app suggestions
  if (shouldIncludeApps) {
    const loadPrefix = trimmed.startsWith('LOAD') ? trimmed.substring(4).trim() : trimmed;
    
    if (loadPrefix) {
      // User is typing after "LOAD" - suggest matching app names
      const matchingApps = appNames
        .filter(name => name.toUpperCase().startsWith(loadPrefix) || name.toUpperCase().includes(loadPrefix))
        .map(name => `LOAD ${name}`);
      allSuggestions.push(...matchingApps);
    } else if (trimmed.startsWith('LOAD')) {
      // User typed "LOAD" - show all apps
      allSuggestions.push(...appNames.map(name => `LOAD ${name}`));
    } else {
      // User might be typing an app name directly
      const matchingApps = appNames
        .filter(name => name.toUpperCase().startsWith(trimmed) || name.toUpperCase().includes(trimmed))
        .map(name => `LOAD ${name}`);
      allSuggestions.push(...matchingApps);
    }
  }
  
  return allSuggestions;
};

