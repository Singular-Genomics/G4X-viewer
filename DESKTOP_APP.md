# Desktop Application

## Setup (macOS)

1. **Install Rust**:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, restart your terminal or run: `source "$HOME/.cargo/env"`

## Development

Run dev server:

```bash
npm run tauri:dev
```

## Build Installer

Create universal macOS `.dmg` (Intel + Apple Silicon):

```bash
npm run tauri:build
```

**Output location**: `src-tauri/target/universal-apple-darwin/release/bundle/dmg/`

Or build and copy to Desktop:

```bash
npm run tauri:build:desktop
```

**Note**: Build creates a universal binary that works on both Intel and Apple Silicon Macs.

## Configuration

Window settings and app options: [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json)
