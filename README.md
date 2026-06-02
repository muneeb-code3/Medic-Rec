# Medic-Rec

![Dashboard Screenshot](https://raw.githubusercontent.com/muneeb-code3/Medic-Rec/main/public/screenshot.png)

## 📖 Overview

**Medic‑Rec** is a lightweight, local‑first web application for managing personal medical records. It provides a clean, responsive dashboard where you can:
- Add and view doctors.
- Create medical record entries (visits, lab results, imaging, vaccines).
- See a chronological timeline of records.
- Store data locally in a SQLite database.

The UI follows modern design principles with a dark sidebar, glass‑like modals, and smooth micro‑animations.

## ✨ Features

- **Add new doctors** and **medical records** instantly via modals.
- **Dynamic doctor dropdown** populated from the database.
- **Responsive layout** – works on desktop, tablet, and mobile.
- **Local SQLite persistence** – no external services required.
- **Fully open‑source** – built with plain JavaScript, Express, and SQLite.

## 🛠️ Tech Stack

- **Front‑end**: HTML5, vanilla CSS (custom design system), vanilla JavaScript (ES6).
- **Back‑end**: Node.js, Express, SQLite3.
- **Build / Run**: npm scripts (`npm run init-db`, `npm start`).

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/muneeb-code3/Medic-Rec.git
   cd Medic-Rec
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Initialize the database** (optional – the app will auto‑create on first run)
   ```bash
   npm run init-db
   ```
4. **Start the server**
   ```bash
   npm start
   ```
5. Open your browser at `http://localhost:5000`.

## 📚 API Endpoints

| Method | Endpoint          | Description                                 |
|--------|-------------------|---------------------------------------------|
| GET    | `/api/doctors`    | Retrieve all doctors (ordered newest first). |
| POST   | `/api/doctors`    | Add a new doctor (`name` required).         |
| GET    | `/api/records`    | Retrieve all medical records with doctor name. |
| POST   | `/api/records`    | Add a new medical record (title, category, record_date required). |

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/awesome‑feature`).
3. Commit your changes and push to your fork.
4. Open a PR against the `main` branch.

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.