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

export const getCommandSuggestions = (input: string): string[] => {
  const trimmed = input.trim().toUpperCase();
  const commands = [
    'LOAD',
    'NEW TAB',
    'CLOSE TAB',
    'MARKET VIEW',
    'SETTINGS',
    'HELP',
  ];

  if (!trimmed) {
    return commands;
  }

  return commands.filter(cmd => 
    cmd.startsWith(trimmed) || 
    cmd.includes(trimmed)
  );
};

