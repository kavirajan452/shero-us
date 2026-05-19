# Instant Delivery Search Logic (Human Readable)

This document explains how search currently works from the Home page to Instant Delivery results.

## 1) Where search starts

- Search starts in the Home page hero section.
- When the user submits search:
  - The app navigates to `/instant-delivery`.
  - It passes the entered search text through navigation state, not a search query parameter.
  - It includes location params in the URL if available:
    - `locMethod`
    - `locLabel`
    - `locZip`
    - `locLat`
    - `locLng`

This keeps location deep-link friendly without putting the typed search text into the URL.

## 2) How Instant Delivery reads search + location

- Instant Delivery initializes the search box from navigation state when the user arrives from Home.
- For location, it checks URL params first.
- If URL location is missing, it falls back to saved location from `CustomerLocationContext`.
- ZIP values are normalized to digits and limited to 5 characters.
- Invalid ZIPs are flagged and shown to the user.

## 3) Search suggestions

- The Instant Delivery search box shows suggestions in a dropdown.
- Suggestions are generated from live data already loaded on the page:
  - Dish names from `instant_menu_items`
  - Kitchen names
  - Cuisine names
  - Kitchen location text
- Matching is case-insensitive.
- Suggestions are deduplicated and limited to a short list.
- If the user has typed text, prefix matches are shown first.
- Clicking a suggestion fills the search box and immediately filters the visible kitchens.

## 4) Which kitchens are considered before text matching

Kitchen fetching is location-aware:

- If customer latitude/longitude is available:
  - Kitchens are filtered by distance radius (in km) from app config (`kitchen_visibility_radius_km`).
  - If this returns no kitchens and ZIP exists, logic falls back to ZIP matches.
- If only ZIP is available:
  - Kitchens are filtered by ZIP match.
- If no location exists:
  - Active kitchens are returned without distance/ZIP filtering.

## 5) Live vs unavailable kitchens

- Search and filters are applied to **live kitchens** (`is_attendance_marked = true`).
- Unavailable kitchens are listed separately in a collapsible section.

## 6) What the text search matches

Search is case-insensitive and trims spaces.

A kitchen is included when query text matches any of:

- Kitchen name
- Any cuisine value
- Kitchen location text
- Any dish name belonging to that kitchen

Dish-name matching is done by building an index from `instant_menu_items` grouped by `kitchen_id`.

## 7) Additional filters after text match

After search matching, these filters/sort options are applied:

- Category filter (`All` or selected category)
- Veg-only toggle (`is_veg`)
- Sort by distance (if selected)

## 8) Empty-state behavior

The UI shows specific messages depending on why results are empty:

- No serviceable kitchens in selected area
- No search match for the entered query in this area
- No live kitchens after applying filters

## 9) Analytics events related to search

- `search_submitted` when search is submitted from Home.
- `search_no_results` when Instant Delivery finishes loading and filtered result count is zero.
