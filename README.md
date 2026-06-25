# MarsMate TS-EAPCET 2026 | College Predictor & Counselling Companion

An interactive, premium single-page web application (SPA) designed to help students navigate the **TG-EAPCET (Telangana EAPCET) 2026** web counselling process, compare colleges, build option entry forms, and simulate seat allotment based on historical cutoff trends.

> [!NOTE]
> For a deep dive into the software architecture, database structures, sequence flows, and system parameters, please refer to the detailed [documentation.md](file:///c:/Users/nvams/Desktop/ts%20eapcet%20college%20data/documentation.md).

---

## 🚀 Key Features

*   **Live College Predictor:** In-memory filtering of autonomous, private, and government colleges based on rank, reservation category, gender, and regional eligibility rules.
*   **2026 Allotment Probability S-Curve:** Estimates admission likelihood ("Safe Pick", "Good Bet", "Borderline", or "Reach") using YoY market demand indicators per branch.
*   **Web Option Simulator:** Drag-and-drop interactive ranking list where students can priority-order their college choices.
*   **Mock Seat Allotment Engine:** Evaluates convenience quota allocations against the student's option list in real time, outlining target rank gaps.
*   **Fee Reimbursement Budgeter:** Computes government tuition fee waivers (Full merit / standard ₹35k / TSSP partial) and estimates a 4-year cumulative cost sheet.
*   **Verification Document Checklist:** Tracks certificate statuses with links to official MeeSeva and EAPCET download portals.
*   **Admin Dashboard:** Telemetry view monitoring sessions, devices, and event analytics locally.

---

## 🛠️ Quick Start

### Prerequisites
*   Node.js (v16+)
*   Python 3 (only for compilation scripts)

### Running Locally
To launch the static web server and test the client interface locally:

1.  Clone the repository and navigate to the project directory.
2.  Install the server utility:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *Alternative (direct execution without npm dependencies):*
    ```bash
    npx serve -s .
    ```
4.  Open the dashboard in your web browser at `http://localhost:3000`.

---

## 🗃️ Data Compilation Pipeline

All institutional information, placement figures, and last ranks are pre-compiled into the client-side `data.js` database bundle. 

If reference data in `ts eapcet data/` or raw lists under `main data/` are updated, re-run the compilation compiler script:

```bash
python process_data.py
```

### Reference Datasets Used:
*   `ts eapcet data/01_College_Master_List_2026.csv`: Primary college parameters (hostels, NAAC grading, founding years).
*   `ts eapcet data/02_Branch_Code_Reference.csv`: Core engineering branch classifications.
*   `ts eapcet data/04_Category_Seat_Matrix.csv`: Convenience seats matrix.
*   `ts eapcet data/07_Marks_vs_Rank_Reference.csv`: Interpolation bracket limits.
*   `main data/table-eapcet.txt`: Placements details (highest/average package and recruiters).
*   `main data/TGEAPCET_2025_..._LASTRANKS.csv`: Phase 1, Phase 2, and Final phase EAPCET last ranks.

---

## ☁️ Deployment

The application is fully client-side and can be deployed directly to static hosts such as **Vercel**, **Netlify**, or **GitHub Pages**:

1.  Configure the build output directory to root `./` (since index.html, app.js, and app.css sit in the root).
2.  Set the start command to `npx serve -s .` (or equivalent).
3.  (Optional) Set up Firebase Auth API Keys in `auth.js` and a Firebase Realtime Database URL in `stats.js` to enable SMS OTP login and global platform usage statistics.

---

## 📄 License
This project is licensed under the MIT License - see the `LICENSE` file for details.