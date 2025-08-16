import { BaseComponent } from './base-component';

export interface Installation {
  FriendlyName: string;
  InstallLocation: string;
  Preview: boolean;
  installed_preset?: {
    uuid: string;
    name: string;
    installed_at: string;
  };
}

export class InstallationCard extends BaseComponent {
  private installation: Installation | null = null;
  private isSelected: boolean = false;
  
  static get observedAttributes() {
    return ['selected'];
  }
  
  constructor() {
    super();
  }
  
  set data(installation: Installation) {
    this.installation = installation;
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
    if (!this.installation) return;
    
    const presetIcon = this.installation.installed_preset 
      ? `<img src="https://cdn.jsdelivr.net/gh/BetterRTX/BetterRTX-Packs@main/packs/${this.installation.installed_preset.uuid}/icon.png" 
             class="preset-icon" alt="${this.installation.installed_preset.name}" 
             title="Installed: ${this.installation.installed_preset.name}" 
             onerror="this.style.display='none'">`
      : '';
    
    const checkboxId = `install-${this.installation.InstallLocation.replace(/[^a-zA-Z0-9]/g, '')}`;
    
    this.shadow.innerHTML = `
      <style>
        @import '/src/styles.css';
        :host {
          display: block;
        }
        .installation-card {
          background: var(--app-panel);
          border: 1px solid var(--app-border);
          border-radius: 0.5rem;
          padding: 1rem;
          transition: all 0.2s;
        }
        .installation-card.selected {
          border-color: var(--brand-accent-600);
          background: color-mix(in oklab, var(--brand-accent-600) 5%, var(--app-panel));
        }
        .installation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .installation-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .installation-title h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }
        .preset-icon {
          width: 24px;
          height: 24px;
          border-radius: 4px;
        }
        .preview-badge {
          background: var(--brand-accent-600);
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .installation-path {
          font-size: 0.875rem;
          color: var(--app-fg-muted);
          margin: 0.25rem 0;
          word-break: break-all;
        }
        .installed-preset-info {
          font-size: 0.875rem;
          color: var(--success-600);
          margin: 0.5rem 0;
        }
        .no-preset-info {
          font-size: 0.875rem;
          color: var(--app-fg-muted);
          margin: 0.5rem 0;
        }
        .installation-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .installation-checkbox {
          width: 1rem;
          height: 1rem;
        }
        .checkbox-label {
          font-size: 0.875rem;
          cursor: pointer;
          user-select: none;
        }
      </style>
      <div class="installation-card ${this.isSelected ? 'selected' : ''}" data-path="${this.installation.InstallLocation}">
        <div class="installation-header">
          <div class="installation-title">
            ${presetIcon}
            <h3>${this.installation.FriendlyName}</h3>
          </div>
          ${this.installation.Preview ? '<span class="preview-badge">Preview</span>' : ''}
        </div>
        <p class="installation-path">${this.installation.InstallLocation}</p>
        ${this.installation.installed_preset ? 
          `<p class="installed-preset-info">Current preset: ${this.installation.installed_preset.name}</p>` : 
          '<p class="no-preset-info">No preset installed</p>'
        }
        <div class="installation-actions">
          <input type="checkbox" id="${checkboxId}" 
                 class="installation-checkbox" 
                 value="${this.installation.InstallLocation}" 
                 ${this.isSelected ? 'checked' : ''}>
          <label for="${checkboxId}" class="checkbox-label">
            Select for installation
          </label>
        </div>
      </div>
    `;
  }
  
  protected attachEventListeners() {
    const checkbox = this.shadow.querySelector('.installation-checkbox');
    checkbox?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.isSelected = target.checked;
      if (this.installation) {
        this.emit('selection-changed', {
          path: this.installation.InstallLocation,
          selected: this.isSelected
        });
      }
    });
  }
  
  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === 'selected') {
      this.isSelected = newValue !== null;
      this.render();
    }
  }
}

customElements.define('installation-card', InstallationCard);
