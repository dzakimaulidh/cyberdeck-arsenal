// ============================================
// CYBERDECK — MAIN.JS (FINAL CLEAN VERSION)
// ============================================

// ============ GLOBAL VARIABLES ============
let commandHistory = [];
let historyIndex = -1;
let termBody, termInput;
let keySequence = [];
let keySequenceTimeout;

// ============ UTILITY FUNCTIONS ============
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
    );
}

// ============ PLAYBOOK TOGGLE ============
function togglePlaybook(header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.playbook-toggle');
    const isOpen = content.classList.contains('open');

    if (isOpen) {
        content.classList.remove('open');
        toggle.textContent = '[+]';
    } else {
        content.classList.add('open');
        toggle.textContent = '[-]';
    }
}

// ============ TOAST NOTIFICATION ============
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = { success: '[✓]', error: '[✗]', warning: '[!]', info: '[i]' };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============ COPY TO CLIPBOARD ============
function copyOutput(elementId) {
    const element = document.getElementById(elementId);
    if (!element || !element.value) {
        showToast('Nothing to copy', 'warning');
        return;
    }

    navigator.clipboard.writeText(element.value).then(() => {
        showToast('Copied to clipboard', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

// ============ TERMINAL FUNCTIONS ============
function addTermLine(content, className = '') {
    if (!termBody) return;
    const line = document.createElement('div');
    line.className = 'term-line ' + className;
    line.innerHTML = content;
    termBody.appendChild(line);
    termBody.scrollTop = termBody.scrollHeight;
}

function clearTerminal() {
    if (termBody) {
        termBody.innerHTML = '';
        addTermLine('<span class="info">Terminal cleared.</span>');
        showToast('Terminal cleared', 'success');
    }
}

function autocompleteCommand() {
    if (!termInput) return;
    const input = termInput.value.toLowerCase();
    const commands = ['help', 'whoami', 'date', 'clear', 'ls', 'cat', 'scan', 'version', 'exit', 'open', 'shortcuts', 'search', 'navigate'];
    const matches = commands.filter(cmd => cmd.startsWith(input));

    if (matches.length === 1) {
        termInput.value = matches[0] + ' ';
    } else if (matches.length > 1) {
        addTermLine(`<span class="prompt">❯</span> <span class="cmd">${escapeHtml(input)}</span>`);
        addTermLine(`<span class="info">Suggestions:</span> ${matches.join(', ')}`);
    }
}

// ============ TERMINAL COMMAND PROCESSOR ============
function processCommand(cmd) {
    cmd = cmd.trim();
    if (!cmd) return;

    addTermLine(`<span class="prompt">❯</span> <span class="cmd">${escapeHtml(cmd)}</span>`);

    const words = cmd.split(/\s+/);
    if (words.length > 3 && !cmd.includes('[') && !cmd.includes('-')) {
        addTermLine(`<span class="warning">[!]</span> That looks like a description, not a command`);
        addTermLine(`<span class="info">[i]</span> Try typing just the command name (e.g., <span class="cmd">whoami</span>, <span class="cmd">date</span>)`);
        addTermLine(`<span class="info">[i]</span> Type <span class="cmd">help</span> to see available commands`);
        addTermLine('');
        return;
    }

    const parts = cmd.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    const aliases = {
        'whoami': ['whoami', 'who', 'user', 'me', 'id'],
        'date': ['date', 'time', 'now', 'clock', 'when'],
        'clear': ['clear', 'cls', 'reset', 'clean'],
        'help': ['help', '?', 'h', 'man', 'info'],
        'ls': ['ls', 'list', 'dir', 'tools', 'all'],
        'cat': ['cat', 'info', 'show', 'view', 'about'],
        'scan': ['scan', 'nmap', 'ping', 'check'],
        'exit': ['exit', 'quit', 'bye', 'logout', 'close'],
        'version': ['version', 'ver', 'v', 'about'],
        'open': ['open', 'run', 'launch', 'start', 'execute'],
        'shortcuts': ['shortcuts', 'keys', 'hotkeys', 'binds'],
        'search': ['search', 'find', 'query', 'lookup'],
        'navigate': ['navigate', 'nav', 'go', 'cd', 'goto']
    };

    let actualCommand = command;
    for (const [real, aliasList] of Object.entries(aliases)) {
        if (aliasList.includes(command)) {
            actualCommand = real;
            break;
        }
    }

    switch (actualCommand) {
        case 'help':
        case '?':
            addTermLine('');
            addTermLine('<span class="info">╔══════════════════════════════════════════════════════╗</span>');
            addTermLine('<span class="info">║</span>  <span class="warning">CYBERDECK TERMINAL COMMANDS</span>                          <span class="info">║</span>');
            addTermLine('<span class="info">╚══════════════════════════════════════════════════════╝</span>');
            addTermLine('');
            addTermLine('<span class="success">NAVIGATION:</span>');
            addTermLine('  <span class="cmd">help</span>              Show this help message');
            addTermLine('  <span class="cmd">navigate [page]</span>   Go to page (home, tools, wiki, blueteam)');
            addTermLine('  <span class="cmd">open [tool]</span>       Open a tool (base64, jwt, url, hash, password)');
            addTermLine('');
            addTermLine('<span class="success">SYSTEM:</span>');
            addTermLine('  <span class="cmd">whoami</span>            Show current user info');
            addTermLine('  <span class="cmd">date</span>              Show current date/time');
            addTermLine('  <span class="cmd">version</span>           Show CyberDeck version');
            addTermLine('  <span class="cmd">shortcuts</span>         Show keyboard shortcuts');
            addTermLine('');
            addTermLine('<span class="success">TOOLS:</span>');
            addTermLine('  <span class="cmd">ls</span>                List all available tools');
            addTermLine('  <span class="cmd">cat [tool]</span>        Show tool information');
            addTermLine('  <span class="cmd">scan [target]</span>     Simulate port scan');
            addTermLine('  <span class="cmd">search [query]</span>    Search for tools');
            addTermLine('');
            addTermLine('<span class="success">TERMINAL:</span>');
            addTermLine('  <span class="cmd">clear</span>             Clear terminal screen');
            addTermLine('  <span class="cmd">exit</span>              Exit terminal session');
            addTermLine('');
            addTermLine('<span class="info">TIPS:</span>');
            addTermLine('  • Use <span class="cmd">↑ ↓</span> arrow keys to navigate command history');
            addTermLine('  • Press <span class="cmd">TAB</span> for autocomplete');
            addTermLine('  • Type <span class="cmd">open base64</span> to open Base64 tool');
            addTermLine('');
            break;

        case 'whoami':
            addTermLine('');
            addTermLine('<span class="success">┌─────────────────────────────────────┐</span>');
            addTermLine('<span class="success">│</span>  <span class="warning">USER PROFILE</span>                          <span class="success">│</span>');
            addTermLine('<span class="success">└─────────────────────────────────────┘</span>');
            addTermLine('');
            addTermLine('  Username:    <span class="info">ops@cyberdeck</span>');
            addTermLine('  Role:        <span class="info">Blue Team Analyst</span>');
            addTermLine('  Level:       <span class="warning">3</span> <span class="mute">(Advanced)</span>');
            addTermLine('  Session:     <span class="info">cd-blue-0xf3a1</span>');
            addTermLine('  Permissions: <span class="success">READ, EXECUTE, ANALYZE</span>');
            addTermLine('  Last Login:  <span class="mute">' + new Date().toLocaleString() + '</span>');
            addTermLine('');
            break;

        case 'date':
            const now = new Date();
            addTermLine('');
            addTermLine('<span class="success">┌─────────────────────────────────────┐</span>');
            addTermLine('<span class="success">│</span>  <span class="warning">SYSTEM TIME</span>                           <span class="success">│</span>');
            addTermLine('<span class="success">└─────────────────────────────────────┘</span>');
            addTermLine('');
            addTermLine('  Local:    <span class="info">' + now.toLocaleString() + '</span>');
            addTermLine('  UTC:      <span class="info">' + now.toUTCString() + '</span>');
            addTermLine('  ISO:      <span class="info">' + now.toISOString() + '</span>');
            addTermLine('  Unix:     <span class="info">' + Math.floor(now.getTime() / 1000) + '</span>');
            addTermLine('  Timezone: <span class="info">' + Intl.DateTimeFormat().resolvedOptions().timeZone + '</span>');
            addTermLine('');
            break;

        case 'version':
            addTermLine('');
            addTermLine('<span class="info">╔══════════════════════════════════════════════════════╗</span>');
            addTermLine('<span class="info">║</span>  <span class="warning">CYBERDECK BLUE TEAM EDITION</span>                    <span class="info">║</span>');
            addTermLine('<span class="info">╠══════════════════════════════════════════════════════╣</span>');
            addTermLine('<span class="info">║</span>  Version:  <span class="success">v2.4.1</span>                              <span class="info">║</span>');
            addTermLine('<span class="info">║</span>  Build:    <span class="success">20260603-stable</span>                     <span class="info">║</span>');
            addTermLine('<span class="info">║</span>  Tools:    <span class="success">12+</span>                                 <span class="info">║</span>');
            addTermLine('<span class="info">║</span>  Mode:     <span class="success">DARK ONLY</span>                           <span class="info">║</span>');
            addTermLine('<span class="info">╚══════════════════════════════════════════════════════╝</span>');
            addTermLine('');
            break;

        case 'scan':
            const target = args[0] || '192.168.1.0/24';
            addTermLine('');
            addTermLine(`<span class="info">[*]</span> Initializing scan on target: <span class="cmd">${escapeHtml(target)}</span>`);
            addTermLine(`<span class="info">[*]</span> Scan type: <span class="warning">STEALTH_SYN (SIMULATION)</span>`);
            addTermLine('');
            
            setTimeout(() => addTermLine(`<span class="success">[✓]</span> Target acquired — <span class="info">254</span> hosts in scope`), 400);
            setTimeout(() => addTermLine(`<span class="info">[~]</span> Running stealth port scan...`), 800);
            setTimeout(() => addTermLine(`<span class="success">[✓]</span> <span class="info">12</span> live hosts discovered`), 1400);
            setTimeout(() => addTermLine(`<span class="warning">[!]</span> Anomaly detected on <span class="cmd">192.168.1.47</span> — port <span class="danger">4444</span> OPEN`), 2000);
            setTimeout(() => addTermLine(`<span class="danger">[✗]</span> CVE-2026-0911 match — <span class="danger">PRIORITY: HIGH</span>`), 2600);
             setTimeout(() => {
        addTermLine('');
        addTermLine(`<span class="success">[✓]</span> Scan complete (SIMULATION).`);
        addTermLine(`<span class="info">[i]</span> Note: This is a demo scan. No real network activity.`);
        addTermLine('');
        // Truncate long path untuk mobile
        const reportPath = `/ops/reports/scan_${target.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
        const displayPath = window.innerWidth < 640 
            ? `.../scan_${Date.now()}.json`  // Truncate di mobile
            : reportPath;  // Full path di desktop
        addTermLine(`<span class="success">[✓]</span> Report saved → <span class="info">${displayPath}</span>`);
        addTermLine('');
        }, 4200);
        break;

        case 'ls':
            addTermLine('');
            addTermLine('<span class="info">╔══════════════════════════════════════════════════════╗</span>');
            addTermLine('<span class="info">║</span>  <span class="warning">AVAILABLE TOOLS (12)</span>                                     <span class="info">║</span>');
            addTermLine('<span class="info">╚══════════════════════════════════════════════════════╝</span>');
            addTermLine('');
            addTermLine('<span class="success">[CRYPTOGRAPHY]</span>');
            addTermLine('  <span class="cmd">base64</span>      Base64 encoder/decoder');
            addTermLine('  <span class="cmd">jwt</span>         JWT decoder');
            addTermLine('  <span class="cmd">hash</span>        Hash generator (SHA, MD5)');
            addTermLine('');
            addTermLine('<span class="success">[ENCODING]</span>');
            addTermLine('  <span class="cmd">url</span>         URL encoder/decoder');
            addTermLine('  <span class="cmd">hex</span>         Hex encoder/decoder');
            addTermLine('');
            addTermLine('<span class="success">[WEB SECURITY]</span>');
            addTermLine('  <span class="cmd">password</span>    Secure password generator');
            addTermLine('');
            addTermLine('<span class="success">[NETWORK]</span>');
            addTermLine('  <span class="cmd">subnet</span>      Subnet calculator');
            addTermLine('');
            addTermLine('<span class="success">[TEXT TOOLS]</span>');
            addTermLine('  <span class="cmd">regex</span>       Regex tester');
            addTermLine('  <span class="cmd">json</span>        JSON formatter');
            addTermLine('');
            addTermLine('<span class="success">[TIME/DATE]</span>');
            addTermLine('  <span class="cmd">timestamp</span>   Unix timestamp converter');
            addTermLine('');
            addTermLine('<span class="success">[UTILITIES]</span>');
            addTermLine('  <span class="cmd">uuid</span>        UUID v4 generator');
            addTermLine('');
            addTermLine('<span class="info">TIP:</span> Use <span class="cmd">open [tool]</span> to launch a tool');
            addTermLine('');
            break;

        case 'cat':
            if (!args[0]) {
                addTermLine('<span class="danger">[!]</span> Usage: cat [tool-name]');
            } else {
                addTermLine(`<span class="info">[i]</span> Tool: ${args[0]}`);
                addTermLine(`<span class="info">[i]</span> Use <span class="cmd">open ${args[0]}</span> to launch`);
            }
            break;

        case 'clear':
            if (termBody) {
                termBody.innerHTML = '';
                addTermLine('<span class="success">[✓]</span> Terminal cleared');
            }
            break;

        case 'shortcuts':
            openShortcutsModal();
            addTermLine('<span class="success">[✓]</span> Keyboard shortcuts modal opened');
            break;

        case 'search':
            const query = args.join(' ');
            if (!query) {
                addTermLine('<span class="danger">[!]</span> Usage: search [query]');
            } else {
                addTermLine(`<span class="info">[*]</span> Searching for: "${escapeHtml(query)}"...`);
                addTermLine(`<span class="success">[✓]</span> Use Command Palette (Ctrl+K) for better search`);
            }
            break;

        case 'navigate':
        case 'nav':
        case 'go':
        case 'cd':
            const page = args[0];
            if (!page) {
                addTermLine('<span class="danger">[!]</span> Usage: navigate [page]');
                addTermLine('<span class="info">[i]</span> Pages: home, tools, wiki, blueteam');
            } else {
                const pages = {
                    'home': 'index.html',
                    'tools': 'tools.html',
                    'wiki': 'wiki.html',
                    'blueteam': 'blueteam.html'
                };
                if (pages[page]) {
                    addTermLine(`<span class="info">[→]</span> Navigating to <span class="info">${escapeHtml(page)}</span>...`);
                    setTimeout(() => { window.location.href = pages[page]; }, 500);
                } else {
                    addTermLine(`<span class="danger">[!]</span> Page not found: ${escapeHtml(page)}`);
                }
            }
            break;

        case 'open':
        case 'run':
        case 'launch':
        case 'start':
            const toolToRun = args[0];
            if (toolToRun) {
                const validTools = ['base64', 'jwt', 'url', 'hash', 'password', 'subnet', 'regex', 'timestamp', 'json', 'hex', 'uuid', 'html-entity'];
                if (validTools.includes(toolToRun)) {
                    addTermLine(`<span class="info">[→]</span> Opening <span class="info">${escapeHtml(toolToRun)}</span> tool...`);
                    setTimeout(() => { window.location.href = `tools.html?id=${toolToRun}`; }, 500);
                } else {
                    addTermLine(`<span class="danger">[!]</span> Tool not found: ${escapeHtml(toolToRun)}`);
                    addTermLine(`<span class="info">[i]</span> Available: ${validTools.join(', ')}`);
                }
            } else {
                addTermLine('<span class="danger">[!]</span> Usage: open [tool-name]');
            }
            break;

        case 'exit':
        case 'quit':
            addTermLine('');
            addTermLine('<span class="warning">[!]</span> Terminal session ended');
            addTermLine('<span class="info">[i]</span> Refresh page to restart terminal');
            addTermLine('');
            if (termInput) {
                termInput.disabled = true;
                termInput.placeholder = 'Terminal closed - refresh to restart';
            }
            break;

        default:
            addTermLine(`<span class="danger">[!]</span> Command not found: <span class="cmd">${escapeHtml(command)}</span>`);
            addTermLine(`<span class="info">[i]</span> Type <span class="cmd">help</span> for available commands`);
            addTermLine('');
    }
}

// ============ MOBILE MENU ============
function toggleMobileMenu() {
    const navLinks = document.getElementById('nav-links');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (navLinks && menuBtn) {
        navLinks.classList.toggle('active');
        menuBtn.textContent = navLinks.classList.contains('active') ? '[×]' : '[☰]';
    }
}

// ============ COMMAND PALETTE ============
const commandPaletteOverlay = document.getElementById('command-palette-overlay');
const commandPaletteInput = document.getElementById('command-palette-input');
const commandPaletteResults = document.getElementById('command-palette-results');

const commands = [
    { title: 'Go to Home', desc: 'Navigate to homepage', shortcut: 'g h', action: () => window.location.href = 'index.html', icon: '[→]', category: 'Navigation' },
    { title: 'Go to Tools', desc: 'Navigate to tools page', shortcut: 'g t', action: () => window.location.href = 'tools.html', icon: '[→]', category: 'Navigation' },
    { title: 'Go to Wiki', desc: 'Navigate to wiki page', shortcut: 'g w', action: () => window.location.href = 'wiki.html', icon: '[→]', category: 'Navigation' },
    { title: 'Go to Blue Team', desc: 'Navigate to blueteam page', shortcut: 'g b', action: () => window.location.href = 'blueteam.html', icon: '[→]', category: 'Navigation' },
    { title: 'Base64 Tool', desc: 'Encode/decode text', action: () => window.location.href = 'tools.html?id=base64', icon: '[+]', category: 'Tools' },
    { title: 'JWT Decoder', desc: 'Inspect JSON Web Tokens', action: () => window.location.href = 'tools.html?id=jwt', icon: '[+]', category: 'Tools' },
    { title: 'URL Encoder', desc: 'Percent-encoding', action: () => window.location.href = 'tools.html?id=url', icon: '[+]', category: 'Tools' },
    { title: 'Hash Generator', desc: 'SHA-256, SHA-1, MD5', action: () => window.location.href = 'tools.html?id=hash', icon: '[+]', category: 'Tools' },
    { title: 'Password Generator', desc: 'Secure password', action: () => window.location.href = 'tools.html?id=password', icon: '[+]', category: 'Tools' },
    { title: 'Subnet Calculator', desc: 'Network calculator', action: () => window.location.href = 'tools.html?id=subnet', icon: '[+]', category: 'Tools' },
    { title: 'Regex Tester', desc: 'Test regex patterns', action: () => window.location.href = 'tools.html?id=regex', icon: '[+]', category: 'Tools' },
    { title: 'Timestamp Converter', desc: 'Unix time converter', action: () => window.location.href = 'tools.html?id=timestamp', icon: '[+]', category: 'Tools' },
    { title: 'JSON Formatter', desc: 'Beautify JSON', action: () => window.location.href = 'tools.html?id=json', icon: '[+]', category: 'Tools' },
    { title: 'Hex Encoder', desc: 'Text to hex', action: () => window.location.href = 'tools.html?id=hex', icon: '[+]', category: 'Tools' },
    { title: 'UUID Generator', desc: 'Generate UUID v4', action: () => window.location.href = 'tools.html?id=uuid', icon: '[+]', category: 'Tools' },
    { title: 'Show Shortcuts', desc: 'View keyboard shortcuts', shortcut: '?', action: openShortcutsModal, icon: '[?]', category: 'Actions' },
    { title: 'Clear Terminal', desc: 'Clear terminal output', shortcut: 'Ctrl+L', action: clearTerminal, icon: '[x]', category: 'Actions' },
];

let selectedCommandIndex = 0;
let filteredCommands = [...commands];

function openCommandPalette() {
    if (!commandPaletteOverlay) return;
    commandPaletteOverlay.classList.add('active');
    commandPaletteInput.value = '';
    selectedCommandIndex = 0;
    filterCommands('');
    setTimeout(() => commandPaletteInput.focus(), 100);
}

function closeCommandPalette() {
    if (!commandPaletteOverlay) return;
    commandPaletteOverlay.classList.remove('active');
}

function filterCommands(query) {
    const lowerQuery = query.toLowerCase();
    filteredCommands = commands.filter(cmd =>
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.desc.toLowerCase().includes(lowerQuery)
    );
    renderCommandResults();
}

function renderCommandResults() {
    if (!commandPaletteResults) return;

    if (filteredCommands.length === 0) {
        commandPaletteResults.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--mute);">
                <div style="font-size: 24px; margin-bottom: 8px;">[?]</div>
                <div>No results found</div>
            </div>`;
        return;
    }

    const grouped = {};
    filteredCommands.forEach(cmd => {
        const cat = cmd.category || 'Other';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(cmd);
    });

    let html = '';
    let globalIndex = 0;
    Object.entries(grouped).forEach(([category, cmds]) => {
        html += `<div style="margin-bottom: 16px;">`;
        html += `<div style="font-size: 11px; color: var(--mute); text-transform: uppercase; letter-spacing: 1px; padding: 8px 16px; font-weight: 700;">${category}</div>`;
        cmds.forEach((cmd) => {
            const idx = globalIndex++;
            html += `
                <div class="command-palette-item ${idx === selectedCommandIndex ? 'selected' : ''}" onclick="executeCommand(${idx})">
                    <span class="command-palette-item-icon">${cmd.icon}</span>
                    <div class="command-palette-item-content">
                        <div class="command-palette-item-title">${cmd.title}</div>
                        <div class="command-palette-item-desc">${cmd.desc}</div>
                    </div>
                    ${cmd.shortcut ? `<span class="command-palette-item-shortcut">${cmd.shortcut}</span>` : ''}
                </div>
            `;
        });
        html += `</div>`;
    });

    commandPaletteResults.innerHTML = html;
}

function executeCommand(index) {
    if (filteredCommands[index]) {
        closeCommandPalette();
        filteredCommands[index].action();
    }
}

// ============ SHORTCUTS MODAL ============
const shortcutsModalOverlay = document.getElementById('shortcuts-modal-overlay');

function openShortcutsModal() {
    if (!shortcutsModalOverlay) return;
    shortcutsModalOverlay.classList.add('active');
}

function closeShortcutsModal() {
    if (!shortcutsModalOverlay) return;
    shortcutsModalOverlay.classList.remove('active');
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Get terminal elements
    termBody = document.getElementById('term-body');
    termInput = document.getElementById('term-input');

    // Setup terminal
    if (termInput) {
        document.querySelector('.interactive-terminal')?.addEventListener('click', () => {
            termInput.focus();
        });

        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = termInput.value.trim();
                if (cmd) {
                    commandHistory.push(cmd);
                    historyIndex = commandHistory.length;
                    processCommand(cmd);
                }
                termInput.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    termInput.value = commandHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    termInput.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    termInput.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                autocompleteCommand();
            }
        });
    }
document.addEventListener('change', (e) => {
        if (e.target.id === 'toggle-rotator') {
            const panel = document.getElementById('rotator-panel');
            if (panel) {
                panel.style.display = e.target.checked ? 'block' : 'none';
            }
        }
    });
    // Setup command palette
    if (commandPaletteInput) {
        commandPaletteInput.addEventListener('input', (e) => {
            selectedCommandIndex = 0;
            filterCommands(e.target.value);
        });

        commandPaletteInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedCommandIndex = Math.min(selectedCommandIndex + 1, filteredCommands.length - 1);
                renderCommandResults();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedCommandIndex = Math.max(selectedCommandIndex - 1, 0);
                renderCommandResults();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                executeCommand(selectedCommandIndex);
            } else if (e.key === 'Escape') {
                closeCommandPalette();
            }
        });
    }

    // Close modals on overlay click
    if (commandPaletteOverlay) {
        commandPaletteOverlay.addEventListener('click', (e) => {
            if (e.target === commandPaletteOverlay) closeCommandPalette();
        });
    }

    if (shortcutsModalOverlay) {
        shortcutsModalOverlay.addEventListener('click', (e) => {
            if (e.target === shortcutsModalOverlay) closeShortcutsModal();
        });
    }

    // Close mobile menu when clicking a link
    document.addEventListener('click', (e) => {
        if (e.target.closest('.nav-links a')) {
            const navLinks = document.getElementById('nav-links');
            const menuBtn = document.querySelector('.mobile-menu-btn');
            if (navLinks && menuBtn) {
                navLinks.classList.remove('active');
                menuBtn.textContent = '[☰]';
            }
        }
    });

    // Welcome toast
    if (!sessionStorage.getItem('welcomed')) {
        setTimeout(() => {
            showToast('Welcome to CyberDeck! Press ? for shortcuts', 'info', 4000);
            sessionStorage.setItem('welcomed', 'true');
        }, 1000);
    }
});

