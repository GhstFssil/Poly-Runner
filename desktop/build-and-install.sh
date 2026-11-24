#!/usr/bin/env bash
# Poly Runner: builds the AppImage from this folder and puts launchers on your Desktop.
# Run it from a terminal:   bash build-and-install.sh      (or right-click > Run as a Program)
set -e
cd "$(dirname "$(readlink -f "$0")")"

say() { printf '\n== %s\n' "$1"; }
need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing '$1'. $2"; exit 1; }; }
need node "Install Node.js first:  sudo apt install nodejs npm   (or use nvm)"
need npm  "Install npm first:      sudo apt install npm"

say "Installing build tools (first time takes a few minutes)"
npm install

say "Building the AppImage"
npm run dist

APPIMG="$(ls -t dist/*.AppImage 2>/dev/null | head -n1)"
[ -n "$APPIMG" ] || { echo "The build finished but no AppImage turned up in dist/."; exit 1; }

say "Installing to ~/PolyRunner"
mkdir -p "$HOME/PolyRunner"
cp -f "$APPIMG" "$HOME/PolyRunner/PolyRunner.AppImage"
cp -f icon.png "$HOME/PolyRunner/icon.png"
chmod +x "$HOME/PolyRunner/PolyRunner.AppImage"

# AppImages need FUSE 2; without it they have to unpack themselves each time.
FLAGS="--no-sandbox"
if ! ldconfig -p 2>/dev/null | grep -q 'libfuse\.so\.2'; then FLAGS="--appimage-extract-and-run --no-sandbox"; echo "(FUSE 2 not found, so the launcher will use --appimage-extract-and-run)"; fi

# the run command, as a script you can double-click or run from a terminal
cat > "$HOME/PolyRunner/run-polyrunner.sh" <<RUN
#!/usr/bin/env bash
exec "\$HOME/PolyRunner/PolyRunner.AppImage" $FLAGS "\$@"
RUN
chmod +x "$HOME/PolyRunner/run-polyrunner.sh"

DESK="$(xdg-user-dir DESKTOP 2>/dev/null || true)"; [ -d "$DESK" ] || DESK="$HOME/Desktop"; mkdir -p "$DESK"

say "Putting launchers on $DESK"
cat > "$DESK/PolyRunner.desktop" <<DT
[Desktop Entry]
Type=Application
Name=Poly Runner
Comment=A 3D platformer starring Molly
Exec=$HOME/PolyRunner/PolyRunner.AppImage $FLAGS
Icon=$HOME/PolyRunner/icon.png
Terminal=false
Categories=Game;
DT
chmod +x "$DESK/PolyRunner.desktop"
gio set "$DESK/PolyRunner.desktop" metadata::trusted true 2>/dev/null || true   # lets GNOME run it without "Allow Launching"
cp -f "$HOME/PolyRunner/run-polyrunner.sh" "$DESK/Run Poly Runner.sh"
chmod +x "$DESK/Run Poly Runner.sh"

say "Done"
echo "Double-click 'Poly Runner' on your Desktop. If it only opens as text, right-click it and choose 'Allow Launching'."
echo "Or run it from a terminal:  $HOME/PolyRunner/run-polyrunner.sh"
