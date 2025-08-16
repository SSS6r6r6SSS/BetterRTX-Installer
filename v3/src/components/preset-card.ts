import { BaseComponent } from './base-component';

export interface PackInfo {
  name: string;
  uuid: string;
  stub: string;
  tonemapping: string;
  bloom: string;
}

export class PresetCard extends BaseComponent {
  private preset: PackInfo;
  private isSelected: boolean = false;
  
  static get observedAttributes() {
    return ['selected'];
  }
  
  constructor() {
    super();
  }
  
  set data(preset: PackInfo) {
    this.preset = preset;
    this.render();
  }
  
  get selected() {
    return this.isSelected;
  }
  
  set selected(value: boolean) {
    this.isSelected = value;
    if (value) {
      this.setAttribute('selected', '');
    } else {
      this.removeAttribute('selected');
    }
    this.render();
  }
  
  protected render() {
    if (!this.preset) return;
    
    this.shadow.innerHTML = `
      <style>
        @import '/src/styles.css';
        :host {
          display: block;
        }
        .preset-card {
          background: var(--app-panel);
          border: 1px solid var(--app-border);
          border-radius: 0.5rem;
          padding: 1rem;
          transition: all 0.2s;
          cursor: pointer;
        }
        .preset-card:hover {
          border-color: var(--brand-accent-500);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .preset-card.selected {
          border-color: var(--brand-accent-600);
          background: color-mix(in oklab, var(--brand-accent-600) 5%, var(--app-panel));
        }
        .preset-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .preset-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
        }
        .preset-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--app-fg);
        }
        .install-preset-btn {
          width: 100%;
          padding: 0.5rem 1rem;
          background: var(--brand-accent-600);
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .install-preset-btn:hover {
          background: var(--brand-accent-700);
        }
        .install-preset-btn:active {
          transform: scale(0.98);
        }
      </style>
      <div class="preset-card ${this.isSelected ? 'selected' : ''}" data-uuid="${this.preset.uuid}">
        <div class="preset-header">
          <img class="preset-icon" 
               src="https://cdn.jsdelivr.net/gh/BetterRTX/presets@main/data/${this.preset.uuid}/icon.png" 
               alt="${this.preset.name} icon"
               onerror="this.style.display='none'">
          <h3>${this.preset.name}</h3>
        </div>
        <button class="install-preset-btn button button--primary" data-uuid="${this.preset.uuid}">Install</button>
      </div>
    `;
  }
  
  protected attachEventListeners() {
    const card = this.shadow.querySelector('.preset-card');
    const installBtn = this.shadow.querySelector('.install-preset-btn');
    
    card?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('install-preset-btn')) return;
      
      this.isSelected = !this.isSelected;
      this.emit('selection-changed', {
        uuid: this.preset.uuid,
        selected: this.isSelected
      });
    });
    
    installBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.emit('install-preset', { uuid: this.preset.uuid });
    });
  }
  
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'selected') {
      this.isSelected = newValue !== null;
      this.render();
    }
  }
}

customElements.define('preset-card', PresetCard);
