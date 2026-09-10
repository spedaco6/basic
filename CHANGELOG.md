# Changelog

## - 2026-09-10

This release includes breaking changes — see the **Changed** section. A major version bump is recommended.

### Added
- Select `Input` `options` prop now accepts either an array or a `Record<title, value>` object, so an option's displayed label and its submitted value can differ.
- `Input` infers `type="select"` automatically when an `options` prop is present and no `type` is otherwise specified (an explicit, conflicting `type` is never silently overridden).
- `usePagination`'s `onChangeLimit` now accepts a `<select>` change event directly, not just a raw number.
- Added a `secondary` checkbox color variant, matching `Button`'s existing variant vocabulary.
- Exposed a `--checkbox-check-color` CSS custom property so consumers can override the checkbox checkmark color without needing to match internal selector specificity.
- Exported `ResultPagination`, `ValidationErrors`, `HTTPError`, and `ValidationError` from the package's main entry point — previously referenced by other exported types but not directly importable.

### Changed
- **Breaking:** Renamed `Button`'s `style` prop to `variant`. The old name collided with React's native `style` (`CSSProperties`) prop, silently breaking native `style={{...}}` usage on `Button`. `variant` accepts `"primary" | "secondary" | "success" | "danger" | "none"` plus any custom class name.
- **Breaking:** Renamed the checkbox `confirm` style to `success`, matching `Button`'s naming.
- **Breaking:** Renamed checkbox color CSS tokens from literal hue names (`--color-blue-*`, `--color-green-*`, `--color-red-*`) to semantic, component-prefixed names (`--color-checkbox-primary-*`, `--color-checkbox-success-*`, `--color-checkbox-danger-*`). Consumers overriding these tokens directly will need to update to the new names.
- **Breaking:** Consolidated disabled and error color tokens across `Button`, `Input`, and the checkbox into one shared set (`--color-disabled-*`, `--color-error-*`, `--color-err-disabled-*`); the previously separate `--color-btn-disabled-*` tokens were removed.
- Introduced an explicit CSS cascade layer order (`theme, base, components, utilities, state`) so a consumer's own stylesheet, and inline Tailwind utility classes passed via `className`, reliably override component styles — while disabled/error states reliably win over both.

### Fixed
- **`useFetch`**
  - `UseFetchResult`'s generic type parameter wasn't threaded through to `data`'s type, so `useFetch<T>()`'s type argument had no actual effect on the returned data's type. Now correctly applied.
  - Custom headers passed as a `Headers` instance or a `[key, value][]` tuple array were silently dropped due to incorrect merging logic; now normalized correctly for all three valid `HeadersInit` shapes.
  - `data` no longer stays stale during a new request — it now clears immediately when a `refetch` starts.
  - Fixed `refetch` being recreated on every render when `initHeaders` was passed as a fresh inline object/array literal, defeating its memoization.
  - Fixed a `Content-Type` header leaking from one call into a later call that shouldn't have had it.
- **`usePagination`**
  - `onLastPage()` set `page` to `0` instead of `1` when there were no records, producing negative/invalid values elsewhere in the hook's output.
  - `page` never re-clamped back into a valid range when `total` shrank externally (e.g. a filter reducing the result count) — could display a nonsensical range like "Showing 21 to 5 of 5".
  - `onChangeLimit` reset `page` back to `1` even when the new limit was invalid and got rejected.
  - Fixed a hydration mismatch risk under SSR: `limit`'s initial value now always matches between server and client render, then upgrades from `sessionStorage` after mount.
  - A non-numeric `<select>` value passed through `onChangeLimit`'s new event-handling path could silently set `limit` to `NaN`, breaking pagination entirely; now rejected.
- **`Input`**
  - Fixed the checkbox `value` prop's type colliding with the native HTML `value` attribute's type, which made `value` effectively unassignable.
  - Fixed checkbox controlled/uncontrolled detection: previously always rendered as controlled; now stays genuinely uncontrolled unless a `hook`, `value`, or `onChange` prop is present.
  - Fixed a crash when a select's `options` prop was `null`.
- **`useInput`**
  - Fixed validators being recreated on every render, which defeated memoization for `validate`, `onChange`, and `onBlur`.
- **`Validator`**
  - `REQUIRE` now correctly fails on `NaN`, previously treated as a valid provided value.
  - Fixed a `MIN`/`MAX` switch-statement fallthrough that depended on `break` placement inside a conditional, making it fragile to future edits.
- **`HTTPError`**
  - Now defaults to a `"HTTP Error"` message when only a status code is provided, instead of an empty string.
  - Fixed a `0` status code being treated as "not provided" due to a truthy check, silently falling back to the default `500`.

## - 2026-07-30

### Added
- New `Form` element available.
- New `Button` element available.

### Fixed
- `type="select"` inputs accept `(string | number)[]` for the `options` attribute.
- `UseInputResult` defaults to `HTMLInputElement`.
- `Input` components accept React refs.

## - 2026-07-28
### Added
- Added `Input`, `useInput`, and `Validator` components.
- Added support for `type="textarea"` and `type="select"` variants to the `Input` component.
- New `checkboxStyle` prop specifically for checkbox rendering blocks.

### Fixed
- Fixed React console warnings where custom properties were leaking into standard HTML input nodes.