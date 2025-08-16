import { createElement } from 'lucide';

// Icon mappings
export const icons = {
  // Navigation & UI
  settings: 'settings',
  help: 'help-circle',
  close: 'x',
  menu: 'menu',
  chevronDown: 'chevron-down',
  chevronUp: 'chevron-up',
  
  // Actions
  refresh: 'refresh-cw',
  forceRefresh: 'refresh-ccw',
  trash: 'trash-2',
  info: 'info',
  download: 'download',
  upload: 'upload',
  save: 'save',
  folder: 'folder',
  file: 'file',
  package: 'package',
  
  // Status
  check: 'check',
  x: 'x-circle',
  alert: 'alert-triangle',
  
  // Tools
  wrench: 'wrench',
  shield: 'shield',
  database: 'database',
  terminal: 'terminal',
  
  // Gaming
  gamepad: 'gamepad-2',
  monitor: 'monitor',
  cpu: 'cpu',
  
  // File operations
  fileText: 'file-text',
  filePlus: 'file-plus',
  archive: 'archive',
  hardDrive: 'hard-drive',
  
  // System
  power: 'power',
  link: 'link',
  externalLink: 'external-link',
  search: 'search',
  zap: 'zap',
  layers: 'layers'
};

/**
 * Create a Lucide icon element
 * @param name - The name of the icon from the icons mapping
 * @param options - Optional configuration for the icon
 * @returns SVG string for the icon
 */
export function createIcon(name: keyof typeof icons, options: { 
  size?: number, 
  class?: string,
  strokeWidth?: number 
} = {}): string {
  const iconName = icons[name];
  const size = options.size || 16;
  const className = options.class || 'icon';
  const strokeWidth = options.strokeWidth || 2;
  
  const icon = createElement({
    name: iconName,
    size,
    strokeWidth,
    class: className
  });
  
  return icon;
}

/**
 * Replace an element's content with a Lucide icon
 * @param element - The DOM element to replace content in
 * @param iconName - The name of the icon from the icons mapping
 * @param options - Optional configuration for the icon
 */
export function replaceWithIcon(
  element: HTMLElement, 
  iconName: keyof typeof icons, 
  options: { size?: number, strokeWidth?: number } = {}
): void {
  const icon = createIcon(iconName, { 
    ...options, 
    class: element.className || 'icon' 
  });
  element.innerHTML = icon;
}

/**
 * Initialize all icons in the document
 */
export function initializeIcons(): void {
  // Settings and help buttons
  const settingsBtn = document.querySelector('#settings-btn .icon');
  if (settingsBtn) replaceWithIcon(settingsBtn as HTMLElement, 'settings');
  
  const helpBtn = document.querySelector('#help-btn .icon');
  if (helpBtn) replaceWithIcon(helpBtn as HTMLElement, 'help');
  
  // Toolbar buttons
  const refreshBtns = document.querySelectorAll('.btn-icon');
  refreshBtns.forEach((btn) => {
    const text = btn.textContent?.trim();
    const element = btn as HTMLElement;
    
    switch(text) {
      case '⟳':
        replaceWithIcon(element, 'refresh');
        break;
      case '🔄':
        replaceWithIcon(element, 'forceRefresh');
        break;
      case '🗑':
        replaceWithIcon(element, 'trash');
        break;
      case 'ℹ':
        replaceWithIcon(element, 'info');
        break;
      case '⚙':
        replaceWithIcon(element, 'settings');
        break;
    }
  });
  
  // Console arrows
  const consoleArrow = document.getElementById('console-arrow');
  if (consoleArrow) {
    const isExpanded = consoleArrow.textContent === '▲';
    replaceWithIcon(consoleArrow, isExpanded ? 'chevronUp' : 'chevronDown');
  }
}

/**
 * Get icon HTML string for embedding
 */
export function getIconHtml(name: keyof typeof icons, size = 16): string {
  return createIcon(name, { size });
}
