import { SceneManager } from './scene/SceneManager.js';
import { UIManager } from './ui/UIManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');

  let uiManager;

  const sceneManager = new SceneManager(container, (modelStats) => {
    if (uiManager) {
      uiManager.updateModelStats(modelStats);
    }
  });

  uiManager = new UIManager(sceneManager);
});
