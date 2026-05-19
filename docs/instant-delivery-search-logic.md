# Instant Delivery Search Logic (Human Readable)

This document explains how search currently works from the Home page to Instant Delivery results.

## 1) Where search starts

- Search starts in the Home page hero section.
- When the user submits search:
  - The app navigates to `/instant-delivery`.
  - It includes `q` (search text) in URL query params.
  - It also includes location params if available:
    - `locMethod`
    - `locLabel`
    - `locZip`
    - `locLat`
    - `locLng`

This makes search shareable and deep-link friendly.

## 2) How Instant Delivery reads search + location

- Instant Delivery reads `q` from URL and keeps the search input synced with it.
- For location, it checks URL params first.
- If URL location is missing, it falls back to saved location from `CustomerLocationContext`.
- ZIP values are normalized to digits and limited to 5 characters.
- Invalid ZIPs are flagged and shown to the user.

## 3) Which kitchens are considered before text matching

Kitchen fetching is location-aware:

- If customer latitude/longitude is available:
  - Kitchens are filtered by distance radius (in km) from app config (`kitchen_visibility_radius_km`).
  - If this returns no kitchens and ZIP exists, logic falls back to ZIP matches.
- If only ZIP is available:
  - Kitchens are filtered by ZIP match.
- If no location exists:
  - Active kitchens are returned without distance/ZIP filtering.

## 4) Live vs unavailable kitchens

- Search and filters are applied to **live kitchens** (`is_attendance_marked = true`).
- Unavailable kitchens are listed separately in a collapsible section.

## 5) What the text search matches

Search is case-insensitive and trims spaces.

A kitchen is included when query text matches any of:

- Kitchen name
- Any cuisine value
- Kitchen location text
- Any dish name belonging to that kitchen

Dish-name matching is done by building an index from `instant_menu_items` grouped by `kitchen_id`.

## 6) Additional filters after text match

After search matching, these filters/sort options are applied:

- Category filter (`All` or selected category)
- Veg-only toggle (`is_veg`)
- Sort by distance (if selected)

## 7) Empty-state behavior

The UI shows specific messages depending on why results are empty:

- No serviceable kitchens in selected area
- No search match for the entered query in this area
- No live kitchens after applying filters

## 8) Analytics events related to search

- `search_submitted` when search is submitted from Home.
- `search_no_results` when Instant Delivery finishes loading and filtered result count is zero.
