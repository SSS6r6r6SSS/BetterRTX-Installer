import { BaseComponent } from './base-component';
import { createIcons, Settings, HelpCircle, RefreshCw, RefreshCcw, Trash2, Info } from 'lucide';

export class ToolbarSection extends BaseComponent {
  constructor() {
    super();
  }
  
  protected render() {
    this.shadow.innerHTML = `
      <style>
        @import '/src/styles.css';
        :host {
          display: block;
        }
        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--app-panel);
          border: 1px solid var(--app-border);
          border-radius: 0.5rem;
        }
        .toolbar-left {
          display: flex;
          gap: 0.5rem;
        }
        .toolbar-right {
          display: flex;
          gap: 0.5rem;
        }
        .toolbar-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--app-bg);
          border: 1px solid var(--app-border);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toolbar-btn:hover {
          background: var(--app-border);
        }
        .toolbar-btn:active {
          transform: scale(0.98);
        }
        .toolbar-btn[data-lucide] {
          padding: 0.5rem;
        }
      </style>
      <div class="toolbar">
        <div class="toolbar-left">
          <button class="toolbar-btn" id="settings-btn" title="Settings">
            <span data-lucide="settings"></span>
          </button>
          <button class="toolbar-btn" id="help-btn" title="Help">
            <span data-lucide="help-circle"></span>
          </button>
        </div>
        <div class="toolbar-right">
          <button class="toolbar-btn" id="refresh-btn">
            <span data-lucide="refresh-cw"></span>
            <span>Refresh</span>
          </button>
          <button class="toolbar-btn" id="force-refresh-btn">
            <span data-lucide="refresh-ccw"></span>
            <span>Force Refresh</span>
          </button>
          <button class="toolbar-btn" id="clear-cache-btn">
            <span data-lucide="trash-2"></span>
            <span>Clear Cache</span>
          </button>
          <button class="toolbar-btn" id="about-btn">
            <span data-lucide="info"></span>
            <span>About</span>
          </button>
        </div>
      </div>
    `;
    
    // Initialize Lucide icons
    this.initializeIcons();
  }
  
  protected attachEventListeners() {
    const buttons = {
      'settings-btn': 'settings-clicked',
      'help-btn': 'help-clicked',
      'refresh-btn': 'refresh-clicked',
      'force-refresh-btn': 'force-refresh-clicked',
      'clear-cache-btn': 'clear-cache-clicked',
      'about-btn': 'about-clicked'
    };
    
    Object.entries(buttons).forEach(([id, event]) => {
      const btn = this.shadow.getElementById(id);
      btn?.addEventListener('click', () => this.emit(event));
    });
  }
  
  private initializeIcons() {
    createIcons({
      icons: {
        Settings,
        HelpCircle,
        RefreshCw,
        RefreshCcw,
        Trash2,
        Info
      },
      attrs: {
        'stroke-width': 2,
        'width': 16,
        'height': 16
      }
    });
  }
}

customElements.define('toolbar-section', ToolbarSection);
