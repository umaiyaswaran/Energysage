EnergySage MVP Development Plan
Overview
Building a full-stack energy monitoring and analytics platform with Household and Industry modes.

Core Files to Create (Max 8 files limit - MVP approach)
1. Frontend Components (4 files)
src/pages/Index.tsx - Landing page with Household/Industry mode selection
src/components/Dashboard.tsx - Main dashboard with charts, metrics, and recommendations
src/components/DataInput.tsx - CSV upload and manual input forms
src/components/Charts.tsx - Energy consumption charts and forecasts
2. Backend Simulation (2 files)
public/api/mock-api.js - Mock API endpoints for demo (client-side simulation)
public/data/sample-data.json - Sample energy data for household and industry
3. AI Analytics (1 file)
src/lib/analytics.ts - Client-side analytics functions (anomaly detection, forecasting, recommendations)
4. Configuration (1 file)
src/lib/constants.ts - Configuration constants and data structures
MVP Features Implementation Strategy
Mode Selection: Simple landing page with Household/Industry buttons
Data Input: CSV upload (client-side parsing) + manual entry form
Dashboard: Interactive charts using Chart.js/Recharts showing:
Real-time consumption timeline
Device/appliance breakdown (pie chart)
7-day forecast
Cost & carbon metrics
Anomaly highlights
Recommendation cards
Analytics: Client-side algorithms for:
Basic trend analysis
Simple anomaly detection (statistical thresholds)
Rule-based recommendations
Linear forecast projection
Simplified Architecture
Frontend-only MVP using React + TypeScript + Shadcn/UI
Mock backend with static JSON data and client-side processing
Sample datasets for both household and industry scenarios
Responsive dashboard with modern green/blue sustainability theme
Success Criteria
Users can select Household/Industry mode
Upload CSV or input manual energy data
View interactive dashboard with all key metrics
See energy forecasts and recommendations
Identify inefficiencies and anomalies
Clean, professional UI with sustainability theme