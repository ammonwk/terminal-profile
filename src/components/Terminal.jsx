import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minus, X, ChevronRight } from 'lucide-react';

const Terminal = () => {
    const [history, setHistory] = useState(['Welcome to TechOS Terminal v1.0.0', 'Type "help" to see available commands.']);
    const [currentCommand, setCurrentCommand] = useState('');
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showMatrix, setShowMatrix] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [terminalColor, setTerminalColor] = useState('#00ff00');

    const terminalEndRef = useRef(null);
    const inputRef = useRef(null);
    const terminalRef = useRef(null);

    // Auto-scroll effect
    useEffect(() => {
        scrollToBottom();
    }, [history]);

    // Click-to-focus effect
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (terminalRef.current && !terminalRef.current.contains(event.target)) {
                inputRef.current?.blur();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const scrollToBottom = () => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const focusInput = () => {
        inputRef.current?.focus();
    };

    const generateMatrix = () => {
        return Array.from({ length: 20 }, () =>
            Array.from({ length: 80 }, () =>
                Math.random() > 0.5 ? '1' : '0'
            ).join('')
        );
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
        // Restore focus when un-minimizing
        if (isMinimized) {
            setTimeout(focusInput, 100);
        }
    };

    const processOutput = (output) => {
        if (!output) return [];
        return output.split('\n');
    };

    const handleCommand = (command) => {
        switch (command.toLowerCase()) {
            case 'help':
                return `Available commands:
- help: Display this help message
- clear: Clear the terminal screen
- echo [text]: Display the text
- date: Show current date and time
- matrix: Toggle Matrix-style animation
- whoami: Display current user
- color [green/blue/purple]: Change terminal text color
- systeminfo: Display system information
- joke: Tell a random programming joke
- calc [expression]: Simple calculator (e.g., calc 2 + 2)`;

            case 'clear':
                setHistory([]);
                return null;

            case 'date':
                return new Date().toLocaleString();

            case 'matrix':
                setShowMatrix(!showMatrix);
                return 'Matrix mode toggled...';

            case 'whoami':
                return 'guest@TechOS';

            case 'systeminfo':
                return `OS: TechOS v1.0.0
Terminal: React Terminal
Memory: 640K (should be enough for anybody)
CPU: Quantum Core i9
Resolution: Yes
Status: Optimal`;

            case 'joke':
                const jokes = [
                    "Why do programmers prefer dark mode? Because light attracts bugs!",
                    "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
                    "Why do JavaScript developers need glasses? Because they don't see sharp!"
                ];
                return jokes[Math.floor(Math.random() * jokes.length)];

            default:
                if (command.startsWith('echo ')) {
                    return command.slice(5);
                }
                if (command.startsWith('color ')) {
                    const color = command.slice(6);
                    const colorMap = {
                        green: '#00ff00',
                        blue: '#00ffff',
                        purple: '#ff00ff'
                    };
                    if (colorMap[color]) {
                        setTerminalColor(colorMap[color]);
                        return `Terminal color changed to ${color}`;
                    }
                }
                if (command.startsWith('calc ')) {
                    try {
                        const expression = command.slice(5);
                        const result = new Function('return ' + expression)();
                        return `${expression} = ${result}`;
                    } catch {
                        return 'Invalid expression';
                    }
                }
                return `Command not found: ${command}. Type 'help' for available commands.`;
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            const command = currentCommand.trim();
            if (command) {
                setCommandHistory([command, ...commandHistory]);
                setHistoryIndex(-1);
                const response = handleCommand(command);
                const newLines = [...history, `> ${command}`, ...(processOutput(response))].filter(Boolean);
                setHistory(newLines);
                setCurrentCommand('');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setCurrentCommand(commandHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setCurrentCommand(commandHistory[newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setCurrentCommand('');
            }
        }
    };

    if (isMinimized) {
        return (
            <div
                className="fixed bottom-0 left-0 bg-gray-800 p-2 rounded-t-lg cursor-pointer flex items-center gap-2"
                onClick={toggleMinimize}
            >
                <TerminalIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-200 text-sm">TechOS Terminal</span>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-900 p-4 font-mono" ref={terminalRef}>
            <div className="h-full">
                <div className="h-full bg-gray-950 rounded-lg shadow-2xl border border-gray-800 flex flex-col">
                    {/* Terminal header */}
                    <div className="bg-gray-800 p-2 rounded-t-lg flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <TerminalIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-200 text-sm">TechOS Terminal</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="hover:bg-gray-700 p-1 rounded"
                                onClick={toggleMinimize}
                            >
                                <Minus className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                                className="hover:bg-gray-700 p-1 rounded"
                                onClick={toggleFullscreen}
                            >
                                <Maximize2 className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                                className="hover:bg-red-500 p-1 rounded"
                                onClick={() => setHistory(['Terminal reset.'])}
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Terminal content */}
                    <div
                        className="flex-1 p-4 overflow-auto relative bg-black"
                        onClick={focusInput}
                        style={{ whiteSpace: 'pre-wrap' }}
                    >
                        {showMatrix && (
                            <div className="absolute inset-0 text-green-500 opacity-20 pointer-events-none overflow-hidden">
                                {generateMatrix().map((row, i) => (
                                    <div key={i} className="animate-matrix">{row}</div>
                                ))}
                            </div>
                        )}
                        <div className="relative z-10">
                            {history.map((line, index) => (
                                <div
                                    key={index}
                                    className="mb-1"
                                    style={{ color: terminalColor }}
                                >
                                    {line}
                                </div>
                            ))}
                            <div className="flex items-center">
                                <ChevronRight
                                    className="w-4 h-4 mr-1"
                                    style={{ color: terminalColor }}
                                />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={currentCommand}
                                    onChange={(e) => setCurrentCommand(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="flex-1 bg-transparent outline-none"
                                    style={{ color: terminalColor }}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div ref={terminalEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terminal;