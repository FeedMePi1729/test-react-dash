import { CommandStrategy } from './types';

export const strategies: Record<string, CommandStrategy> = {
    'LOAD': {
        match: (parts) => parts[0] === 'LOAD',
        parse: (input, parts) => {
            // Check if it's "LOAD VIEW" (two-word command)
            if (parts[1] === 'VIEW') {
                return {
                    type: 'LOAD_VIEW',
                    args: parts.slice(2),
                    raw: input,
                };
            }
            return {
                type: 'LOAD',
                args: parts.slice(1),
                raw: input,
            };
        },
        suggestion: 'LOAD',
        getSuggestions: (input, context) => {
            const trimmed = input.trim().toUpperCase();
            const isLoadView = trimmed.startsWith('LOAD VIEW');
            const loadViewPrefix = isLoadView ? trimmed.substring(9).trim() : '';
            const loadPrefix = trimmed.startsWith('LOAD') ? trimmed.substring(4).trim() : '';

            const suggestions: string[] = [];

            // 1. Handle LOAD VIEW suggestions
            if (isLoadView) {
                if (loadViewPrefix) {
                    // User typed "LOAD VIEW <something>"
                    const matchingViews = context.savedViews
                        .filter(view => view.toUpperCase().startsWith(loadViewPrefix) || view.toUpperCase().includes(loadViewPrefix))
                        .map(view => `LOAD VIEW ${view}`);
                    suggestions.push(...matchingViews);
                } else {
                    // User typed exactly "LOAD VIEW"
                    suggestions.push(...context.savedViews.map(view => `LOAD VIEW ${view}`));
                }
            }
            // 2. Handle LOAD suggestions (Apps)
            else {
                // Only show app suggestions if we are NOT committed to "LOAD VIEW"
                // If the user typed "LOAD V", they might mean "LOAD VIEW" or "LOAD <App starting with V>"
                // But "LOAD VIEW" logic above covers the specific VIEW case if it matched. 
                // Here we generally suggest apps for `LOAD ...`

                if (loadPrefix) {
                    const matchingApps = context.appNames
                        .filter(name => name.toUpperCase().startsWith(loadPrefix) || name.toUpperCase().includes(loadPrefix))
                        .map(name => `LOAD ${name}`);
                    suggestions.push(...matchingApps);
                } else {
                    // Just "LOAD" -> Suggest all apps
                    suggestions.push(...context.appNames.map(name => `LOAD ${name}`));
                }

                // Also suggest "LOAD VIEW" itself if it matches the prefix
                if ('VIEW'.startsWith(loadPrefix)) {
                    suggestions.push('LOAD VIEW');
                }
            }
            return suggestions;
        }
    },
    'SAVE': {
        match: (parts) => parts[0] === 'SAVE',
        parse: (input, parts) => ({
            type: 'SAVE',
            args: parts.slice(1),
            raw: input,
        }),
        suggestion: 'SAVE'
    },
    'LIST': {
        match: (parts) => parts[0] === 'LIST' && parts[1] === 'VIEWS',
        parse: (input) => ({
            type: 'LIST_VIEWS',
            args: [],
            raw: input,
        }),
        suggestion: 'LIST VIEWS'
    },
    'NEW': {
        match: (parts) => parts[0] === 'NEW' && parts[1] === 'TAB',
        parse: (input) => ({
            type: 'NEW_TAB',
            args: [],
            raw: input,
        }),
        suggestion: 'NEW TAB'
    },
    'CLOSE': {
        match: (parts) => parts[0] === 'CLOSE' && parts[1] === 'TAB',
        parse: (input, parts) => ({
            type: 'CLOSE_TAB',
            args: parts.slice(2),
            raw: input,
        }),
        suggestion: 'CLOSE TAB'
    },
    'SETTINGS': {
        match: (parts) => parts[0] === 'SETTINGS',
        parse: (input) => ({
            type: 'SETTINGS',
            args: [],
            raw: input,
        }),
        suggestion: 'SETTINGS'
    },
    'HELP': {
        match: (parts) => parts[0] === 'HELP',
        parse: (input) => ({
            type: 'HELP',
            args: [],
            raw: input,
        }),
        suggestion: 'HELP'
    }
};
