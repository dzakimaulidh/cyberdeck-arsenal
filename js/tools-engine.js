

const TOOLS_DB = {
    'base64': {
        category: 'Cryptography',
        name: 'Base64 Encoder/Decoder',
        desc: 'Encode/decode text safely in browser.',
        icon: 'fa-key',
        badge: null,
        render: () => `
            <div class="action-panel">
                <h2>❯ Base64 Operation</h2>
                <div class="subtitle">Client-side · Zero logging</div>
                <div class="form-group">
                    <label class="form-label">INPUT</label>
                    <textarea id="tool-input" placeholder="Paste text or Base64 here..."></textarea>
                </div>
                <div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="executeTool('encode')">[+] ENCODE</button>
                    <button class="btn btn-primary" onclick="executeTool('decode')">[-] DECODE</button>
                    <button class="btn btn-secondary" onclick="clearTool()">[x] CLEAR</button>
                </div>
                <div class="form-group">
                    <label class="form-label">OUTPUT</label>
                    <textarea id="tool-output" readonly></textarea>
                </div>
                <button class="btn btn-ghost" onclick="copyToolOutput()" style="color: var(--accent);">
                    <i class="fa-regular fa-copy"></i> [COPY] Copy Result
                </button>
            </div>
        `,
        execute: (action) => {
            const input = document.getElementById('tool-input').value;
            const output = document.getElementById('tool-output');
            if (!input) { output.value = '[!] Empty input'; return; }
            try {
                output.value = action === 'encode' 
                    ? btoa(unescape(encodeURIComponent(input))) 
                    : decodeURIComponent(escape(atob(input)));
                showToast('Operation successful', 'success');
            } catch (e) { 
                output.value = '[✗] Invalid Base64 string'; 
                showToast('Decode failed', 'error'); 
            }
        }
    },

    'hash': {
        category: 'Cryptography',
        name: 'Hash Generator',
        desc: 'Generate SHA-256, SHA-1, MD5 hashes.',
        icon: 'fa-hashtag',
        badge: 'POPULAR',
        render: () => `
            <div class="action-panel">
                <h2>❯ Hash Generator</h2>
                <div class="subtitle">Web Crypto API · Multiple algorithms</div>
                <div class="form-group">
                    <label class="form-label">INPUT TEXT</label>
                    <textarea id="tool-input" placeholder="Enter text to hash..."></textarea>
                </div>
                <button class="btn btn-primary" onclick="executeTool('generate')" style="margin-bottom: 16px;">
                    [+] GENERATE HASHES
                </button>
                <div class="form-group"><label class="form-label">SHA-256</label><input type="text" id="hash-sha256" readonly></div>
                <div class="form-group"><label class="form-label">SHA-1</label><input type="text" id="hash-sha1" readonly></div>
                <div class="form-group"><label class="form-label">MD5</label><input type="text" id="hash-md5" readonly></div>
            </div>
        `,
        execute: async () => {
            const input = document.getElementById('tool-input').value;
            if (!input) { showToast('Empty input', 'error'); return; }
            const encoder = new TextEncoder();
            const data = encoder.encode(input);
            const sha256Hash = await crypto.subtle.digest('SHA-256', data);
            document.getElementById('hash-sha256').value = bufferToHex(sha256Hash);
            const sha1Hash = await crypto.subtle.digest('SHA-1', data);
            document.getElementById('hash-sha1').value = bufferToHex(sha1Hash);
            document.getElementById('hash-md5').value = md5(input);
            showToast('Hashes generated', 'success');
        }
    },

'jwt': {
    category: 'Cryptography',
    name: 'JWT Encoder/Decoder',
    desc: 'Encode & decode JSON Web Tokens.',
    render: () => `
        <div class="action-panel">
            <h2>❯ JWT Inspector</h2>
            <div class="subtitle">Encode & Decode JSON Web Tokens</div>
            
            <div class="tabs">
                <button class="tab active" onclick="switchJwtTab('decode')">DECODE</button>
                <button class="tab" onclick="switchJwtTab('encode')">ENCODE</button>
            </div>
            
            <div id="jwt-decode-tab" class="tab-content active">
                <div class="form-group">
                    <label class="form-label">JWT TOKEN</label>
                    <textarea id="jwt-input-decode" placeholder="eyJhbGciOi..." style="font-size: 12px;"></textarea>
                </div>
                <button class="btn btn-primary" onclick="executeTool('decode')" style="margin-bottom: 16px;">[+] DECODE TOKEN</button>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label class="form-label">HEADER</label>
                        <textarea id="jwt-header" readonly style="min-height: 150px; color: var(--warning);"></textarea>
                    </div>
                    <div>
                        <label class="form-label">PAYLOAD</label>
                        <textarea id="jwt-payload" readonly style="min-height: 150px; color: var(--success);"></textarea>
                    </div>
                </div>
            </div>
            
            <div id="jwt-encode-tab" class="tab-content">
                <div class="form-group">
                    <label class="form-label">HEADER (JSON)</label>
                    <textarea id="jwt-header-input" placeholder='{"alg":"HS256","typ":"JWT"}' style="font-size: 12px;">{"alg":"HS256","typ":"JWT"}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">PAYLOAD (JSON)</label>
                    <textarea id="jwt-payload-input" placeholder='{"sub":"1234567890","name":"John Doe","iat":1516239022}' style="font-size: 12px; min-height: 150px;">{"sub":"1234567890","name":"John Doe","iat":1516239022}</textarea>
                </div>
                <button class="btn btn-primary" onclick="executeTool('encode')" style="margin-bottom: 16px;">[+] ENCODE JWT</button>
                <div class="form-group">
                    <label class="form-label">ENCODED JWT</label>
                    <textarea id="jwt-output-encode" readonly style="font-size: 12px; min-height: 100px;"></textarea>
                </div>
                <button class="btn btn-ghost" onclick="copyJwtOutput()" style="color: var(--accent);">[COPY] Copy JWT</button>
            </div>
        </div>
    `,
    execute: (action) => {
        if (action === 'decode') {
            const token = document.getElementById('jwt-input-decode').value.trim();
            if (!token.includes('.')) { showToast('Invalid JWT format', 'error'); return; }
            try {
                const [header, payload] = token.split('.').slice(0, 2).map(part => 
                    JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')))
                );
                document.getElementById('jwt-header').value = JSON.stringify(header, null, 2);
                document.getElementById('jwt-payload').value = JSON.stringify(payload, null, 2);
                showToast('JWT Decoded', 'success');
            } catch (e) { showToast('Failed to parse JWT', 'error'); }
        } else if (action === 'encode') {
            try {
                const header = document.getElementById('jwt-header-input').value;
                const payload = document.getElementById('jwt-payload-input').value;
                
                // Validate JSON
                JSON.parse(header);
                JSON.parse(payload);
                
                // Encode (without signature - for demo only)
                const headerB64 = btoa(header).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                const payloadB64 = btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                const signature = 'signature'; // Placeholder
                
                const jwt = `${headerB64}.${payloadB64}.${signature}`;
                document.getElementById('jwt-output-encode').value = jwt;
                showToast('JWT Encoded (unsigned)', 'success');
            } catch (e) { showToast('Invalid JSON format', 'error'); }
        }
    }
},

    'url': {
        category: 'Encoding',
        name: 'URL Encoder/Decoder',
        desc: 'Percent-encoding for safe transmission.',
        icon: 'fa-link',
        badge: null,
        render: () => `
            <div class="action-panel">
                <h2>❯ URL Operation</h2>
                <div class="form-group">
                    <label class="form-label">INPUT</label>
                    <textarea id="tool-input" placeholder="https://example.com/?q=hello world&lang=id"></textarea>
                </div>
                <div style="display:flex; gap:8px; margin-bottom:16px;">
                    <button class="btn btn-primary" onclick="executeTool('encode')">[+] ENCODE</button>
                    <button class="btn btn-primary" onclick="executeTool('decode')">[-] DECODE</button>
                </div>
                <div class="form-group">
                    <label class="form-label">OUTPUT</label>
                    <textarea id="tool-output" readonly></textarea>
                </div>
                <button class="btn btn-ghost" onclick="copyToolOutput()" style="color: var(--accent);">
                    <i class="fa-regular fa-copy"></i> [COPY]
                </button>
            </div>
        `,
        execute: (action) => {
            const input = document.getElementById('tool-input').value;
            const output = document.getElementById('tool-output');
            if (!input) { output.value = '[!] Empty input'; return; }
            output.value = action === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
            showToast('URL processed', 'success');
        }
    },

    'hex': {
        category: 'Encoding',
        name: 'Hex Encoder/Decoder',
        desc: 'Convert text to hexadecimal and vice versa.',
        icon: 'fa-code',
        badge: null,
        render: () => `
            <div class="action-panel">
                <h2>❯ Hex Encoder/Decoder</h2>
                <div class="subtitle">Text ↔ Hexadecimal</div>
                <div class="form-group">
                    <label class="form-label">INPUT</label>
                    <textarea id="tool-input" placeholder="Enter text or hex string (e.g. 48 65 6c 6c 6f)..."></textarea>
                </div>
                <div style="display:flex; gap:8px; margin-bottom:16px;">
                    <button class="btn btn-primary" onclick="executeTool('encode')">[+] TO HEX</button>
                    <button class="btn btn-primary" onclick="executeTool('decode')">[-] FROM HEX</button>
                </div>
                <div class="form-group">
                    <label class="form-label">OUTPUT</label>
                    <textarea id="tool-output" readonly style="font-family: var(--font-mono);"></textarea>
                </div>
                <button class="btn btn-ghost" onclick="copyToolOutput()" style="color: var(--accent);">
                    <i class="fa-regular fa-copy"></i> [COPY]
                </button>
            </div>
        `,
        execute: (action) => {
            const input = document.getElementById('tool-input').value;
            const output = document.getElementById('tool-output');
            if (!input) { output.value = '[!] Empty input'; return; }
            try {
                if (action === 'encode') {
                    output.value = Array.from(input).map(c => 
                        c.charCodeAt(0).toString(16).padStart(2, '0')
                    ).join(' ');
                } else {
                    const hex = input.replace(/\s/g, '');
                    if (hex.length % 2 !== 0) throw new Error('Odd length');
                    output.value = hex.match(/.{1,2}/g).map(byte => 
                        String.fromCharCode(parseInt(byte, 16))
                    ).join('');
                }
                showToast('Hex operation successful', 'success');
            } catch (e) { 
                output.value = '[✗] Invalid hex string'; 
                showToast('Conversion failed', 'error'); 
            }
        }
    },

    'password': {
        category: 'Web Security',
        name: 'Password Generator',
        desc: 'Generate cryptographically secure passwords.',
        icon: 'fa-key',
        badge: 'POPULAR',
        render: () => `
            <div class="action-panel">
                <h2>❯ Password Generator</h2>
                <div class="subtitle">crypto.getRandomValues() · Secure</div>
                <div class="form-group">
                    <label class="form-label">LENGTH: <span id="pwd-len-val">16</span></label>
                    <input type="range" id="pwd-length" min="8" max="64" value="16" 
                        oninput="document.getElementById('pwd-len-val').innerText = this.value" 
                        style="width: 100%;">
                </div>
                <div class="checkbox-group">
                    <label><input type="checkbox" id="inc-upper" checked> Uppercase</label>
                    <label><input type="checkbox" id="inc-lower" checked> Lowercase</label>
                    <label><input type="checkbox" id="inc-num" checked> Numbers</label>
                    <label><input type="checkbox" id="inc-sym" checked> Symbols</label>
                </div>
                <button class="btn btn-primary" onclick="executeTool('generate')" style="width: 100%; margin: 16px 0;">
                    [+] GENERATE PASSWORD
                </button>
                <div class="form-group">
                    <label class="form-label">GENERATED PASSWORD</label>
                    <input type="text" id="tool-output" readonly style="text-align: center; font-size: 18px; letter-spacing: 2px;">
                </div>
                <button class="btn btn-ghost" onclick="copyToolOutput()" style="color: var(--accent);">
                    <i class="fa-regular fa-copy"></i> [COPY] Copy Password
                </button>
            </div>
        `,
        execute: () => {
            const length = parseInt(document.getElementById('pwd-length').value);
            const useUpper = document.getElementById('inc-upper').checked;
            const useLower = document.getElementById('inc-lower').checked;
            const useNum = document.getElementById('inc-num').checked;
            const useSym = document.getElementById('inc-sym').checked;
            const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const lower = "abcdefghijklmnopqrstuvwxyz";
            const num = "0123456789";
            const sym = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
            let charset = "";
            if (useUpper) charset += upper;
            if (useLower) charset += lower;
            if (useNum) charset += num;
            if (useSym) charset += sym;
            const output = document.getElementById('tool-output');
            if (!charset) { output.value = "Select at least one option"; return; }
            let password = "";
            const array = new Uint32Array(length);
            crypto.getRandomValues(array);
            for (let i = 0; i < length; i++) password += charset[array[i] % charset.length];
            output.value = password;
            showToast('Password generated', 'success');
        }
    },

    'subnet': {
        category: 'Network',
        name: 'Subnet Calculator',
        desc: 'Calculate CIDR, netmask, broadcast, host range.',
        icon: 'fa-network-wired',
        badge: null,
        render: () => `
            <div class="action-panel">
                <h2>❯ Subnet Calculator</h2>
                <div class="subtitle">CIDR notation · IPv4</div>
                <div class="form-group">
                    <label class="form-label">IP/CIDR</label>
                    <input type="text" id="tool-input" placeholder="192.168.1.0/24" value="192.168.1.0/24">
                </div>
                <button class="btn btn-primary" onclick="executeTool('calculate')" style="margin-bottom: 16px;">
                    [+] CALCULATE
                </button>
                <div id="subnet-result" class="subnet-result"></div>
            </div>
        `,
        execute: () => {
            const input = document.getElementById('tool-input').value.trim();
            const resultDiv = document.getElementById('subnet-result');
            const match = input.match(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/);
            if (!match) { resultDiv.innerHTML = '<span style="color: var(--danger);">[!] Invalid IP/CIDR format</span>'; return; }
            const [ip, cidr] = input.split('/');
            const mask = cidr ? parseInt(cidr) : 32;
            if (mask < 0 || mask > 32) { resultDiv.innerHTML = '<span style="color: var(--danger);">[!] CIDR must be 0-32</span>'; return; }
            const ipParts = ip.split('.').map(Number);
            const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
            const maskNum = mask === 0 ? 0 : (~0 << (32 - mask)) >>> 0;
            const networkNum = (ipNum & maskNum) >>> 0;
            const broadcastNum = (networkNum | (~maskNum >>> 0)) >>> 0;
            const numToIp = (num) => [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join('.');
            const totalHosts = Math.pow(2, 32 - mask);
            const usableHosts = mask >= 31 ? totalHosts : totalHosts - 2;
            const firstHost = mask >= 31 ? networkNum : networkNum + 1;
            const lastHost = mask >= 31 ? broadcastNum : broadcastNum - 1;
            resultDiv.innerHTML = `
                <div class="subnet-row"><span class="subnet-label">Network:</span><span class="subnet-value">${numToIp(networkNum)}/${mask}</span></div>
                <div class="subnet-row"><span class="subnet-label">Netmask:</span><span class="subnet-value">${numToIp(maskNum)}</span></div>
                <div class="subnet-row"><span class="subnet-label">Broadcast:</span><span class="subnet-value">${numToIp(broadcastNum)}</span></div>
                <div class="subnet-row"><span class="subnet-label">First Host:</span><span class="subnet-value">${numToIp(firstHost)}</span></div>
                <div class="subnet-row"><span class="subnet-label">Last Host:</span><span class="subnet-value">${numToIp(lastHost)}</span></div>
                <div class="subnet-row"><span class="subnet-label">Usable Hosts:</span><span class="subnet-value">${usableHosts.toLocaleString()}</span></div>
            `;
            showToast('Subnet calculated', 'success');
        }
    },

    'regex': {
        category: 'Text Tools',
        name: 'Regex Tester',
        desc: 'Test regular expressions with real-time matching.',
        icon: 'fa-asterisk',
        badge: 'POPULAR',
        render: () => `
            <div class="action-panel">
                <h2>❯ Regex Tester</h2>
                <div class="subtitle">JavaScript regex engine</div>
                <div class="form-group">
                    <label class="form-label">PATTERN</label>
                    <input type="text" id="regex-pattern" placeholder="/pattern/flags" value="/\\d+/g">
                </div>
                <div class="form-group">
                    <label class="form-label">TEST STRING</label>
                    <textarea id="regex-test" placeholder="Enter text to test..." style="min-height: 120px;">Order #12345, Invoice #67890</textarea>
                </div>
                <button class="btn btn-primary" onclick="executeTool('test')" style="margin-bottom: 16px;">
                    [+] TEST REGEX
                </button>
                <div id="regex-result" class="regex-result"></div>
            </div>
        `,
        execute: () => {
            const pattern = document.getElementById('regex-pattern').value;
            const testStr = document.getElementById('regex-test').value;
            const resultDiv = document.getElementById('regex-result');
            try {
                const match = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
                if (!match) { resultDiv.innerHTML = '<span style="color: var(--danger);">[!] Invalid regex format. Use /pattern/flags</span>'; return; }
                const regex = new RegExp(match[1], match[2]);
                const matches = [];
                let m;
                if (match[2].includes('g')) {
                    while ((m = regex.exec(testStr)) !== null) { 
                        matches.push({ match: m[0], index: m.index }); 
                        if (!regex.global) break; 
                    }
                } else { 
                    m = regex.exec(testStr); 
                    if (m) matches.push({ match: m[0], index: m.index }); 
                }
                if (matches.length === 0) { 
                    resultDiv.innerHTML = '<span style="color: var(--warning);">[!] No matches found</span>'; 
                    return; 
                }
                let html = `<div style="color: var(--success); margin-bottom: 12px;">✓ Found ${matches.length} match(es)</div>`;
                matches.forEach((m, i) => { 
                    html += `<div class="regex-match">
                        <div><span style="color: var(--accent);">Match ${i + 1}:</span> "${m.match}"</div>
                        <div><span style="color: var(--mute);">Index:</span> ${m.index}</div>
                    </div>`; 
                });
                resultDiv.innerHTML = html;
                showToast(`Found ${matches.length} match(es)`, 'success');
            } catch (e) { 
                resultDiv.innerHTML = `<span style="color: var(--danger);">[!] Regex error: ${e.message}</span>`; 
                showToast('Invalid regex', 'error'); 
            }
        }
    },

    'json': {
        category: 'Text Tools',
        name: 'JSON Formatter',
        desc: 'Beautify, minify, and validate JSON.',
        icon: 'fa-brackets-curly',
        badge: 'POPULAR',
        render: () => `
            <div class="action-panel">
                <h2>❯ JSON Formatter</h2>
                <div class="subtitle">Beautify · Minify · Validate</div>
                <div class="form-group">
                    <label class="form-label">INPUT JSON</label>
                    <textarea id="tool-input" placeholder='{"name":"CyberDeck","version":"2.4.1"}' 
                        style="min-height: 150px; font-family: var(--font-mono); font-size: 12px;"></textarea>
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="executeTool('beautify')">[+] BEAUTIFY</button>
                    <button class="btn btn-primary" onclick="executeTool('minify')">[-] MINIFY</button>
                    <button class="btn btn-secondary" onclick="executeTool('validate')">[?] VALIDATE</button>
                </div>
                <div class="form-group">
                    <label class="form-label">OUTPUT</label>
                    <textarea id="tool-output" readonly style="min-height: 200px; font-family: var(--font-mono); font-size: 12px;"></textarea>
                </div>
                <button class="btn btn-ghost" onclick="copyToolOutput()" style="color: var(--accent);">
                    <i class="fa-regular fa-copy"></i> [COPY]
                </button>
            </div>
        `,
        execute: (action) => {
            const input = document.getElementById('tool-input').value;
            const output = document.getElementById('tool-output');
            if (!input.trim()) { output.value = '[!] Empty input'; return; }
            try {
                const parsed = JSON.parse(input);
                if (action === 'beautify') { 
                    output.value = JSON.stringify(parsed, null, 2); 
                    showToast('JSON beautified', 'success'); 
                } else if (action === 'minify') { 
                    output.value = JSON.stringify(parsed); 
                    showToast('JSON minified', 'success'); 
                } else if (action === 'validate') { 
                    output.value = '✓ Valid JSON\n\n' + JSON.stringify(parsed, null, 2); 
                    showToast('Valid JSON', 'success'); 
                }
            } catch (e) { 
                output.value = `[✗] Invalid JSON\n\nError: ${e.message}`; 
                showToast('Invalid JSON', 'error'); 
            }
        }
    },

    'timestamp': {
        category: 'Time/Date',
        name: 'Unix Timestamp Converter',
        desc: 'Convert between Unix timestamp and human-readable date.',
        icon: 'fa-clock',
        badge: null,
        render: () => `
            <div class="action-panel">
                <h2>❯ Timestamp Converter</h2>
                <div class="subtitle">Unix epoch ↔ Human date</div>
                <div class="form-group">
                    <label class="form-label">UNIX TIMESTAMP</label>
                    <input type="text" id="ts-unix" placeholder="1717459200" value="${Math.floor(Date.now() / 1000)}">
                </div>
                <button class="btn btn-primary" onclick="executeTool('toDate')" style="margin-bottom: 16px;">
                    [+] TO DATE
                </button>
                <div class="form-group">
                    <label class="form-label">DATE STRING</label>
                    <input type="text" id="ts-date" placeholder="2024-06-04 12:00:00" 
                        value="${new Date().toISOString().slice(0, 19).replace('T', ' ')}">
                </div>
                <button class="btn btn-primary" onclick="executeTool('toTimestamp')" style="margin-bottom: 16px;">
                    [+] TO TIMESTAMP
                </button>
                <div id="ts-result" class="timestamp-result"></div>
            </div>
        `,
        execute: (action) => {
            const resultDiv = document.getElementById('ts-result');
            if (action === 'toDate') {
                const unix = document.getElementById('ts-unix').value.trim();
                const ts = unix.length === 13 ? parseInt(unix) : parseInt(unix) * 1000;
                if (isNaN(ts)) { resultDiv.innerHTML = '<span style="color: var(--danger);">[!] Invalid timestamp</span>'; return; }
                const date = new Date(ts);
                resultDiv.innerHTML = `
                    <div class="ts-row"><span class="ts-label">Local:</span><span class="ts-value">${date.toLocaleString()}</span></div>
                    <div class="ts-row"><span class="ts-label">UTC:</span><span class="ts-value">${date.toUTCString()}</span></div>
                    <div class="ts-row"><span class="ts-label">ISO 8601:</span><span class="ts-value">${date.toISOString()}</span></div>
                `;
                showToast('Converted to date', 'success');
            } else if (action === 'toTimestamp') {
                const dateStr = document.getElementById('ts-date').value.trim();
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) { resultDiv.innerHTML = '<span style="color: var(--danger);">[!] Invalid date format</span>'; return; }
                const ts = date.getTime();
                resultDiv.innerHTML = `
                    <div class="ts-row"><span class="ts-label">Unix (s):</span><span class="ts-value">${Math.floor(ts / 1000)}</span></div>
                    <div class="ts-row"><span class="ts-label">Unix (ms):</span><span class="ts-value">${ts}</span></div>
                    <div class="ts-row"><span class="ts-label">Local:</span><span class="ts-value">${date.toLocaleString()}</span></div>
                `;
                showToast('Converted to timestamp', 'success');
            }
        }
    },

    'uuid': {
        category: 'Utilities',
        name: 'UUID Generator',
        desc: 'Generate UUID v4 identifiers.',
        icon: 'fa-fingerprint',
        badge: null,
        render: () => `
            <div class="action-panel">
                <h2>❯ UUID Generator</h2>
                <div class="subtitle">RFC 4122 · Version 4</div>
                <button class="btn btn-primary" onclick="executeTool('generate')" style="margin-bottom: 16px; width: 100%;">
                    [+] GENERATE UUID
                </button>
                <div class="form-group">
                    <input type="text" id="tool-output" readonly style="text-align: center; font-size: 16px;">
                </div>
                <button class="btn btn-ghost" onclick="copyToolOutput()" style="color: var(--accent);">
                    <i class="fa-regular fa-copy"></i> [COPY] Copy UUID
                </button>
            </div>
        `,
        execute: () => {
            const uuid = crypto.randomUUID();
            document.getElementById('tool-output').value = uuid;
            showToast('UUID generated', 'success');
        }
    },

    'random': {
    category: 'Utilities',
    name: 'Random Data Generator',
    desc: 'Generate fake data for testing (names, emails, phones, etc).',
    render: () => `
        <div class="action-panel">
            <h2>❯ Random Data Generator</h2>
            <div class="subtitle">Generate fake data for testing</div>
            
            <div class="form-group">
                <label class="form-label">DATA TYPE</label>
                <select id="random-type">
                    <option value="name">Full Name</option>
                    <option value="email">Email Address</option>
                    <option value="phone">Phone Number</option>
                    <option value="address">Address</option>
                    <option value="uuid">UUID</option>
                    <option value="ip">IP Address</option>
                    <option value="password">Password</option>
                    <option value="date">Random Date</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">QUANTITY</label>
                <input type="number" id="random-qty" value="5" min="1" max="100">
            </div>
            
            <button class="btn btn-primary" onclick="executeTool('generate')" style="width: 100%; margin-bottom: 16px;">[+] GENERATE</button>
            
            <div class="form-group">
                <label class="form-label">GENERATED DATA</label>
                <textarea id="tool-output" readonly style="min-height: 200px; font-family: var(--font-mono); font-size: 12px;"></textarea>
            </div>
            
            <button class="btn btn-ghost" onclick="copyToolOutput()" style="color: var(--accent);">[COPY] Copy All</button>
        </div>
    `,
    execute: () => {
        const type = document.getElementById('random-type').value;
        const qty = parseInt(document.getElementById('random-qty').value) || 5;
        const results = [];
        
        for (let i = 0; i < qty; i++) {
            switch (type) {
                case 'name':
                    results.push(generateRandomName());
                    break;
                case 'email':
                    results.push(generateRandomEmail());
                    break;
                case 'phone':
                    results.push(generateRandomPhone());
                    break;
                case 'address':
                    results.push(generateRandomAddress());
                    break;
                case 'uuid':
                    results.push(crypto.randomUUID());
                    break;
                case 'ip':
                    results.push(generateRandomIP());
                    break;
                case 'password':
                    results.push(generateRandomPassword());
                    break;
                case 'date':
                    results.push(generateRandomDate());
                    break;
            }
        }
        
        document.getElementById('tool-output').value = results.join('\n');
        showToast(`Generated ${qty} ${type}(s)`, 'success');
    }
},

    'html-entity': {
        category: 'Encoding',
        name: 'HTML Entity Encoder',
        desc: 'Escape HTML characters for safe rendering.',
        icon: 'fa-code',
        badge: 'NEW',
        render: () => `
            <div class="action-panel">
                <h2>❯ HTML Entity Encoder</h2>
                <div class="subtitle">Prevent XSS attacks</div>
                <div class="form-group">
                    <label class="form-label">INPUT HTML</label>
                    <textarea id="tool-input" placeholder='<div class="test">Hello & "World"</div>'></textarea>
                </div>
                <div style="display:flex; gap:8px; margin-bottom:16px;">
                    <button class="btn btn-primary" onclick="executeTool('encode')">[+] ENCODE</button>
                    <button class="btn btn-primary" onclick="executeTool('decode')">[-] DECODE</button>
                </div>
                <div class="form-group">
                    <label class="form-label">OUTPUT</label>
                    <textarea id="tool-output" readonly></textarea>
                </div>
                <button class="btn btn-ghost" onclick="copyToolOutput()" style="color: var(--accent);">
                    <i class="fa-regular fa-copy"></i> [COPY]
                </button>
            </div>
        `,
        execute: (action) => {
            const input = document.getElementById('tool-input').value;
            const output = document.getElementById('tool-output');
            if (!input) { output.value = '[!] Empty input'; return; }
            const textarea = document.createElement('textarea');
            if (action === 'encode') {
                textarea.textContent = input;
                output.value = textarea.innerHTML;
            } else {
                textarea.innerHTML = input;
                output.value = textarea.value;
            }
            showToast('HTML entities processed', 'success');
        }
        }    ,
    'chatgpt': {
        category: 'AI & API',
        name: 'AI Assistant (Pro)',
        desc: 'Powered by Cyber Desk AI',
        icon: 'fa-robot',
        badge: 'PRO',
        render: () => `
            <div class="action-panel">
                <h2>❯ AI Assistant</h2>
                <div class="subtitle">Cyber Desk AI · No Rate Limit</div>
                
                <div class="form-group">
                    <label class="form-label">YOUR PROMPT</label>
                    <textarea id="tool-input" placeholder="Ketik pertanyaan kamu di sini..." style="min-height: 100px;"></textarea>
                </div>

                <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                    <button class="btn btn-primary" onclick="executeTool('ask')" style="flex: 1;">
                        <i class="fa-solid fa-robot"></i> [+] ASK AI
                    </button>
                    <button class="btn btn-secondary" onclick="clearTool()">
                        <i class="fa-solid fa-trash"></i> [x] CLEAR
                    </button>
                </div>
                
                <div class="form-group">
                    <label class="form-label">AI RESPONSE</label>
                    <textarea id="tool-output" readonly style="min-height: 250px; font-family: var(--font-mono); font-size: 13px; line-height: 1.6;"></textarea>
                </div>
                
                <button class="btn btn-ghost" onclick="copyToolOutput()" style="color: var(--accent);">
                    <i class="fa-regular fa-copy"></i> [COPY] Copy Response
                </button>
            </div>
        `,
        execute: async (action) => {
            if (action === 'ask') {
                const input = document.getElementById('tool-input').value.trim();
                const output = document.getElementById('tool-output');
                
                if (!input) {
                    output.value = '[!] Prompt tidak boleh kosong!';
                    showToast('Empty prompt', 'error');
                    return;
                }

                output.value = '[...] Sedang berpikir...';
                
                try {
                    // 🔥 GANTI URL INI DENGAN URL WORKER KAMU! 🔥
                    const WORKER_URL = 'https://cyberdeck-proxy.whiteblackgotham.workers.dev/';
                    
                    const response = await fetch(WORKER_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: input })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }

                    const data = await response.json();
                    
                    if (data.success && data.response) {
                        output.value = data.response;
                        showToast(`Response received! (via Key #${data.usedKey}/${data.totalKeys})`, 'success');
                    } else {
                        throw new Error(data.error || 'Unknown error');
                    }
                    
                } catch (e) {
                    output.value = `[✗] Gagal mengambil response.\n\nError: ${e.message}\n\n💡 Tips:\n1. Pastikan API keys Groq sudah diisi di Worker.\n2. Cek koneksi internet.\n3. Worker mungkin sedang deploy ulang.`;
                    showToast('API Request Failed', 'error');
                }
            }
        }
    }
};


