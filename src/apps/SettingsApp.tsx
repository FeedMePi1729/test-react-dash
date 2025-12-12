import { useState, useEffect } from 'react';

export interface SettingsData {
    username: string;
    timezone: string;
    fontSize: 'small' | 'medium' | 'large';
}

export const SettingsApp = () => {
    const [settings, setSettings] = useState<SettingsData>(() => {
        // Load from localStorage or use defaults
        const saved = localStorage.getItem('dashboard-settings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse settings:', e);
            }
        }
        return {
            username: '',
            timezone: 'UTC',
            fontSize: 'medium',
        };
    });

    useEffect(() => {
        // Save to localStorage whenever settings change
        localStorage.setItem('dashboard-settings', JSON.stringify(settings));

        // Apply font size globally
        const root = document.documentElement;
        switch (settings.fontSize) {
            case 'small':
                root.style.setProperty('--font-size-base', '12px');
                break;
            case 'medium':
                root.style.setProperty('--font-size-base', '14px');
                break;
            case 'large':
                root.style.setProperty('--font-size-base', '16px');
                break;
        }
    }, [settings]);

    const timezones = [
        'UTC',
        'America/New_York (EST)',
        'America/Chicago (CST)',
        'America/Denver (MST)',
        'America/Los_Angeles (PST)',
        'Europe/London (GMT)',
        'Europe/Paris (CET)',
        'Asia/Tokyo (JST)',
        'Asia/Shanghai (CST)',
        'Australia/Sydney (AEDT)',
    ];

    const handleChange = (field: keyof SettingsData, value: string) => {
        setSettings(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const fontSizeOptions = [
        { value: 'small', label: 'Small (12px)' },
        { value: 'medium', label: 'Medium (14px)' },
        { value: 'large', label: 'Large (16px)' },
    ];

    return (
        <div className="p-4 h-full w-full overflow-auto bloomberg-bg-black">
            <h2 className="text-bloomberg-amber text-lg mb-6 font-mono">SETTINGS</h2>

            <div className="space-y-6 max-w-2xl">
                {/* Username */}
                <div className="bloomberg-border bloomberg-border-amber p-4">
                    <label className="block text-bloomberg-amber text-sm font-mono mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        value={settings.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        placeholder="Enter your username"
                        className="bg-black text-white font-mono text-sm px-3 py-2 bloomberg-border bloomberg-border-amber outline-none w-full"
                    />
                    {settings.username && (
                        <p className="text-white text-xs font-mono mt-2">
                            Welcome, <span className="text-bloomberg-amber">{settings.username}</span>
                        </p>
                    )}
                </div>

                {/* Timezone */}
                <div className="bloomberg-border bloomberg-border-amber p-4">
                    <label className="block text-bloomberg-amber text-sm font-mono mb-2">
                        Timezone
                    </label>
                    <select
                        value={settings.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                        className="bg-black text-white font-mono text-sm px-3 py-2 bloomberg-border bloomberg-border-amber outline-none w-full cursor-pointer"
                    >
                        {timezones.map(tz => (
                            <option key={tz} value={tz} className="bg-black">
                                {tz}
                            </option>
                        ))}
                    </select>
                    <p className="text-white text-xs font-mono mt-2 opacity-70">
                        Current time: {new Date().toLocaleString('en-US', { timeZone: settings.timezone.split(' ')[0] })}
                    </p>
                </div>

                {/* Font Size */}
                <div className="bloomberg-border bloomberg-border-amber p-4">
                    <label className="block text-bloomberg-amber text-sm font-mono mb-2">
                        Font Size
                    </label>
                    <div className="space-y-3">
                        {fontSizeOptions.map(option => (
                            <label
                                key={option.value}
                                className="flex items-center cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name="fontSize"
                                    value={option.value}
                                    checked={settings.fontSize === option.value}
                                    onChange={(e) => handleChange('fontSize', e.target.value as SettingsData['fontSize'])}
                                    className="mr-3 accent-bloomberg-amber"
                                />
                                <span className="text-white font-mono text-sm">{option.label}</span>
                            </label>
                        ))}
                    </div>
                    <div className="mt-4 p-3 bloomberg-border bloomberg-border">
                        <p className="text-white text-xs font-mono mb-2">Preview:</p>
                        <p className="text-white font-mono" style={{ fontSize: settings.fontSize === 'small' ? '12px' : settings.fontSize === 'medium' ? '14px' : '16px' }}>
                            The quick brown fox jumps over the lazy dog. 1234567890
                        </p>
                    </div>
                </div>

                {/* Theme (placeholder for future) */}
                <div className="bloomberg-border bloomberg-border-amber p-4">
                    <label className="block text-bloomberg-amber text-sm font-mono mb-2">
                        Theme
                    </label>
                    <div className="flex items-center">
                        <span className="text-white font-mono text-sm">Bloomberg Terminal</span>
                        <span className="ml-2 text-white text-xs font-mono opacity-50">(Default)</span>
                    </div>
                </div>

                {/* Reset Button */}
                <div className="bloomberg-border bloomberg-border-amber p-4">
                    <button
                        onClick={() => {
                            const defaults: SettingsData = {
                                username: '',
                                timezone: 'UTC',
                                fontSize: 'medium',
                            };
                            setSettings(defaults);
                            localStorage.setItem('dashboard-settings', JSON.stringify(defaults));
                        }}
                        className="bg-black text-bloomberg-amber font-mono text-sm px-4 py-2 bloomberg-border bloomberg-border-amber hover:bg-bloomberg-amber hover:text-black transition-colors cursor-pointer"
                    >
                        Reset to Defaults
                    </button>
                </div>
            </div>
        </div>
    );
};
