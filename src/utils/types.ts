export type CommandType = 'LOAD' | 'NEW_TAB' | 'CLOSE_TAB' | 'SETTINGS' | 'HELP' | 'SAVE' | 'LOAD_VIEW' | 'LIST_VIEWS' | 'UNKNOWN';

export interface ParsedCommand {
    type: CommandType;
    args: string[];
    raw: string;
}

export interface SuggestionContext {
    appNames: string[];
    savedViews: string[];
}

export interface CommandStrategy {
    match: (parts: string[]) => boolean;
    parse: (input: string, parts: string[]) => ParsedCommand;
    suggestion?: string;
    getSuggestions?: (input: string, context: SuggestionContext) => string[];
}
