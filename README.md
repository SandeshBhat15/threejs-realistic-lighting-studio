# 🎬 Three.js Realistic Lighting & Mobile Studio

An ultra-modern, production-ready WebGL 3D Studio application built with **Three.js**, **Vite**, and **Vanilla JavaScript**. Designed for 3D artists, WebGL developers, and product designers to inspect 3D models under realistic studio lighting rigs, test HDRI environments, analyze draw calls, and optimize for mobile hardware.

---

## ⚡ One-Click Automated Setup

### 🪟 Windows Users (One-Click)
1. Download or clone this repository.
2. Double-click **`setup.bat`**.
3. *All dependencies will be installed automatically, and the Studio will launch in your browser!*

### 🍎 Mac / Linux Users (One-Click)
1. Open terminal in the project directory.
2. Run:
   ```bash
   chmod +x setup.sh && ./setup.sh
   ```

### 💻 Manual Command Line Setup
```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/threejs-realistic-lighting-studio.git
cd threejs-realistic-lighting-studio

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## ✨ Features Breakdown

### 💡 Realistic Studio Lighting Rig
- **Key Light**: Main directional sun with soft shadows (`PCFSoftShadowMap`), shadow map resolution (2048x2048), bias, and shadow radius.
- **Fill Light**: Secondary soft light for shadow filling.
- **Rim Light**: Back light to highlight 3D object silhouettes.
- **RectAreaLight Softboxes**: Dual physical studio area lights for specular reflections.
- **Kelvin Color Temperature**: Sliders ($2000\text{K}$ to $10,000\text{K}$) for realistic tungsten / daylight tones.
- **3D Transform Gizmos**: Move Key, Fill, or Rim lights interactively in the 3D viewport (`TransformControls`).

### ☁️ HDRI & Environment Setup
- **Procedural PBR Room Environment**: Instant high-quality reflections via `PMREMGenerator`.
- **Background Modes**: Solid Color, Dynamic Vertical Gradient, HDRI Equirectangular, or Transparent.
- **Environment Controls**: Blur, Intensity, and $0-360^\circ$ Environment Map Rotation.

### 📦 3D Model Importer & Mesh Inspector
- **Supported Formats**: Drag & drop or file upload `.GLB`, `.GLTF`, `.OBJ`, `.FBX`, `.STL`.
- **Sub-Mesh Hierarchy Tree**: Inspect sub-mesh nodes and toggle individual mesh visibility.
- **Material View Modes**: Original materials, Clay Studio Mode, Wireframe, and Normals Mode.
- **Custom PBR Overrides**: Roughness and Metalness sliders.

### 📱 Draw Calls & Mobile Device Analytics
- **Real-time Draw Call Ticker**: Live WebGL draw call counter (`renderer.info.render.calls`).
- **Pass Breakdown Table**: Displays draw calls split between *Shadow Pass* and *Scene Geometry Pass*.
- **Mobile Compatibility Rating (Grade A+ / B / C)**: Automatically rates scene load against mobile hardware GPU limits.
- **1-Click Mobile Saver Mode**: Caps DPR to 1.0, reduces shadow map memory, and turns off bloom pass for $60\text{ FPS}$ on mobile phones.
- **GPU Hardware Diagnostics**: Detects Unmasked WebGL GPU Renderer (Apple M-series, NVIDIA, Adreno), WebGL version, and Max Texture Size.

### 🎥 Viewport View Cube HUD & Camera
- **View Cube HUD**: One-click camera alignment (**Perspective**, **Front**, **Top**, **Side**, **Isometric**).
- **Perspective vs. Orthographic Camera**: Toggle 2D orthographic CAD mode.
- **FOV Slider**: Adjustable Field of View angle ($15^\circ$ to $100^\circ$).

---

## 🚀 How to Publish to GitHub

To push this repository to your personal GitHub account:

```bash
# 1. Initialize Git repository
git init

# 2. Stage files & commit
git add .
git commit -m "Initial commit - Three.js Realistic Lighting & Mobile Studio"

# 3. Create a repository on GitHub, then link remote:
git remote add origin https://github.com/YOUR_USERNAME/threejs-realistic-lighting-studio.git

# 4. Set main branch and push
git branch -M main
git push -u origin main
```

---

## 🛠️ Tech Stack
- **Engine**: Three.js (r170+)
- **Addons**: `three-stdlib` (OrbitControls, TransformControls, GLTFLoader, OBJLoader, FBXLoader, STLLoader, EffectComposer, UnrealBloomPass)
- **Build Tool**: Vite 6+
- **Styling**: Vanilla CSS (Glassmorphism Dark Theme, Outfit & JetBrains Mono Fonts)

---

## 📄 License
ISC License - Open source for personal and commercial 3D projects.
