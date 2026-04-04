

# Remove Region Switcher from Navbar

## Change
Remove the `<RegionSwitcher />` component from `src/components/Navbar.tsx` (line ~53) and clean up the unused import of `RegionSwitcher` (line 8).

The `RegionSwitcher` component file and `RegionContext` remain untouched — only the navbar rendering is removed.

## Files
1. **`src/components/Navbar.tsx`** — Remove `import RegionSwitcher` and the `<RegionSwitcher />` JSX element from the header actions area.

