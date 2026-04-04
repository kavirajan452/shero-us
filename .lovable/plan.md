

# Add Return & Refund Policy Page

## What We're Building
A dedicated **Return & Refund Policy** legal page (`/return-policy`) that clearly states food items cannot be returned due to safety and hygiene regulations, along with the refund scenarios that do apply (quality issues, missing items, cancellations). This is standard for US food businesses.

## Changes

### 1. New Page — `src/pages/legal/ReturnPolicy.tsx`
- Same layout as existing legal pages (back button, heading, last-updated date, prose sections)
- Sections covering:
  1. **No Physical Returns** — food cannot be returned due to FDA food safety and hygiene standards
  2. **Quality Guarantee** — if food arrives damaged, incorrect, or with quality issues, customer can report within 1 hour for credit/refund
  3. **Missing or Incorrect Items** — report within 1 hour, refund or re-delivery at Shero's discretion
  4. **Cancellation Refunds** — reference existing policy (before prep = full refund; party orders = 72h cutoff)
  5. **Refund Processing** — 5–10 business days to original payment method; wallet credits instant
  6. **Non-Refundable Scenarios** — consumed food, late complaints (>1hr), change of mind after delivery
  7. **Contact** — support@shero.us for disputes

### 2. Route — `src/App.tsx`
- Import `ReturnPolicy` and add `<Route path="/return-policy" …/>`

### 3. Footer Link — `src/components/Footer.tsx`
- Add "Return Policy" link in the legal links row alongside Privacy Policy, Terms, etc.

### Technical Notes
- Follows exact same component pattern as `TermsOfService.tsx`
- No database changes needed
- No new dependencies

