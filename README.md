# skystream-idor-lab
A realistic Node.js airline API demonstrating Blind IDOR (BOLA) vulnerabilities hidden behind Base64 obfuscation.


How to run:

    Install Node.js.

    Put package.json and server.js in a folder.

    Run npm install in your terminal.

    Run node server.js.

    Go to http://localhost:3000.

Exploit Path:

    The frontend sends a POST to /api/v1/booking with a Base64 encoded ref (REF-5001 -> UkVGLTUwMDE=).

    Intercept the request (using Burp Suite, Zap, or the built-in UI).

    Change the Base64 to match REF-5002 (UkVGLTUwMDI=).

    The server blindly returns the victim's data because it lacks authorization checks.
