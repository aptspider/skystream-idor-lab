const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// --- MOCKED DATABASE (HIDDEN ON SERVER) ---
// This data is NOT visible in the browser source code.
const bookings_db = {
    "REF-5001": { 
        id: "REF-5001", 
        userId: 101, 
        passenger: "John Doe", 
        email: "john.doe@example.com", 
        passport: "A12345678 (YOU)", 
        flight: "BA117", 
        origin: "LHR", 
        dest: "JFK", 
        date: "12 NOV", 
        seat: "12A", 
        class: "Economy" 
    },
    "REF-5002": { 
        id: "REF-5002", 
        userId: 102, 
        passenger: "Alice Smith", 
        email: "alice.s@corp.net", 
        passport: "B98765432 (VICTIM)", 
        flight: "BA909", 
        origin: "DXB", 
        dest: "LHR", 
        date: "14 NOV", 
        seat: "01A", 
        class: "First Class" 
    },
    "REF-5003": { 
        id: "REF-5003", 
        userId: 103, 
        passenger: "Bob Jones", 
        email: "bob.j@mail.com", 
        passport: "C11223344 (VICTIM)", 
        flight: "BA117", 
        origin: "LHR", 
        dest: "JFK", 
        date: "12 NOV", 
        seat: "14C", 
        class: "Business" 
    }
};

// --- VULNERABLE API ENDPOINT ---
app.post('/api/v1/booking', (req, res) => {
    const { booking_ref } = req.body;

    console.log(`[API] Received Request. Ref: ${booking_ref}`);

    if (!booking_ref) {
        return res.status(400).json({ error: "Missing booking_ref" });
    }

    try {
        // 1. Decode Base64 (Server-side)
        const buff = Buffer.from(booking_ref, 'base64');
        const ticketId = buff.toString('utf-8');
        
        console.log(`[API] Decoded Target ID: ${ticketId}`);

        // 2. IDOR VULNERABILITY
        // A secure system would check: if (req.session.userId === ticket.userId)
        // This system blindly looks up the ID and returns the data.
        const ticket = bookings_db[ticketId];

        if (ticket) {
            // Simulate network delay for realism
            setTimeout(() => res.json(ticket), 500);
        } else {
            setTimeout(() => res.status(404).json({ error: "Ticket not found" }), 500);
        }

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server Error" });
    }
});

