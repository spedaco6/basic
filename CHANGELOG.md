# Changelog

## - 2026-07-30

### Fixed
- `type="select"` inputs accept (string | number)[] for options attr.
- `UseInputResult` defaults to `HTMLInputElement`.
- `Input` components accept React refs.

## Added
- New `Button` elements available.

## - 2026-07-28
### Added
- Added support for `type="textarea"` and `type="select"` variants to the `Input` component.
- New `checkboxStyle` prop specifically for checkbox rendering blocks.

### Fixed
- Fixed React console warnings where custom properties were leaking into standard HTML input nodes.

### Added
- Added `Input`, `useInput` and `Validator` components.