// HELPER FUNCTIONS (Single definition)
function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function md5(string) {
    function md5cycle(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586); c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426); c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417); c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101); c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
        a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632); c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083); c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690); c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784); c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);
        a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463); c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353); c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222); c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835); c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);
        a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415); c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606); c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744); c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379); c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);
        x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
    }
    function cmn(q, a, b, x, s, t) { a = add32(add32(a, q), add32(x, t)); return add32((a << s) | (a >>> (32 - s)), b); }
    function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
    function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
    function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
    function md51(s) {
        var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i;
        for (i = 64; i <= s.length; i += 64) { md5cycle(state, md5blk(s.substring(i - 64, i))); }
        s = s.substring(i - 64);
        var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) { md5cycle(state, tail); for (i = 0; i < 16; i++) tail[i] = 0; }
        tail[14] = n * 8; md5cycle(state, tail); return state;
    }
    function md5blk(s) {
        var md5blks = [], i;
        for (i = 0; i < 64; i += 4) { md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24); }
        return md5blks;
    }
    var hex_chr = '0123456789abcdef'.split('');
    function rhex(n) { var s = '', j = 0; for (; j < 4; j++) s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F]; return s; }
    function hex(x) { for (var i = 0; i < x.length; i++) x[i] = rhex(x[i]); return x.join(''); }
    function add32(a, b) { return (a + b) & 0xFFFFFFFF; }
    return hex(md51(string));
}

