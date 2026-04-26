# ICP Dashboard

## Project Details
The **ICP Dashboard** is an intelligent web application designed to track and manage Industrial Collaboration Program (ICP) and Industrial Collaboration Value (ICV) contracts. It provides a comprehensive overview of active contracts, IPDs (Industrial Participation Programs), and urgent action items.

### Key Features
- **Data Integration:** Upload and parse complex Excel spreadsheets (e.g., Master Tracker Compilation) directly into the database.
- **Visual Analytics:** Interactive charts and key performance indicator (KPI) bars to visualize ICV and contract statuses.
- **AI Chatbot Integration:** An embedded AI assistant powered by Vercel AI SDK to provide insights and answer queries.
- **Contract Management:** Detailed contract tables featuring specific badges (like `WaiverBadge` and `ObaBadge`) and progress indicators.
- **Urgent Alerts:** Expiry alerts and urgent item tracking to ensure timely action on approaching deadlines.

## Tech Stack
- **Frontend Framework:** React 19, Vite
- **Routing:** React Router DOM
- **Database & Backend:** Supabase (PostgreSQL)
- **State Management:** Zustand
- **AI Integration:** Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/openai`)
- **Data Visualization:** Recharts
- **Data Parsing:** `xlsx` (SheetJS)
- **Styling:** Vanilla CSS (for maximum flexibility and dynamic design)

## Current Progress
- [x] Initial project structure setup with routing and views.
- [x] Visual theme established (transitioned to an Inter-based light theme).
- [x] Supabase integration configured for database operations.
- [x] Core UI components implemented (Sidebar, KpiBar, UrgentPanel, ExpiryAlert).
- [x] Excel Upload and Parsing logic refined for accurate contract and IPD extraction.
- [x] Contract Table developed with dynamic badges and progress tracking.
- [x] AI ChatBot component initialized.
- [x] Initial commit to GitHub repository.
