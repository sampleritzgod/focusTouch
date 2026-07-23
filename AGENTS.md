# AGENTS.md

## Cursor Cloud specific instructions

### Repository state

This repository currently contains **only a product specification** and **no application code**:

- `docs/product.md` — the FocusTouch product spec (vision, personas, features, requirements).

There is **no dependency manifest** (no `package.json`, `requirements.txt`, `go.mod`, etc.), **no build system**, **no source code**, and **no `.cursor/environment.json`**. As a result:

- There is nothing to install, lint, test, build, or run yet.
- The update script is intentionally a no-op until real code and a dependency manifest are added.

### When application code is added

The product spec (`docs/product.md`) describes a web-first productivity app (calendar, todos, reminders, notes, sticky notes, Pomodoro, notifications, sync). When code lands:

- Update the Cloud update script (via the environment setup flow) to install dependencies for the chosen stack (e.g. `npm ci` / `pnpm install` for a JS/TS app, `pip install -r requirements.txt` / `uv sync` for Python), matching whatever lockfile is committed.
- Add lint/test/build/run notes here, or point to the relevant `package.json` scripts / `Makefile` targets once they exist.

### Available toolchain on the VM

`node` (v22), `npm`, `python3` (3.12), and `go` (1.22) are preinstalled, so most common stacks can be bootstrapped without extra system dependencies.
