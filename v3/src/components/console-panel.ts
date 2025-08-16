import { BaseComponent } from './base-component';
import { createIcons, ChevronDown, ChevronUp } from 'lucide';

export class ConsolePanel extends BaseComponent {
  private isExpanded: boolean = false;
  private output: string[] = [];
  
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
        .console-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--app-panel);
          border: 1px solid var(--app-border);
          border-radius: 0.5rem 0.5rem 0 0;
          cursor: pointer;
          user-select: none;
        }
        .console-header h3 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .console-arrow {
          transition: transform 0.2s;
        }
        .console-panel {
          background: var(--app-bg);
          border: 1px solid var(--app-border);
          border-top: none;
          border-radius: 0 0 0.5rem 0.5rem;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        .console-panel.collapsed {
          max-height: 0;
        }
        .console-panel.expanded {
          max-height: 300px;
        }
        .console-output {
          padding: 1rem;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.75rem;
          color: var(--app-fg-muted);
          height: 250px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .console-clear-btn {
          position: absolute;
          bottom: 0.5rem;
          right: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: var(--app-panel);
          border: 1px solid var(--app-border);
          border-radius: 0.25rem;
          font-size: 0.75rem;
          cursor: pointer;
        }
        .console-clear-btn:hover {
          background: var(--app-border);
        }
      </style>
      <div class="console-header">
        <h3>Console Output</h3>
        <span class="console-arrow" data-lucide="${this.isExpanded ? 'chevron-up' : 'chevron-down'}"></span>
      </div>
      <div class="console-panel ${this.isExpanded ? 'expanded' : 'collapsed'}">
        <div class="console-output">${this.output.join('\n')}</div>
        <button class="console-clear-btn">Clear</button>
      </div>
    `;
    
    // Initialize Lucide icons
    createIcons({
      icons: { ChevronDown, ChevronUp },
      attrs: { 'stroke-width': 2, 'width': 16, 'height': 16 }
    });
  }
  
  protected attachEventListeners() {
    const header = this.shadow.querySelector('.console-header');
    const clearBtn = this.shadow.querySelector('.console-clear-btn');
    
    header?.addEventListener('click', () => {
      this.toggle();
    });
    
    clearBtn?.addEventListener('click', () => {
      this.clear();
    });
  }
  
  public addOutput(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.output.push(`[${timestamp}] ${message}`);
    this.updateOutput();
    
    // Auto-expand if collapsed
    if (!this.isExpanded) {
      this.toggle();
    }
  }
  
  public clear() {
    this.output = [];
    this.updateOutput();
  }
  
  private toggle() {
    this.isExpanded = !this.isExpanded;
    const panel = this.shadow.querySelector('.console-panel');
    const arrow = this.shadow.querySelector('.console-arrow');
    
    if (this.isExpanded) {
      panel?.classList.remove('collapsed');
      panel?.classList.add('expanded');
      arrow?.setAttribute('data-lucide', 'chevron-up');
    } else {
      panel?.classList.remove('expanded');
      panel?.classList.add('collapsed');
      arrow?.setAttribute('data-lucide', 'chevron-down');
    }
    
    // Re-render icons
    createIcons({
      icons: { ChevronDown, ChevronUp },
      attrs: { 'stroke-width': 2, 'width': 16, 'height': 16 }
    });
  }
  
  private updateOutput() {
    const outputEl = this.shadow.querySelector('.console-output');
    if (outputEl) {
      outputEl.textContent = this.output.join('\n');
      outputEl.scrollTop = outputEl.scrollHeight;
    }
  }
}

customElements.define('console-panel', ConsolePanel);
