

# Fix Plan — Mobile Number, Inventory Data, Total Used, Twilio SMS

## Overview

Four fixes: (1) show mobile number field for all roles, (2) replace inventory seed data with 46 real items, (3) ensure Total Used column reads `total_consumed`, (4) set up Twilio via connector and update edge functions to use the gateway.

---

## Fix 1 — Mobile Number for All Roles

**File: `src/pages/ProfilePage.tsx`**

- Remove the `isSuperAdmin` condition (line 51, line 78). Show the mobile number field and daily alert time for ALL users.
- Keep the daily alert time visible only to admins (since only they receive stock alerts). Mobile number should be unconditional.

**File: `src/components/AppLayout.tsx`**

- Profile link is already in the nav for all roles (line 22) — no change needed.

**No DB changes needed** — `profiles` table already has `mobile_number` and `mobile_updated_at` columns.

---

## Fix 2 — Replace Inventory Seed Data

**Use the database insert tool** to:
1. `DELETE FROM inventory;` — clear all existing rows
2. `INSERT INTO inventory ...` — insert the 46 real items from the spec with correct categories, units, stock levels, and min levels

Categories used: Switches & Sockets, Circuit Protection, Fans, AC & Cooling, Conduit & Ducting, Wiring & Cabling, Fixings & Hardware, Miscellaneous, Meters & Instruments, Extension & Multi-socket, Lighting.

**File: `src/pages/InventoryPage.tsx`**

Update the status badge logic (around line 151-164) to show 4 levels:
- `current_stock > min_level` → Green "OK"
- `current_stock > 0 && current_stock <= min_level` → Amber "Low Stock"  
- `current_stock === 0` → Red "Depleted"
- `current_stock < 0` → Dark pink "Negative"

Update the Add New Item modal category dropdown (line 299) to use the real categories from the data instead of hardcoded "HVAC", "Accessories", etc.

---

## Fix 3 — Total Used Column

The inventory query already uses `select("*")` which includes `total_consumed`, and line 160 already renders `{Number(item.total_consumed)}`. This should work correctly once the seed data is replaced with correct values. Will verify no issues exist.

---

## Fix 4 — Twilio SMS via Connector

1. **Connect Twilio** using the `standard_connectors--connect` tool to set up `TWILIO_API_KEY` and `LOVABLE_API_KEY` as secrets.
2. **Ask user for `TWILIO_PHONE_NUMBER`** via `add_secret` since the connector doesn't provide the From number.
3. **Update `check-low-stock/index.ts`** — replace direct Twilio API calls (lines 76-103) with the connector gateway pattern (`https://connector-gateway.lovable.dev/twilio/Messages.json` with `LOVABLE_API_KEY` + `TWILIO_API_KEY` headers).
4. **Update `daily-stock-summary/index.ts`** — same gateway migration.
5. **`send-sms-on-resolve/index.ts`** already uses the gateway — no changes needed.
6. **Update `src/pages/InventoryPage.tsx`** — make the SMS banner conditional: check if Twilio is configured (via a quick edge function call or env check) and hide when configured.

---

## Build Order

1. Update ProfilePage — remove `isSuperAdmin` guard on mobile field
2. Replace inventory data via DB tool
3. Update InventoryPage — 4-tier status badges + fix category list
4. Connect Twilio connector + request phone number secret
5. Update `check-low-stock` and `daily-stock-summary` to use gateway
6. Conditionally hide SMS banner