// ============ GLOBAL KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', (e) => {
    // Ctrl+K = Command Palette
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
    }

    // Ctrl+/ = Focus Terminal
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        if (termInput) {
            termInput.focus();
            showToast('Terminal focused', 'info', 1500);
        }
    }

    // Ctrl+L = Clear Terminal
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        clearTerminal();
    }

    // ? = Show Shortcuts
    if (e.key === '?' && !e.ctrlKey && !e.altKey && !isInputFocused()) {
        e.preventDefault();
        openShortcutsModal();
    }

    // Escape = Close modals
    if (e.key === 'Escape') {
        closeCommandPalette();
        closeShortcutsModal();
    }

    // g + h/t/w/b = Navigation
    if (!isInputFocused()) {
        clearTimeout(keySequenceTimeout);
        keySequence.push(e.key);

        if (keySequence.length > 2) keySequence.shift();

        if (keySequence.length === 2 && keySequence[0] === 'g') {
            if (keySequence[1] === 'h') window.location.href = 'index.html';
            else if (keySequence[1] === 't') window.location.href = 'tools.html';
            else if (keySequence[1] === 'w') window.location.href = 'wiki.html';
            else if (keySequence[1] === 'b') window.location.href = 'blueteam.html';
            keySequence = [];
        }

        keySequenceTimeout = setTimeout(() => { keySequence = []; }, 1000);
    }
});