// --- SERVE THE FRONTEND ---
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SkyStream Premium | My Trips</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 800: '#075985', 900: '#0c4a6e' }
                    },
                    fontFamily: {
                        sans: ['system-ui', '-apple-system', 'sans-serif'],
                        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
                    },
                    animation: { 'slide-up': 'slideUp 0.5s ease-out' }
                }
            }
        }
    </script>
    <style>
        body { background-color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
        .pass-container { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .pass-cutout { position: absolute; height: 24px; width: 24px; background-color: #f8fafc; border-radius: 50%; top: 70%; z-index: 10; }
        .pass-cutout-left { left: -12px; transform: translateY(-50%); }
        .pass-cutout-right { right: -12px; transform: translateY(-50%); }
        .tear-line { position: absolute; top: 70%; left: 20px; right: 20px; border-top: 2px dashed #cbd5e1; z-index: 5; }
        .interceptor-panel { box-shadow: 0 -5px 20px rgba(0,0,0,0.3); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .interceptor-closed { transform: translateY(100%); }
        .interceptor-open { transform: translateY(0); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0d1117; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
    </style>
</head>
<body class="text-slate-800 min-h-screen flex flex-col antialiased">
    <nav class="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20">
                <div class="flex items-center gap-3">
                    <div class="bg-brand-600 text-white p-2 rounded-lg shadow-sm"><i class="fa-solid fa-plane-up text-xl"></i></div>
                    <div>
                        <span class="block font-bold text-xl tracking-tight text-slate-900 leading-none">SKYSTREAM</span>
                        <span class="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Alliance</span>
                    </div>
                </div>
                <div class="flex items-center gap-4 md:gap-6">
                    <div class="hidden md:flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span class="font-medium" id="user-display">guest</span>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <main class="flex-grow container mx-auto px-4 py-8 md:py-12 pb-48"> 
        <div class="max-w-4xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-6">
                <div>
                    <h2 class="text-xs font-bold text-brand-600 tracking-widest uppercase mb-2">My Itinerary</h2>
                    <h1 class="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">London to New York</h1>
                    <p class="text-slate-500 mt-2 text-lg">Manage your booking details and boarding pass.</p>
                </div>
                <button onclick="initiateBoardingPassFetch()" class="w-full md:w-auto group bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95">
                    <span>Retrieve Pass</span>
                    <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </button>
            </div>

            <div id="pass-container" class="hidden">
                <div class="bg-white rounded-3xl overflow-hidden pass-container relative w-full max-w-md mx-auto md:max-w-none md:flex">
                    <div class="flex-grow p-8 md:p-10 relative">
                        <div class="flex justify-between items-start mb-8">
                            <div>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Passenger</span>
                                <h2 id="bp-name" class="text-2xl font-bold text-slate-900">LOADING...</h2>
                                <span id="bp-email" class="text-sm text-slate-500 font-medium">...</span>
                            </div>
                            <div class="text-right">
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Class</span>
                                <span id="bp-class" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">ECONOMY</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between mb-10 relative">
                            <div class="text-center w-20 md:w-24">
                                <span id="bp-origin" class="block text-4xl md:text-5xl font-bold text-slate-800 tracking-tighter">LHR</span>
                                <span class="text-xs font-semibold text-slate-400 uppercase mt-1 block">London</span>
                            </div>
                            <div class="flex-grow flex flex-col items-center px-2 md:px-4">
                                <div class="text-xs text-slate-400 font-mono mb-2">7h 25m</div>
                                <div class="w-full flex items-center gap-2">
                                    <div class="h-[2px] bg-slate-200 flex-grow"></div>
                                    <i class="fa-solid fa-plane text-brand-500 transform rotate-90 text-lg"></i>
                                    <div class="h-[2px] bg-slate-200 flex-grow"></div>
                                </div>
                                <div class="text-xs text-brand-600 font-bold mt-2 bg-brand-50 px-2 py-0.5 rounded">DIRECT</div>
                            </div>
                            <div class="text-center w-20 md:w-24">
                                <span id="bp-dest" class="block text-4xl md:text-5xl font-bold text-slate-800 tracking-tighter">JFK</span>
                                <span class="text-xs font-semibold text-slate-400 uppercase mt-1 block">New York</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-3 gap-4 md:gap-8">
                            <div><span class="block text-xs font-bold text-slate-400 uppercase mb-1">Flight</span><span id="bp-flight" class="text-lg font-semibold text-slate-900">BA117</span></div>
                            <div><span class="block text-xs font-bold text-slate-400 uppercase mb-1">Date</span><span id="bp-date" class="text-lg font-semibold text-slate-900">12 NOV</span></div>
                            <div><span class="block text-xs font-bold text-slate-400 uppercase mb-1">Seat</span><span id="bp-seat" class="text-2xl font-bold text-brand-600">--</span></div>
                        </div>
                    </div>
                    <div class="bg-slate-50 p-8 md:w-80 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-center relative">
                        <div class="pass-cutout pass-cutout-left md:hidden"></div>
                        <div class="pass-cutout pass-cutout-right md:hidden"></div>
                        <div class="tear-line md:hidden"></div>
                        <div class="hidden md:block absolute left-0 top-1/2 -translate-x-1/2 w-6 h-6 bg-[#f8fafc] rounded-full z-10 border-r border-slate-200"></div>
                        <div class="mb-auto">
                             <span class="block text-xs font-bold text-slate-400 uppercase mb-2">Secure ID (PII)</span>
                             <div class="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
                                <div class="bg-brand-50 text-brand-600 p-2 rounded"><i class="fa-solid fa-passport"></i></div>
                                <div class="overflow-hidden">
                                    <span class="block text-[10px] text-slate-400 uppercase">Passport No.</span>
                                    <span id="bp-passport" class="font-mono text-sm font-bold text-slate-800 truncate">HIDDEN</span>
                                </div>
                             </div>
                        </div>
                        <div class="mt-8 text-center">
                            <div class="bg-white p-2 rounded inline-block border border-slate-200">
                                <div class="w-32 h-32 bg-slate-800 opacity-90 flex items-center justify-center text-white text-xs"><i class="fa-solid fa-qrcode text-4xl"></i></div>
                            </div>
                            <span id="bp-ticket-id" class="block font-mono text-xs text-slate-400 mt-4 tracking-widest">REF-XXXXXX</span>
                        </div>
                    </div>
                </div>
            </div>

            <div id="loading-spinner" class="hidden py-24 text-center">
                <div class="inline-block relative"><div class="w-12 h-12 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div></div>
                <p class="mt-4 text-slate-400 font-medium animate-pulse">Verifying secure credentials...</p>
            </div>

            <div id="error-container" class="hidden mt-8 max-w-lg mx-auto bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex items-start gap-4">
                <div class="text-red-500 mt-1"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div>
                    <h3 class="font-bold text-red-800">Access Denied</h3>
                    <p class="text-sm text-red-600 mt-1">We couldn't retrieve the booking for this reference number.</p>
                </div>
            </div>
        </div>
    </main>

    <!-- INTERCEPTOR UI -->
    <div id="interceptor-ui" class="interceptor-panel fixed bottom-0 left-0 right-0 h-72 bg-[#0d1117] text-slate-300 z-50 flex flex-col font-mono text-sm interceptor-closed border-t border-slate-700">
        <div class="bg-[#161b22] px-4 py-2 flex justify-between items-center border-b border-slate-700 select-none">
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2"><i class="fa-solid fa-terminal text-green-500"></i><span class="font-bold text-slate-100">SkyProxy <span class="text-xs font-normal text-slate-500">v2.4</span></span></div>
                <div class="h-4 w-[1px] bg-slate-700"></div>
                <button onclick="toggleInterceptorState()" id="intercept-toggle-btn" class="flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 transition border border-slate-700 group">
                    <div id="status-dot" class="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-slate-400"></div>
                    <span id="btn-text">INTERCEPT: OFF</span>
                </button>
                <span id="status-indicator" class="text-xs text-slate-500 hidden md:inline">Traffic flowing...</span>
            </div>
            <button onclick="toggleInterceptorUI()" class="text-slate-500 hover:text-white transition"><i class="fa-solid fa-chevron-down"></i></button>
        </div>
        <div class="flex-grow flex overflow-hidden">
            <div class="w-48 bg-[#0d1117] border-r border-slate-800 hidden md:flex flex-col">
                <div class="p-2 text-xs font-bold text-slate-500 uppercase tracking-wider">History</div>
                <div class="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-1">
                    <div class="p-2 rounded bg-slate-800/50 text-green-400 text-xs truncate border-l-2 border-green-500 cursor-pointer">POST /api/v1/booking</div>
                </div>
            </div>
            <div class="flex-grow flex flex-col relative bg-[#0d1117]">
                <div id="intercept-overlay" class="absolute inset-0 bg-[#0d1117] z-10 flex flex-col items-center justify-center text-slate-600 select-none">
                    <i class="fa-solid fa-wifi text-3xl mb-4 opacity-30"></i><p>Proxy Active</p><p class="text-xs mt-2 opacity-75">Waiting for request...</p>
                </div>
                <div class="flex-grow p-4 font-mono text-sm overflow-hidden flex flex-col">
                    <div class="flex justify-between text-xs text-slate-500 mb-2 pb-2 border-b border-slate-800">
                        <span>POST /api/v1/booking</span><span>JSON</span>
                    </div>
                    <textarea id="request-editor" class="flex-grow bg-transparent text-blue-300 outline-none resize-none font-mono leading-relaxed p-2" spellcheck="false"></textarea>
                </div>
                <div class="p-3 bg-[#161b22] border-t border-slate-800 flex justify-end gap-3">
                    <button onclick="dropRequest()" class="px-4 py-1.5 rounded text-xs font-medium text-red-400 hover:bg-red-900/20 border border-transparent hover:border-red-900/50 transition">DROP</button>
                    <button onclick="forwardRequest()" class="px-6 py-1.5 rounded text-xs font-bold bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20 transition flex items-center gap-2">FORWARD <i class="fa-solid fa-play text-[10px]"></i></button>
                </div>
            </div>
        </div>
    </div>
    <button onclick="toggleInterceptorUI()" class="fixed bottom-6 right-6 bg-slate-900 text-white w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition duration-300 z-40 shadow-xl border border-slate-700"><i class="fa-solid fa-bug text-xl"></i></button>

    <script>
        const current_session = { userId: 101, username: "j_doe99" };
        document.getElementById('user-display').innerText = current_session.username;

        let isInterceptorVisible = false;
        let isInterceptOn = false;
        let pendingRequestResolve = null;

        // --- REAL API CALL TO NODEJS BACKEND ---
        async function backendApiCall(payload) {
            const response = await fetch('/api/v1/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("API Error");
            return await response.json();
        }

        function initiateBoardingPassFetch() {
            document.getElementById('pass-container').classList.add('hidden');
            document.getElementById('error-container').classList.add('hidden');
            document.getElementById('loading-spinner').classList.remove('hidden');

            const rawRef = "REF-5001";
            const encodedRef = btoa(rawRef); // Base64 Encode
            const payload = {
                _token: "sk_live_837294",
                booking_ref: encodedRef,
                timestamp: Date.now()
            };
            sendRequest(payload).then(renderData).catch(handleError);
        }

        async function sendRequest(payload) {
            if (isInterceptOn) {
                updateStatus("PAUSED");
                document.getElementById('intercept-overlay').classList.add('hidden');
                document.getElementById('request-editor').value = JSON.stringify(payload, null, 4);
                if (!isInterceptorVisible) toggleInterceptorUI();
                return new Promise((resolve, reject) => {
                    pendingRequestResolve = { resolve, reject };
                });
            } else {
                return backendApiCall(payload);
            }
        }

        function forwardRequest() {
            if (!pendingRequestResolve) return;
            try {
                const modifiedPayload = JSON.parse(document.getElementById('request-editor').value);
                document.getElementById('intercept-overlay').classList.remove('hidden');
                updateStatus("Traffic flowing...");
                backendApiCall(modifiedPayload)
                    .then(pendingRequestResolve.resolve)
                    .catch(pendingRequestResolve.reject);
                pendingRequestResolve = null;
            } catch (e) { alert("Invalid JSON"); }
        }

        function dropRequest() {
            if (!pendingRequestResolve) return;
            document.getElementById('intercept-overlay').classList.remove('hidden');
            document.getElementById('loading-spinner').classList.add('hidden');
            pendingRequestResolve = null;
        }

        function renderData(data) {
            document.getElementById('loading-spinner').classList.add('hidden');
            document.getElementById('pass-container').classList.remove('hidden');
            document.getElementById('bp-name').innerText = data.passenger;
            document.getElementById('bp-email').innerText = data.email;
            document.getElementById('bp-passport').innerText = data.passport;
            document.getElementById('bp-flight').innerText = data.flight;
            document.getElementById('bp-origin').innerText = data.origin;
            document.getElementById('bp-dest').innerText = data.dest;
            document.getElementById('bp-date').innerText = data.date;
            document.getElementById('bp-seat').innerText = data.seat;
            document.getElementById('bp-ticket-id').innerText = data.id;
            const classEl = document.getElementById('bp-class');
            classEl.innerText = data.class.toUpperCase();
            if (data.class === "First Class") classEl.className = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200";
            else if (data.class === "Business") classEl.className = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200";
            else classEl.className = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200";
        }

        function handleError() {
            document.getElementById('loading-spinner').classList.add('hidden');
            document.getElementById('error-container').classList.remove('hidden');
        }

        function toggleInterceptorUI() {
            const panel = document.getElementById('interceptor-ui');
            isInterceptorVisible = !isInterceptorVisible;
            if (isInterceptorVisible) { panel.classList.remove('interceptor-closed'); panel.classList.add('interceptor-open'); }
            else { panel.classList.add('interceptor-closed'); panel.classList.remove('interceptor-open'); }
        }

        function toggleInterceptorState() {
            isInterceptOn = !isInterceptOn;
            const btnText = document.getElementById('btn-text');
            const dot = document.getElementById('status-dot');
            const indicator = document.getElementById('status-indicator');
            if (isInterceptOn) {
                btnText.innerText = "INTERCEPT: ON"; btnText.classList.add('text-green-400');
                dot.classList.replace('bg-slate-500', 'bg-green-500'); dot.classList.add('animate-pulse');
                indicator.innerText = "Waiting for request..."; indicator.className = "text-xs text-green-400 animate-pulse hidden md:inline";
            } else {
                btnText.innerText = "INTERCEPT: OFF"; btnText.classList.remove('text-green-400');
                dot.classList.replace('bg-green-500', 'bg-slate-500'); dot.classList.remove('animate-pulse');
                indicator.innerText = "Proxying traffic..."; indicator.className = "text-xs text-slate-500 hidden md:inline";
                if(pendingRequestResolve) forwardRequest();
            }
        }
        function updateStatus(msg) { document.getElementById('status-indicator').innerText = msg; }
    </script>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`[LAB] Server running at http://localhost:${PORT}`);
    console.log(`[LAB] Database is hidden in memory.`);
});