// ROUTER & RENDER LOGIC (Single definition)
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderSidebar();
    
    const urlParams = new URLSearchParams(window.location.search);
    const toolId = urlParams.get('id');
    
    if (toolId && TOOLS_DB[toolId]) {
        loadTool(toolId);
    } else {
        document.getElementById('page-title').innerHTML = 'Tool <span class="accent">Dashboard</span>';
        renderToolDashboard();
    }
    
    // Setup search
    const searchInput = document.getElementById('tool-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterSidebarTools(e.target.value);
        });
    }
    
    // Keyboard shortcut: / to focus search
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && !e.ctrlKey && !e.altKey) {
            const activeEl = document.activeElement;
            const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
            if (!isInput) {
                e.preventDefault();
                searchInput?.focus();
            }
        }
    });
});

function updateStats() {
    const totalTools = Object.keys(TOOLS_DB).length;
    const categories = new Set(Object.values(TOOLS_DB).map(t => t.category));
    const favorites = JSON.parse(localStorage.getItem('cd_favorites') || '[]');
    
    const toolsCount = document.getElementById('total-tools-count');
    const catCount = document.getElementById('total-categories-count');
    const favCount = document.getElementById('total-favorites-count');
    
    if (toolsCount) toolsCount.textContent = totalTools;
    if (catCount) catCount.textContent = categories.size;
    if (favCount) favCount.textContent = favorites.length;
}

