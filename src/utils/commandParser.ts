import { ParsedCommand, SuggestionContext } from './types';
import { strategies } from './strategies';

export const parseCommand = (input: string): ParsedCommand => {
  const trimmed = input.trim().toUpperCase();
  const parts = trimmed.split(/\s+/);
  const command = parts[0];

  const strategy = strategies[command];
  if (strategy && strategy.match(parts)) {
    return strategy.parse(input, parts);
  }

  return {
    type: 'UNKNOWN',
    args: [],
    raw: input,
  };
};

export const getCommandSuggestions = (input: string, appNames: string[] = [], savedViews: string[] = []): string[] => {
  const trimmed = input.trim().toUpperCase();
  const context: SuggestionContext = { appNames, savedViews };

  // If empty input, return all top-level suggestions + all LOAD <app> for convenience
  if (!trimmed) {
    const suggestions: string[] = [];
    Object.values(strategies).forEach(s => {
      if (s.suggestion) suggestions.push(s.suggestion);
    });
    // Add "LOAD <app>" for all apps as a convenience for empty state
    suggestions.push(...appNames.map(name => `LOAD ${name}`));
    return suggestions.sort();
  }

  const parts = trimmed.split(/\s+/);
  const commandKey = parts[0];
  const activeStrategy = strategies[commandKey];

  // 1. If we have a matching strategy (e.g. "LOAD"), let it handle specific suggestions
  if (activeStrategy && activeStrategy.getSuggestions) {
    return activeStrategy.getSuggestions(input, context);
  }

  // 2. Generic Partial Match: Filter top-level commands that match the input
  const topLevelMatches = Object.values(strategies)
    .map(s => s.suggestion)
    .filter((s): s is string => !!s && (s.startsWith(trimmed) || s.includes(trimmed)));

  // 3. Also check for "LOAD <app>" matches even if "LOAD" isn't the primary match yet (e.g. typing "mark" might suggest "LOAD market-view"?)
  // The original requirement logic had a "shouldIncludeApps" flag.
  // If the user is just typing a random string "FOO", we probably don't want to suggest "LOAD BAR" unless it matches?
  // Let's preserve the original behavior: if it's NOT a specific command, check if it matches an app name for "LOAD <app>"

  const appMatches = appNames
    .filter(name => name.toUpperCase().startsWith(trimmed) || name.toUpperCase().includes(trimmed))
    .map(name => `LOAD ${name}`);

  return [...new Set([...topLevelMatches, ...appMatches])].sort();
};
