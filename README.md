# Sana Risk Management MERN Project

Updated version with a cleaner UI inspired by the uploaded `ai-risk-management-system.zip`, plus working MERN functionality.

## What is included

- Node/Express backend using MVC structure
- MongoDB Atlas connection in `backend/.env`
- React + Vite frontend
- Clean sidebar dashboard UI
- Project portfolio and project creation
- Sprint creation and Agile task board
- Task status updates and delete
- Centralized risk register
- Manual risk creation
- AI/rule-based project risk scan
- AI Analyzer manual prediction panel
- RMMM: mitigation, monitoring, management plans
- Risk exposure calculation
- Notifications
- User management
- Reports with JSON/CSV export

## Run backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend runs on: `http://localhost:5000`

## Run frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Login

Use any seeded account:

```text
manager@riskpro.com / password123
dev@riskpro.com / password123
stakeholder@riskpro.com / password123
```

Use the manager account to create projects, users, sprints and risks.

## AI Scan Demo Notes

For testing the AI scan, add at least these items inside one active sprint:
- 3 open BUG items to trigger Quality Risk.
- 2 high-priority tasks with due dates within the next 7 days, or any past due task, to trigger Schedule Risk.
- Assign 35+ estimated hours to the same developer to trigger Resource Risk.
- Keep the active sprint velocity below 70%, for example Target Velocity 40 and Completed Points 12, to trigger Delay Risk.

If the scan says `0 new risks created` but risks were detected, it usually means those same open risks already exist. Close/delete old risks or open the Risk Register to view them.