function renderSidebar() {
    const sidebar = document.getElementById('tool-sidebar');
    if (!sidebar) return;
    
    const categories = {};
    const favorites = JSON.parse(localStorage.getItem('cd_favorites') || '[]');

    Object.entries(TOOLS_DB).forEach(([id, tool]) => {
        if (!categories[tool.category]) categories[tool.category] = [];
        categories[tool.category].push({ id, ...tool });
    });

    let html = `
        <div class="tool-sidebar-search">
            <i class="fa-solid fa-search"></i>
            <input type="text" id="tool-search-input" placeholder="Search tools..." autocomplete="off">
        </div>
    `;

    // FAVORITES Section
    if (favorites.length > 0) {
        html += `<div class="tool-category"><div class="tool-category-title"><i class="fa-solid fa-star" style="color: var(--warning);"></i> FAVORITES</div>`;
        favorites.forEach(id => {
            if (TOOLS_DB[id]) {
                const tool = TOOLS_DB[id];
                html += `<a href="tools.html?id=${id}" class="tool-link" id="link-${id}">
                    <span><i class="fa-solid ${tool.icon}" style="margin-right: 8px; color: var(--accent);"></i>${tool.name}</span>
                    <span class="fav-icon active" onclick="toggleFav(event, '${id}')"><i class="fa-solid fa-star"></i></span>
                </a>`;
            }
        });
        html += `</div>`;
    }

    // CATEGORIES
    Object.entries(categories).forEach(([cat, tools]) => {
        const nonFavTools = tools.filter(tool => !favorites.includes(tool.id));
        if (nonFavTools.length > 0) {
            html += `<div class="tool-category"><div class="tool-category-title">${cat.toUpperCase()}</div>`;
            nonFavTools.forEach(tool => {
                const badgeHtml = tool.badge 
                    ? `<span class="tool-badge ${tool.badge.toLowerCase()}">${tool.badge}</span>` 
                    : '';
                html += `<a href="tools.html?id=${tool.id}" class="tool-link" id="link-${tool.id}" data-tool-name="${tool.name.toLowerCase()}">
                    <span><i class="fa-solid ${tool.icon}" style="margin-right: 8px; color: var(--mute);"></i>${tool.name} ${badgeHtml}</span>
                    <span class="fav-icon" onclick="toggleFav(event, '${tool.id}')"><i class="fa-regular fa-star"></i></span>
                </a>`;
            });
            html += `</div>`;
        }
    });

    // Keep search input, replace the rest
    const searchBox = sidebar.querySelector('.tool-sidebar-search');
    sidebar.innerHTML = html;
    
    // Re-attach search listener
    const searchInput = sidebar.querySelector('#tool-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filterSidebarTools(e.target.value));
    }
}

