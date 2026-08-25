# ResQPaw - AI Street Animal Rescue Coordinator

ResQPaw is an AI-assisted street animal rescue coordination platform. It connects citizens, rescuers, NGOs, and veterinarians to facilitate the reporting, tracking, and treatment of street animals in need.

## Features
- **Citizen Reporting**: Multi-step form with image upload and geolocation.
- **AI Triage**: Mock AI automatically assesses priority based on conditions and images.
- **Role-based Dashboards**: Specific views for Citizens and Rescuers.
- **Live Rescue Map**: OpenStreetMap integration showing nearby active cases.
- **Real-time Updates**: Rescuers can claim and update case statuses.

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Leaflet, Framer Motion
- **Backend**: Python, FastAPI, SQLAlchemy, SQLite (for local demo)

## How to Run

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate`
4. `pip install -r requirements.txt` (or install manually as done in setup)
5. `uvicorn main:app --reload` (Runs on port 8000)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs on port 5173)

### Demo Data
To seed the database with mock users and cases:
1. `cd database`
2. `source ../backend/venv/bin/activate`
3. `python seed.py`

## Users for Demo
- Citizen: `citizen@demo.com` / `password`
- Rescuer: `rescuer@demo.com` / `password`
