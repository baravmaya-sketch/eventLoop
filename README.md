# ⚡ Stack & Loop
> **Step inside the JavaScript runtime.** A visual, cyberpunk-themed Event Loop interpreter.

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## 🚀 Overview
**Stack & Loop** is a developer tool designed to visualize exactly how JavaScript executes code. It breaks down the **Call Stack**, **Web APIs**, **Microtask Queue**, and **Macrotask Queue** into a stunning, dark-mode/hardware-style interface.

Perfect for learning, teaching, or just watching the chaos of async code unfold in real-time.

## ✨ Features
- **🕵️‍♂️ Visual Interpreter**: Watch valid JS code execute step-by-step.
- **🎨 Hardware/VS Code Theme**: A professional, dark-mode aesthetic with calm blues and grays.
- **🔒 Secure Sandbox**: Input sanitization and strict execution policies (no `eval`).
- **🕹️ Control Center**:
  - **Run**: Auto-play your simulation.
  - **Speed**: Tweak the matrix time dilation (Slow, Normal, Fast).
- **🛑 Failure Mode**: Visual "System Failure" effects when syntax errors occur.

## 🛠️ Installation

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
*Backend runs on: `http://localhost:8000`*

### 2. Frontend Setup (Angular)
```bash
cd frontend
npm install
npx ng serve --port 4300
```
*Frontend runs on: `http://localhost:4300`*

## 🎮 Usage
1. Open **http://localhost:4300**.
2. Type JavaScript code in the editor on the left.
3. Click **Run >>**.
4. Watch the stack and queues animate on the right!

---
*Built with ❤️ by the Antigravity Team.*
