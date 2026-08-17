import { PRESETS } from '../scene/Presets.js';

export class UIManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.lighting = sceneManager.lighting;
    this.environment = sceneManager.environment;
    this.ground = sceneManager.ground;
    this.postProcessing = sceneManager.postProcessing;
    this.modelLoader = sceneManager.modelLoader;

    this.currentModelInfo = { name: 'Torus Knot', instanceCount: 1, polyCount: 8192, vertexCount: 4224, subMeshes: [] };

    this.initTabNavigation();
    this.initViewCubeHUD();
    this.initCameraControls();
    this.initFileUploader();
    this.initSampleModels();
    this.initMaterialModes();
    this.initInstancingControls();
    this.initLightingControls();
    this.initEnvironmentControls();
    this.initGroundControls();
    this.initPostFXControls();
    this.initMobileAnalytics();
    this.initPresetsList();
    this.initToolbar();

    this.syncUIWithCurrentState();
    this.startPerformanceTicker();
    this.renderGPUDiagnostics();
  }

  initTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
      });
    });
  }

  initViewCubeHUD() {
    const hudBtns = document.querySelectorAll('.hud-btn');
    hudBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        hudBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.getAttribute('data-view');
        this.sceneManager.setCameraView(view);
      });
    });
  }

  initCameraControls() {
    const btnPersp = document.getElementById('btn-proj-persp');
    const btnOrtho = document.getElementById('btn-proj-ortho');

    btnPersp.addEventListener('click', () => {
      btnPersp.classList.add('active');
      btnOrtho.classList.remove('active');
      this.sceneManager.setCameraProjection(false);
    });

    btnOrtho.addEventListener('click', () => {
      btnOrtho.classList.add('active');
      btnPersp.classList.remove('active');
      this.sceneManager.setCameraProjection(true);
    });

    const inputFov = document.getElementById('input-camera-fov');
    const valFov = document.getElementById('val-camera-fov');
    inputFov.addEventListener('input', (e) => {
      const v = parseInt(e.target.value);
      valFov.textContent = `${v}°`;
      this.sceneManager.setCameraFOV(v);
    });
  }

  initFileUploader() {
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('btn-upload-file');
    const dragOverlay = document.getElementById('drag-overlay');

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.modelLoader.loadFromFile(e.target.files[0]);
      }
    });

    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      dragOverlay.classList.add('active');
    });

    dragOverlay.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragOverlay.classList.remove('active');
    });

    dragOverlay.addEventListener('drop', (e) => {
      e.preventDefault();
      dragOverlay.classList.remove('active');
      if (e.dataTransfer.files.length > 0) {
        this.modelLoader.loadFromFile(e.dataTransfer.files[0]);
      }
    });
  }

  initSampleModels() {
    const sampleBtns = document.querySelectorAll('.sample-btn');
    sampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sampleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sampleType = btn.getAttribute('data-sample');
        this.modelLoader.loadSampleModel(sampleType);
      });
    });
  }

  initInstancingControls() {
    const inputCount = document.getElementById('input-instance-count');
    const valCount = document.getElementById('val-instance-count');
    const presetBtns = document.querySelectorAll('.inst-preset-btn');

    const updateCount = (cnt) => {
      cnt = Math.max(1, Math.min(100, cnt));
      inputCount.value = cnt;
      valCount.textContent = `${cnt} Cop${cnt > 1 ? 'ies' : 'y'}`;
      this.modelLoader.setInstanceCount(cnt);
      presetBtns.forEach(b => {
        b.classList.toggle('active', parseInt(b.getAttribute('data-count')) === cnt);
      });
    };

    inputCount.addEventListener('input', (e) => updateCount(parseInt(e.target.value)));

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        updateCount(parseInt(btn.getAttribute('data-count')));
      });
    });

    const inputSpacing = document.getElementById('input-instance-spacing');
    const valSpacing = document.getElementById('val-instance-spacing');

    inputSpacing.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valSpacing.textContent = `${v.toFixed(1)}m`;
      this.modelLoader.setInstanceSpacing(v);
    });

    // Animation Controls
    const btnPlay = document.getElementById('btn-anim-play');
    btnPlay.addEventListener('click', () => {
      this.modelLoader.toggleAnimationPlay();
      btnPlay.classList.toggle('active', this.modelLoader.isPlayingAnimation);
    });

    const selectClip = document.getElementById('select-anim-clip');
    selectClip.addEventListener('change', (e) => {
      this.modelLoader.setAnimationClip(parseInt(e.target.value));
    });

    const animModeBtns = document.querySelectorAll('.anim-mode-btn');
    animModeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        animModeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');
        this.modelLoader.setAnimationMode(mode);
      });
    });

    const inputSpeed = document.getElementById('input-anim-speed');
    const valSpeed = document.getElementById('val-anim-speed');
    inputSpeed.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valSpeed.textContent = `${v.toFixed(1)}x`;
      this.modelLoader.setAnimationSpeed(v);
    });
  }

  renderMeshTree(subMeshes) {
    const container = document.getElementById('mesh-tree-container');
    container.innerHTML = '';

    if (!subMeshes || subMeshes.length === 0) {
      container.innerHTML = '<span class="label" style="padding: 8px;">Single mesh model</span>';
      return;
    }

    subMeshes.forEach(node => {
      const row = document.createElement('div');
      row.className = 'mesh-tree-node';
      row.innerHTML = `
        <div class="mesh-node-info">
          <span class="mesh-node-name">${node.name}</span>
          <span class="mesh-node-tris">${node.triangles.toLocaleString()} tris</span>
        </div>
        <button class="mesh-eye-btn ${node.visible ? '' : 'hidden'}" data-node="${node.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      `;

      const eyeBtn = row.querySelector('.mesh-eye-btn');
      eyeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        node.visible = !node.visible;
        eyeBtn.classList.toggle('hidden', !node.visible);
        this.modelLoader.toggleSubMeshVisibility(node.id, node.visible);
      });

      container.appendChild(row);
    });
  }

  initMaterialModes() {
    const matBtns = document.querySelectorAll('.mat-mode-btn');
    matBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        matBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');
        this.modelLoader.setMaterialMode(mode);
      });
    });

    const roughInput = document.getElementById('input-mat-roughness');
    const roughVal = document.getElementById('val-mat-roughness');
    const metalInput = document.getElementById('input-mat-metalness');

    roughInput.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      roughVal.textContent = v.toFixed(2);
      this.modelLoader.updateCustomPBR(v, parseFloat(metalInput.value));
    });

    metalInput.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      document.getElementById('val-mat-metalness').textContent = v.toFixed(2);
      this.modelLoader.updateCustomPBR(parseFloat(roughInput.value), v);
    });
  }

  initLightingControls() {
    const checkKey = document.getElementById('check-key-light');
    const colorKey = document.getElementById('color-key-light');
    const inputKeyKelvin = document.getElementById('input-key-kelvin');
    const valKeyKelvin = document.getElementById('val-key-kelvin');
    const inputKeyInt = document.getElementById('input-key-intensity');
    const valKeyInt = document.getElementById('val-key-intensity');

    checkKey.addEventListener('change', (e) => {
      this.lighting.keyLight.visible = e.target.checked;
      this.lighting.updateHelpers();
    });
    colorKey.addEventListener('input', (e) => {
      this.lighting.keyLight.color.set(e.target.value);
    });
    inputKeyKelvin.addEventListener('input', (e) => {
      const k = parseInt(e.target.value);
      valKeyKelvin.textContent = `${k}K`;
      this.lighting.setLightKelvin('key', k);
      colorKey.value = `#${this.lighting.keyLight.color.getHexString()}`;
    });
    inputKeyInt.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valKeyInt.textContent = v.toFixed(1);
      this.lighting.keyLight.intensity = v;
    });

    const checkFill = document.getElementById('check-fill-light');
    const colorFill = document.getElementById('color-fill-light');
    const inputFillKelvin = document.getElementById('input-fill-kelvin');
    const valFillKelvin = document.getElementById('val-fill-kelvin');
    const inputFillInt = document.getElementById('input-fill-intensity');
    const valFillInt = document.getElementById('val-fill-intensity');

    checkFill.addEventListener('change', (e) => {
      this.lighting.fillLight.visible = e.target.checked;
      this.lighting.updateHelpers();
    });
    colorFill.addEventListener('input', (e) => {
      this.lighting.fillLight.color.set(e.target.value);
    });
    inputFillKelvin.addEventListener('input', (e) => {
      const k = parseInt(e.target.value);
      valFillKelvin.textContent = `${k}K`;
      this.lighting.setLightKelvin('fill', k);
      colorFill.value = `#${this.lighting.fillLight.color.getHexString()}`;
    });
    inputFillInt.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valFillInt.textContent = v.toFixed(1);
      this.lighting.fillLight.intensity = v;
    });

    const checkRim = document.getElementById('check-rim-light');
    const colorRim = document.getElementById('color-rim-light');
    const inputRimInt = document.getElementById('input-rim-intensity');
    const valRimInt = document.getElementById('val-rim-intensity');

    checkRim.addEventListener('change', (e) => {
      this.lighting.rimLight.visible = e.target.checked;
      this.lighting.updateHelpers();
    });
    colorRim.addEventListener('input', (e) => {
      this.lighting.rimLight.color.set(e.target.value);
    });
    inputRimInt.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valRimInt.textContent = v.toFixed(1);
      this.lighting.rimLight.intensity = v;
    });

    const colorAmbient = document.getElementById('color-ambient-light');
    const inputAmbientInt = document.getElementById('input-ambient-intensity');
    const valAmbientInt = document.getElementById('val-ambient-intensity');

    colorAmbient.addEventListener('input', (e) => {
      this.lighting.ambientLight.color.set(e.target.value);
    });
    inputAmbientInt.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valAmbientInt.textContent = v.toFixed(2);
      this.lighting.ambientLight.intensity = v;
    });
  }

  initEnvironmentControls() {
    const bgBtns = document.querySelectorAll('.bg-mode-btn');
    bgBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        bgBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-bg');
        this.environment.setBgType(mode);
      });
    });

    const colorBg = document.getElementById('color-bg');
    colorBg.addEventListener('input', (e) => {
      this.environment.setBgColor(e.target.value);
    });

    const inputEnvInt = document.getElementById('input-env-intensity');
    const valEnvInt = document.getElementById('val-env-intensity');
    inputEnvInt.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valEnvInt.textContent = v.toFixed(1);
      this.environment.setIntensity(v);
    });

    const inputEnvBlur = document.getElementById('input-env-blur');
    const valEnvBlur = document.getElementById('val-env-blur');
    inputEnvBlur.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valEnvBlur.textContent = v.toFixed(2);
      this.environment.setBlurriness(v);
    });

    const inputEnvRot = document.getElementById('input-env-rotation');
    const valEnvRot = document.getElementById('val-env-rotation');
    inputEnvRot.addEventListener('input', (e) => {
      const v = parseInt(e.target.value);
      valEnvRot.textContent = `${v}°`;
      this.environment.setRotation(v);
    });
  }

  initGroundControls() {
    const checkShadow = document.getElementById('check-shadow-catcher');
    const inputShadowOp = document.getElementById('input-shadow-opacity');
    const valShadowOp = document.getElementById('val-shadow-opacity');

    checkShadow.addEventListener('change', (e) => {
      this.ground.setShowShadowCatcher(e.target.checked);
    });
    inputShadowOp.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valShadowOp.textContent = v.toFixed(2);
      this.ground.setShadowOpacity(v);
    });

    const checkFloor = document.getElementById('check-floor');
    const colorFloor = document.getElementById('color-floor');
    const inputRough = document.getElementById('input-floor-roughness');
    const valRough = document.getElementById('val-floor-roughness');
    const inputMetal = document.getElementById('input-floor-metalness');
    const valMetal = document.getElementById('val-floor-metalness');

    checkFloor.addEventListener('change', (e) => {
      this.ground.setShowFloor(e.target.checked);
    });
    colorFloor.addEventListener('input', (e) => {
      this.ground.setFloorColor(e.target.value);
    });
    inputRough.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valRough.textContent = v.toFixed(2);
      this.ground.setFloorRoughness(v);
    });
    inputMetal.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valMetal.textContent = v.toFixed(2);
      this.ground.setFloorMetalness(v);
    });

    const checkGrid = document.getElementById('check-grid');
    checkGrid.addEventListener('change', (e) => {
      this.ground.setShowGrid(e.target.checked);
    });
  }

  initPostFXControls() {
    const selectTone = document.getElementById('select-tonemapping');
    const inputExposure = document.getElementById('input-exposure');
    const valExposure = document.getElementById('val-exposure');

    selectTone.addEventListener('change', (e) => {
      this.postProcessing.setToneMapping(e.target.value);
    });
    inputExposure.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valExposure.textContent = v.toFixed(2);
      this.postProcessing.setExposure(v);
    });

    const checkBloom = document.getElementById('check-bloom');
    const inputThresh = document.getElementById('input-bloom-threshold');
    const valThresh = document.getElementById('val-bloom-threshold');
    const inputStrength = document.getElementById('input-bloom-strength');
    const valStrength = document.getElementById('val-bloom-strength');
    const inputRadius = document.getElementById('input-bloom-radius');
    const valRadius = document.getElementById('val-bloom-radius');

    checkBloom.addEventListener('change', (e) => {
      this.postProcessing.setBloomEnabled(e.target.checked);
    });
    inputThresh.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valThresh.textContent = v.toFixed(2);
      this.postProcessing.setBloomThreshold(v);
    });
    inputStrength.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valStrength.textContent = v.toFixed(2);
      this.postProcessing.setBloomStrength(v);
    });
    inputRadius.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      valRadius.textContent = v.toFixed(2);
      this.postProcessing.setBloomRadius(v);
    });
  }

  initMobileAnalytics() {
    const checkMobile = document.getElementById('check-mobile-preset');
    const btnMobileToggle = document.getElementById('btn-toggle-mobile-mode');
    const txtMobileStatus = document.getElementById('txt-mobile-status');

    const toggleMobileMode = (enabled) => {
      checkMobile.checked = enabled;
      btnMobileToggle.classList.toggle('active', enabled);
      txtMobileStatus.textContent = enabled ? 'ON' : 'OFF';
      this.sceneManager.setMobileOptimizationMode(enabled);
    };

    checkMobile.addEventListener('change', (e) => toggleMobileMode(e.target.checked));
    btnMobileToggle.addEventListener('click', () => toggleMobileMode(!this.sceneManager.mobileMode));
  }

  initPresetsList() {
    const container = document.getElementById('presets-container');
    container.innerHTML = '';

    Object.keys(PRESETS).forEach(key => {
      const p = PRESETS[key];
      const card = document.createElement('div');
      card.className = `preset-card ${key === this.sceneManager.currentPresetKey ? 'active' : ''}`;
      card.setAttribute('data-preset', key);
      card.innerHTML = `
        <div class="preset-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        </div>
        <div class="preset-info">
          <h4>${p.name}</h4>
          <p>${p.description}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.sceneManager.applyPreset(key);
        this.syncUIWithCurrentState();
      });

      container.appendChild(card);
    });
  }

  initToolbar() {
    const btnSidebar = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    btnSidebar.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      btnSidebar.classList.toggle('active', sidebar.classList.contains('collapsed'));
    });

    const btnHelpers = document.getElementById('btn-toggle-helpers');
    btnHelpers.addEventListener('click', () => {
      const active = !this.lighting.showHelpers;
      this.lighting.setHelpersVisible(active);
      btnHelpers.classList.toggle('active', active);
    });

    const btnGizmoNone = document.getElementById('btn-gizmo-none');
    const btnGizmoKey = document.getElementById('btn-gizmo-key');
    const btnGizmoFill = document.getElementById('btn-gizmo-fill');
    const btnGizmoRim = document.getElementById('btn-gizmo-rim');
    const gizmoBtns = [btnGizmoNone, btnGizmoKey, btnGizmoFill, btnGizmoRim];

    gizmoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        gizmoBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn === btnGizmoKey) {
          this.sceneManager.attachTransformGizmo(this.lighting.keyLight);
        } else if (btn === btnGizmoFill) {
          this.sceneManager.attachTransformGizmo(this.lighting.fillLight);
        } else if (btn === btnGizmoRim) {
          this.sceneManager.attachTransformGizmo(this.lighting.rimLight);
        } else {
          this.sceneManager.detachTransformGizmo();
        }
      });
    });

    document.getElementById('btn-reset-cam').addEventListener('click', () => {
      this.sceneManager.resetCamera();
    });

    document.getElementById('btn-export-snapshot').addEventListener('click', () => {
      const dataUrl = this.sceneManager.exportSnapshot(2, false, 'image/png');
      const link = document.createElement('a');
      link.download = `3D-Studio-Render-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    });
  }

  renderGPUDiagnostics() {
    const hw = this.sceneManager.getHardwareDiagnostics();
    document.getElementById('gpu-renderer-name').textContent = hw.gpuRenderer;
    document.getElementById('gpu-webgl-ver').textContent = hw.webglVersion;
    document.getElementById('gpu-max-tex').textContent = hw.maxTexSize;
  }

  updateModelStats(info) {
    this.currentModelInfo = info;
    document.getElementById('status-model-name').textContent = info.name || '3D Model';
    document.getElementById('status-instance-count').textContent = `${info.instanceCount || 1}x`;

    // Populate Animation Dropdown
    const selectClip = document.getElementById('select-anim-clip');
    selectClip.innerHTML = '';

    if (info.animations && info.animations.length > 0) {
      info.animations.forEach((name, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${name} (Clip ${i})`;
        selectClip.appendChild(opt);
      });
    } else {
      const opt = document.createElement('option');
      opt.value = 0;
      opt.textContent = 'No Embedded Animations';
      selectClip.appendChild(opt);
    }

    this.renderMeshTree(info.subMeshes);
  }

  startPerformanceTicker() {
    setInterval(() => {
      const stats = this.sceneManager.getPerformanceStats();
      const instCount = this.modelLoader.instanceCount || 1;

      document.getElementById('status-draw-calls').textContent = stats.drawCalls;
      document.getElementById('status-poly-count').textContent = stats.triangles.toLocaleString();
      document.getElementById('status-instance-count').textContent = `${instCount}x`;

      const statusFps = document.getElementById('status-fps');
      statusFps.textContent = stats.fps;
      if (stats.fps >= 50) statusFps.style.color = '#10b981';
      else if (stats.fps >= 30) statusFps.style.color = '#f59e0b';
      else statusFps.style.color = '#ef4444';

      document.getElementById('metric-draw-calls').textContent = stats.drawCalls;
      document.getElementById('metric-fps').textContent = stats.fps;
      document.getElementById('metric-triangles').textContent = stats.triangles.toLocaleString();
      document.getElementById('metric-textures').textContent = stats.textures;
      document.getElementById('metric-geometries').textContent = stats.geometries;
      document.getElementById('metric-pixel-ratio').textContent = stats.pixelRatio;

      document.getElementById('pass-shadow-calls').textContent = stats.shadowPassCalls;
      document.getElementById('pass-scene-calls').textContent = stats.scenePassCalls;

      // Instancing tab readouts
      document.getElementById('readout-inst-count').textContent = `${instCount} Cop${instCount > 1 ? 'ies' : 'y'}`;
      document.getElementById('readout-draw-calls').textContent = `${stats.drawCalls} Calls`;
      const ratio = (stats.drawCalls / instCount).toFixed(1);
      document.getElementById('readout-call-ratio').textContent = `${ratio} Calls/Inst`;

      // Health rating
      const healthCard = document.querySelector('.health-card');
      const gradeEl = document.getElementById('health-grade-text');
      const titleEl = document.getElementById('health-status-title');
      const descEl = document.getElementById('health-status-desc');

      if (stats.drawCalls <= 40 && stats.triangles <= 150000 && stats.fps >= 50) {
        healthCard.className = 'health-card';
        gradeEl.className = 'health-grade grade-a';
        gradeEl.textContent = 'A+';
        titleEl.textContent = 'Mobile Ultra Ready';
        descEl.textContent = 'Draw calls and polygon count ideal for all smartphones';
      } else if (stats.drawCalls <= 100 && stats.triangles <= 350000 && stats.fps >= 30) {
        healthCard.className = 'health-card warning';
        gradeEl.className = 'health-grade grade-b';
        gradeEl.textContent = 'B';
        titleEl.textContent = 'Mid/High Mobile Compatible';
        descEl.textContent = 'Runs smoothly on iPhone 12+ and Snapdragon 8 series';
      } else {
        healthCard.className = 'health-card heavy';
        gradeEl.className = 'health-grade grade-c';
        gradeEl.textContent = 'C';
        titleEl.textContent = 'Desktop / Heavy Model';
        descEl.textContent = 'High draw calls or polygon load. Enable Mobile Saver Mode.';
      }
    }, 300);
  }

  syncUIWithCurrentState() {
    document.getElementById('check-key-light').checked = this.lighting.keyLight.visible;
    document.getElementById('color-key-light').value = `#${this.lighting.keyLight.color.getHexString()}`;
    document.getElementById('input-key-intensity').value = this.lighting.keyLight.intensity;
    document.getElementById('val-key-intensity').textContent = this.lighting.keyLight.intensity.toFixed(1);

    document.getElementById('check-fill-light').checked = this.lighting.fillLight.visible;
    document.getElementById('color-fill-light').value = `#${this.lighting.fillLight.color.getHexString()}`;
    document.getElementById('input-fill-intensity').value = this.lighting.fillLight.intensity;
    document.getElementById('val-fill-intensity').textContent = this.lighting.fillLight.intensity.toFixed(1);

    document.getElementById('check-rim-light').checked = this.lighting.rimLight.visible;
    document.getElementById('color-rim-light').value = `#${this.lighting.rimLight.color.getHexString()}`;
    document.getElementById('input-rim-intensity').value = this.lighting.rimLight.intensity;
    document.getElementById('val-rim-intensity').textContent = this.lighting.rimLight.intensity.toFixed(1);

    document.getElementById('color-ambient-light').value = `#${this.lighting.ambientLight.color.getHexString()}`;
    document.getElementById('input-ambient-intensity').value = this.lighting.ambientLight.intensity;
    document.getElementById('val-ambient-intensity').textContent = this.lighting.ambientLight.intensity.toFixed(2);

    document.getElementById('color-bg').value = this.environment.bgColor;
    document.getElementById('input-env-intensity').value = this.environment.intensity;
    document.getElementById('val-env-intensity').textContent = this.environment.intensity.toFixed(1);
    document.getElementById('input-env-blur').value = this.environment.blurriness;
    document.getElementById('val-env-blur').textContent = this.environment.blurriness.toFixed(2);
    document.getElementById('input-env-rotation').value = this.environment.rotation;
    document.getElementById('val-env-rotation').textContent = `${this.environment.rotation}°`;

    document.getElementById('check-shadow-catcher').checked = this.ground.showShadowCatcher;
    document.getElementById('input-shadow-opacity').value = this.ground.shadowOpacity;
    document.getElementById('val-shadow-opacity').textContent = this.ground.shadowOpacity.toFixed(2);
    document.getElementById('check-floor').checked = this.ground.showFloor;
    document.getElementById('color-floor').value = this.ground.floorColor;
    document.getElementById('input-floor-roughness').value = this.ground.floorRoughness;
    document.getElementById('val-floor-roughness').textContent = this.ground.floorRoughness.toFixed(2);
    document.getElementById('input-floor-metalness').value = this.ground.floorMetalness;
    document.getElementById('val-floor-metalness').textContent = this.ground.floorMetalness.toFixed(2);
    document.getElementById('check-grid').checked = this.ground.showGrid;

    document.getElementById('select-tonemapping').value = this.postProcessing.toneMappingType;
    document.getElementById('input-exposure').value = this.postProcessing.exposure;
    document.getElementById('val-exposure').textContent = this.postProcessing.exposure.toFixed(2);
    document.getElementById('check-bloom').checked = this.postProcessing.bloomEnabled;
    document.getElementById('input-bloom-threshold').value = this.postProcessing.bloomThreshold;
    document.getElementById('val-bloom-threshold').textContent = this.postProcessing.bloomThreshold.toFixed(2);
    document.getElementById('input-bloom-strength').value = this.postProcessing.bloomStrength;
    document.getElementById('val-bloom-strength').textContent = this.postProcessing.bloomStrength.toFixed(2);
    document.getElementById('input-bloom-radius').value = this.postProcessing.bloomRadius;
    document.getElementById('val-bloom-radius').textContent = this.postProcessing.bloomRadius.toFixed(2);
  }
}