function filterSidebarTools(query) {
    const q = query.toLowerCase().trim();
    const links = document.querySelectorAll('.tool-link');
    const categories = document.querySelectorAll('.tool-category');
    
    links.forEach(link => {
        const name = link.textContent.toLowerCase();
        link.style.display = !q || name.includes(q) ? '' : 'none';
    });
    
    // Hide empty categories
    categories.forEach(cat => {
        const visibleLinks = cat.querySelectorAll('.tool-link:not([style*="display: none"])');
        cat.style.display = visibleLinks.length > 0 ? '' : 'none';
    });
}

function renderToolDashboard() {
    const area = document.getElementById('tool-render-area');
    const recent = JSON.parse(localStorage.getItem('cd_recent') || '[]');
    const favorites = JSON.parse(localStorage.getItem('cd_favorites') || '[]');
    const popularTools = ['hash', 'password', 'json', 'regex'];
    
    let html = '';
    
    // RECENTLY USED
    if (recent.length > 0) {
        html += `
            <div class="dashboard-section">
                <div class="dashboard-section-header">
                    <h2 class="heading-md"><i class="fa-solid fa-clock-rotate-left" style="color: var(--accent);"></i> Recently Used</h2>
                    <span class="dashboard-section-meta">${recent.length} tools</span>
                </div>
                <div class="tools-grid">
        `;
        recent.slice(0, 4).forEach(id => {
            if (TOOLS_DB[id]) {
                const tool = TOOLS_DB[id];
                html += renderToolCard(id, tool);
            }
        });
        html += `</div></div>`;
    }
    
    // FAVORITES
    if (favorites.length > 0) {
        html += `
            <div class="dashboard-section">
                <div class="dashboard-section-header">
                    <h2 class="heading-md"><i class="fa-solid fa-star" style="color: var(--warning);"></i> Your Favorites</h2>
                    <span class="dashboard-section-meta">${favorites.length} tools</span>
                </div>
                <div class="tools-grid">
        `;
        favorites.slice(0, 4).forEach(id => {
            if (TOOLS_DB[id]) {
                html += renderToolCard(id, TOOLS_DB[id]);
            }
        });
        html += `</div></div>`;
    }
    
    // POPULAR TOOLS
    html += `
        <div class="dashboard-section">
            <div class="dashboard-section-header">
                <h2 class="heading-md"><i class="fa-solid fa-fire" style="color: var(--danger);"></i> Popular Tools</h2>
                <span class="dashboard-section-meta">Most used by analysts</span>
            </div>
            <div class="tools-grid">
    `;
    popularTools.forEach(id => {
        if (TOOLS_DB[id]) {
            html += renderToolCard(id, TOOLS_DB[id]);
        }
    });
    html += `</div></div>`;
    
    // ALL TOOLS BY CATEGORY
    const categories = {};
    Object.entries(TOOLS_DB).forEach(([id, tool]) => {
        if (!categories[tool.category]) categories[tool.category] = [];
        categories[tool.category].push({ id, ...tool });
    });
    
    Object.entries(categories).forEach(([cat, tools]) => {
        html += `
            <div class="dashboard-section">
                <div class="dashboard-section-header">
                    <h2 class="heading-md"><i class="fa-solid fa-layer-group" style="color: var(--accent);"></i> ${cat}</h2>
                    <span class="dashboard-section-meta">${tools.length} tools</span>
                </div>
                <div class="tools-grid">
        `;
        tools.forEach(tool => {
            html += renderToolCard(tool.id, tool);
        });
        html += `</div></div>`;
    });
    
    area.innerHTML = html;
}

