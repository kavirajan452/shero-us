

# Add Delivery & Pickup Instructions to Checkout

## Overview
Add two instruction sections to the checkout page so customers can specify how the delivery partner should pick up food from the kitchen and deliver it to their door. These get stored with the order for future delivery partner API integration.

## Database Change
Add two columns to `instant_orders`:
```sql
ALTER TABLE instant_orders ADD COLUMN delivery_instructions text;
ALTER TABLE instant_orders ADD COLUMN pickup_instructions text;
```

## UI Changes — `src/pages/Checkout.tsx`

Add a new section after the Delivery slot picker (after line ~451), before Tips:

**Pickup Instructions** (for driver at the kitchen):
- Preset chips: "Use back entrance", "Ask at counter", "Ring bell at gate", "Pick from my door"
- Optional custom text input (max 200 chars)

**Delivery Instructions** (for driver at customer's address):
- Preset chips: "Leave at door", "Hand it to me", "Do not ring bell", "Call on arrival"
- Optional custom text input (max 200 chars)

## State & Data Flow
- Two new state variables: `deliveryInstructions`, `pickupInstructions`
- Chip toggle appends/removes preset text (comma-separated)
- Custom text field appends to the string
- Both values passed into `createOrder.mutate()` and `saveIncomplete.mutate()` in `handlePaymentSuccess` / `handlePaymentFailure`

## Files to Change
1. **Database migration** — add `delivery_instructions` and `pickup_instructions` columns
2. **`src/pages/Checkout.tsx`** — add instruction UI + state + pass to order mutations
3. **`src/hooks/useSupabaseData.ts`** — verify `useCreateInstantOrder` accepts the new fields (insert type auto-generated from schema)

