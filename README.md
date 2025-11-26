# ✈️ SkyStream Airlines — Advanced IDOR / BOLA Lab

A realistic, self-contained educational lab that simulates **Broken Object Level Authorization (BOLA)** — commonly known as **IDOR**.

Unlike basic CTFs that use obvious IDs like `?id=1`, this lab uses **Base64 ID obfuscation** to mimic modern “secure-looking” APIs. It also includes a built-in **SkyProxy interceptor** so you can demo attacks without Burp Suite for the basics.

---

##  What You’ll Learn

- How **BOLA/IDOR** happens in real apps
- Why **“obfuscation” (Base64) is NOT security**
- How to do recon, intercept, modify requests, and validate impact
- How to write clearer bug bounty reports with a realistic scenario

---

##  Scenario

You are logged in as **John Doe** on the SkyStream Airlines dashboard.

Your goal: bypass authorization controls to access the **PII** of other passengers — specifically the VIP:

> **Alice Smith** (Passport Number, Email, Flight Details, Boarding Pass)

---

## Features

-  Realistic airline dashboard flow
-  API endpoints that “look secure” (Base64 obfuscated object reference)
-  Built-in request interceptor: **SkyProxy**
-  Focused, beginner-friendly exploit path
-  Self-contained + runs locally

---

##  Tech Stack

- **Node.js** (v14+)
- Simple server + UI (no external dependencies required besides npm packages)

---

## Installation & Setup

### Prerequisites
- Node.js **v14+**

### Quick Start

```bash
git clone https://github.com/aptspider/skystream-idor-lab.git
cd skystream-idor-lab
npm install
node server.js

 Disclaimer
This application contains intentional security vulnerabilities.
Do NOT run this application on a public server or production environment.
Use only for educational purposes and authorized testing.
Created for the Bug Bounty Series.


