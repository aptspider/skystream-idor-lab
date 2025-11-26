##SkyStream Airlines - Advanced IDOR/BOLA Lab ✈️

**A realistic, self-contained educational lab simulating a Broken Object Level Authorization (BOLA) vulnerability, often referred to as IDOR.

Unlike basic CTF challenges that use simple integers (id=1), this lab implements Base64 ID Obfuscation to simulate modern, "secure-looking" API endpoints. It features a built-in "SkyProxy" interceptor tool, removing the need for external proxies during basic demonstrations.**

Scenario

You are a logged-in user (John Doe) on the SkyStream Airlines dashboard. Your goal is to bypass the authorization controls and access the PII (Passport Number, Email, Flight Details) of other passengers, specifically the VIP user "Alice Smith".

 Installation & Setup

Prerequisites

Node.js (v14+)

Quick Start

Clone this repository:

git clone [https://github.com/aptspider/skystream-idor-lab.git](https://github.com/aptspider/skystream-idor-lab.git)
cd skystream-idor-lab


Install dependencies:

npm install


Start the server:

node server.js


Access the lab:
Open your browser and navigate to http://localhost:3000

Exploit Guide (Educational Use Only)

Recon: Observe that the browser URL bar does not contain resource IDs.

Intercept: Open the SkyProxy panel (bottom right) and enable Intercept.

Capture: Click "Retrieve Pass". Analyze the JSON body:

{
  "booking_ref": "UkVGLTUwMDE="
}


Decode: Identify the value as Base64. Decode it to reveal REF-5001.

Attack: - Modify the underlying ID to REF-5002 (Alice Smith).

Re-encode to Base64: UkVGLTUwMDI=.

Inject into the interceptor and Forward.

Impact: The server returns the victim's boarding pass and sensitive PII.

 Disclaimer

This application contains intentional security vulnerabilities.

Do NOT run this application on a public server or production environment.

Use only for educational purposes and authorized testing.

Created for the Bug Bounty Series.