// ============================================
// FLOATING AI CHAT WIDGET - WITH HISTORY
// ============================================
let aiChatOpen = false;
let aiChatHistory = JSON.parse(localStorage.getItem('cyberdeck_chat_history') || '[]');

function toggleAIChat() {
    const chatWindow = document.getElementById('ai-chat-window');
    const chatButton = document.querySelector('.ai-chat-button');
    aiChatOpen = !aiChatOpen;
    
    if (aiChatOpen) {
        chatWindow.classList.add('active');
        chatButton.style.transform = 'scale(0.9)';
        renderChatHistory(); // Tampilkan history pas buka
        setTimeout(() => {
            document.getElementById('ai-chat-input').focus();
        }, 100);
    } else {
        chatWindow.classList.remove('active');
        chatButton.style.transform = 'scale(1)';
    }
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendAIChat();
    }
}

async function sendAIChat() {
    const input = document.getElementById('ai-chat-input');
    const messagesDiv = document.getElementById('ai-chat-messages');
    const prompt = input.value.trim();
    
    if (!prompt) return;
    
    // Add user message
    addChatMessage(prompt, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-chat-message ai-message-ai';
    typingDiv.id = 'ai-typing';
    typingDiv.innerHTML = `
        <div class="ai-typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    try {
        const WORKER_URL = 'https://cyberdeck-proxy.whiteblackgotham.workers.dev/';
        
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        document.getElementById('ai-typing')?.remove();
        
        if (data.success && data.response) {
            addChatMessage(data.response, 'ai');
        } else {
            throw new Error(data.error || 'Unknown error');
        }
        
    } catch (error) {
        document.getElementById('ai-typing')?.remove();
        addChatMessage('⚠️ Error: ' + error.message, 'system');
    }
}

function addChatMessage(content, type) {
    const messagesDiv = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-chat-message ai-message-${type}`;
    
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const timestamp = Date.now();
    
    messageDiv.innerHTML = `
        <div class="ai-message-content">${escapeHtml(content)}</div>
        <div class="ai-message-time">${time}</div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Save to history
    const messageData = { type, content, time, timestamp };
    aiChatHistory.push(messageData);
    
    // Limit history to 100 messages (biar nggak kebesaran)
    if (aiChatHistory.length > 100) {
        aiChatHistory = aiChatHistory.slice(-100);
    }
    
    // Save to localStorage
    localStorage.setItem('cyberdeck_chat_history', JSON.stringify(aiChatHistory));
}

function renderChatHistory() {
    const messagesDiv = document.getElementById('ai-chat-messages');
    
    // Clear current messages
    messagesDiv.innerHTML = '';
    
    // Add welcome message
    if (aiChatHistory.length === 0) {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'ai-chat-message ai-message-system';
        welcomeDiv.innerHTML = `
            <div class="ai-message">
    <div class="ai-bubble">
        <p><strong>Selamat datang di CyberDeck AI</strong></p>
        <p>Riwayat chat kamu tersimpan otomatis di browser.</p>
    </div>
</div>
        `;
        messagesDiv.appendChild(welcomeDiv);
        return;
    }
    
    // Render all history
    aiChatHistory.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-chat-message ai-message-${msg.type}`;
        messageDiv.innerHTML = `
            <div class="ai-message-content">${escapeHtml(msg.content)}</div>
            <div class="ai-message-time">${msg.time}</div>
        `;
        messagesDiv.appendChild(messageDiv);
    });
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function exportChatHistory() {
    if (aiChatHistory.length === 0) {
        showToast('No chat history to export', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(aiChatHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cyberdeck-chat-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Chat history exported', 'success');
}

function clearChatHistory() {
    if (confirm('Yakin mau hapus semua chat history?')) {
        aiChatHistory = [];
        localStorage.removeItem('cyberdeck_chat_history');
        
        // Clear chat messages display
        const messagesDiv = document.getElementById('ai-chat-messages');
        if (messagesDiv) {
            messagesDiv.innerHTML = `
                <div class="ai-chat-message ai-message-system">
                    <div class="ai-message-content">
                        👋 Chat history cleared. Mulai chat baru!
                    </div>
                </div>
            `;
        }
        
        showToast('Chat history cleared', 'success');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// Initialize chat widget on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Chat Widget loaded with history support');
});