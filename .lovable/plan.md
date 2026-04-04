

# Fix: Restrict Complaint Section to User's Own Location

## Problem
Any non-admin user can pick any section from the dropdown when creating a complaint. Officials should only submit complaints for their own section/location.

## Solution

### File: `src/pages/ComplaintsPage.tsx`

**1. Pass user context to ComplaintForm**
- Pass `isAdmin` and the user's `profile.location` (from `useUserRole`) into the `ComplaintForm` component as props.

**2. ComplaintForm — conditional section field**
- If `isAdmin`: show the section dropdown as-is (all SECTIONS).
- If non-admin: hide the dropdown entirely. Initialize `form.section` to the user's `profile.location`. Display it as a read-only text field so the user can see their section but not change it.

**3. Officials complaint list filtering**
- Currently, officials see all complaints (RLS returns complaints where `created_by = auth.uid()`). The existing RLS policy already handles this correctly — officials only see their own complaints. No RLS change needed.
- However, if officials should also see complaints from their same section (submitted by others in their location), that would require an RLS change. Based on the current RLS (`created_by = auth.uid() OR assigned_to = auth.uid() OR admin`), officials only see what they created, which seems correct.

### Technical Details

- `useUserRole()` already returns `profile` with `location` field — no new queries needed.
- The `ComplaintForm` component signature changes from `{ onSubmit, loading }` to `{ onSubmit, loading, isAdmin, userSection }`.
- `userSection` defaults to `"ANS - ATS Block"` if profile location is somehow empty.
- No database or RLS changes required.

### Build Order
1. Update `ComplaintForm` props to accept `isAdmin` and `userSection`
2. Conditionally render section dropdown (admin) vs read-only display (non-admin)
3. Initialize form section from `userSection` for non-admins
4. Pass props from the parent where `ComplaintForm` is used