function renderToolCard(id, tool) {
    const isFav = JSON.parse(localStorage.getItem('cd_favorites') || '[]').includes(id);
    const badgeHtml = tool.badge 
        ? `<span class="tool-card-badge ${tool.badge.toLowerCase()}">${tool.badge}</span>` 
        : '';
    
    return `
        <a href="tools.html?id=${id}" class="tool-card">
            <div class="tool-card-header">
                <i class="fa-solid ${tool.icon}"></i>
                ${badgeHtml}
                <button class="tool-card-fav ${isFav ? 'active' : ''}" onclick="toggleFav(event, '${id}')" title="Toggle favorite">
                    <i class="fa-${isFav ? 'solid' : 'regular'} fa-star"></i>
                </button>
            </div>
            <div class="tool-card-title">${tool.name}</div>
            <div class="tool-card-desc">${tool.desc}</div>
            <div class="tool-card-footer">
                <span class="tool-card-category">${tool.category}</span>
                <span class="tool-card-action">Open →</span>
            </div>
        </a>
    `;
}

function loadTool(id) {
    const tool = TOOLS_DB[id];
    if (!tool) return;
    
    document.getElementById('page-title').innerHTML = `<i class="fa-solid ${tool.icon}" style="color: var(--accent);"></i> ${tool.name}`;
    document.getElementById('tool-render-area').innerHTML = `
        <div class="tool-header-info">
            <div class="tool-header-meta">
                <span class="tool-header-category">${tool.category}</span>
                ${tool.badge ? `<span class="tool-badge ${tool.badge.toLowerCase()}">${tool.badge}</span>` : ''}
            </div>
            <p class="body-md">${tool.desc}</p>
        </div>
        ${tool.render()}
    `;
    
    document.querySelectorAll('.tool-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.getElementById(`link-${id}`);
    if (activeLink) activeLink.classList.add('active');
    
    let recent = JSON.parse(localStorage.getItem('cd_recent') || '[]');
    recent = [id, ...recent.filter(r => r !== id)].slice(0, 5);
    localStorage.setItem('cd_recent', JSON.stringify(recent));
}

function executeTool(action) {
    const urlParams = new URLSearchParams(window.location.search);
    const toolId = urlParams.get('id');
    if (TOOLS_DB[toolId] && TOOLS_DB[toolId].execute) {
        TOOLS_DB[toolId].execute(action);
    }
}

function copyToolOutput() {
    const output = document.getElementById('tool-output');
    if (output && output.value) {
        navigator.clipboard.writeText(output.value).then(() => {
            showToast('Copied to clipboard', 'success');
        });
    }
}

function clearTool() {
    const input = document.getElementById('tool-input');
    const output = document.getElementById('tool-output');
    if (input) input.value = '';
    if (output) output.value = '';
}

function toggleFav(e, id) {
    e.preventDefault();
    e.stopPropagation();
    let favorites = JSON.parse(localStorage.getItem('cd_favorites') || '[]');
    if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
        showToast('Removed from favorites', 'info');
    } else {
        favorites.push(id);
        showToast('Added to favorites', 'success');
    }
    localStorage.setItem('cd_favorites', JSON.stringify(favorites));
    renderSidebar();
    updateStats();
    
    // Re-render dashboard if on dashboard
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('id')) {
        renderToolDashboard();
    }
}

