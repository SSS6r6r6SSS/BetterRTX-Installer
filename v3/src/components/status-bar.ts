import { BaseComponent } from './base-component';

export class StatusBar extends BaseComponent {
  private message: string = 'Ready';
  private isError: boolean = false;
  private isLoading: boolean = false;
  
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
        .status-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--app-panel);
          border: 1px solid var(--app-border);
          border-radius: 0.5rem;
        }
        .status-message {
          flex: 1;
          font-size: 0.875rem;
          color: var(--app-fg);
        }
        .status-message.error {
          color: var(--danger-600);
        }
        .progress-spinner {
          display: ${this.isLoading ? 'block' : 'none'};
          width: 16px;
          height: 16px;
          border: 2px solid var(--app-border);
          border-top-color: var(--brand-accent-600);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <div class="status-bar">
        <span class="status-message ${this.isError ? 'error' : ''}">${this.message}</span>
        <div class="progress-spinner"></div>
      </div>
    `;
  }
  
  protected attachEventListeners() {
    // No event listeners needed for status bar
  }
  
  public setStatus(message: string, isError: boolean = false) {
    this.message = message;
    this.isError = isError;
    this.updateStatus();
  }
  
  public showProgress() {
    this.isLoading = true;
    this.updateProgress();
  }
  
  public hideProgress() {
    this.isLoading = false;
    this.updateProgress();
  }
  
  private updateStatus() {
    const messageEl = this.shadow.querySelector('.status-message');
    if (messageEl) {
      messageEl.textContent = this.message;
      messageEl.className = `status-message ${this.isError ? 'error' : ''}`;
    }
  }
  
  private updateProgress() {
    const spinner = this.shadow.querySelector('.progress-spinner') as HTMLElement;
    if (spinner) {
      spinner.style.display = this.isLoading ? 'block' : 'none';
    }
  }
}

customElements.define('status-bar', StatusBar);
