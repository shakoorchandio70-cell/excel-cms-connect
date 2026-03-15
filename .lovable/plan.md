

# CATI E&M Complaint Management System — Frontend Update Plan

Based on the uploaded master prompt image, the current app needs to be updated with CATI-specific branding, categories, sections, and form fields. Here's the plan focusing on **frontend only** so you can review the look and feel before we wire up the backend.

## Changes Overview

### 1. Branding — Update to "CATI E&M"
- **AuthPage**: Change "CMS Portal" → "CATI E&M" and subtitle → "Complaint Management System"
- **AppLayout sidebar**: Same branding update in header

### 2. CATI-specific complaint categories & sections
Replace generic categories with domain-specific ones:
- **Complaint Types**: AC not working, Bulb replacement, Fan not working, Electrical fault, Plumbing issue, Other
- **Sections**: ANS ATS, ANS ATSEP, APS ES, APS RFFS

### 3. Updated Complaint Form
Add a **Section** dropdown field to the complaint form (both create and edit). Update the `ComplaintsPage` form and table to show section alongside category.

### 4. Complaint Table Enhancement
- Add a "Section" column to the complaints table
- Show section in the recent complaints on the dashboard

### 5. Dashboard Branding
- Update heading text to reference "CATI E&M"
- Keep existing stat cards and recent complaints list

## Files to modify

| File | Changes |
|------|---------|
| `src/pages/AuthPage.tsx` | Branding text |
| `src/components/AppLayout.tsx` | Sidebar branding text |
| `src/pages/ComplaintsPage.tsx` | Replace CATEGORIES with CATI types, add SECTIONS array, add section field to form and table |
| `src/pages/DashboardPage.tsx` | Branding text update |

## Technical notes
- The `section` field will be added to the form state and UI now, but the actual database column will be added later when we do the backend pass.
- For now, we'll store section in the form but only submit fields the DB already supports, avoiding errors.