function switchJwtTab(tab) {
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    if (tab === 'decode') {
        document.querySelector('.tabs .tab:first-child').classList.add('active');
        document.getElementById('jwt-decode-tab').classList.add('active');
    } else {
        document.querySelector('.tabs .tab:last-child').classList.add('active');
        document.getElementById('jwt-encode-tab').classList.add('active');
    }
}

function copyJwtOutput() {
    const output = document.getElementById('jwt-output-encode');
    if (output && output.value) {
        navigator.clipboard.writeText(output.value);
        showToast('JWT copied to clipboard', 'success');
    }
}

// Random Data Generators
function generateRandomName() {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Olivia', 'Robert', 'Sophia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateRandomEmail() {
    const name = generateRandomName().toLowerCase().replace(' ', '.');
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'company.com'];
    return `${name}${Math.floor(Math.random() * 1000)}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

function generateRandomPhone() {
    return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
}

function generateRandomAddress() {
    const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Pine Ln', 'Cedar Blvd'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
    const states = ['NY', 'CA', 'IL', 'TX', 'AZ'];
    const idx = Math.floor(Math.random() * cities.length);
    return `${Math.floor(Math.random() * 9999 + 1)} ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[idx]}, ${states[idx]} ${Math.floor(Math.random() * 90000 + 10000)}`;
}

function generateRandomIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password;
}

function generateRandomDate() {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}