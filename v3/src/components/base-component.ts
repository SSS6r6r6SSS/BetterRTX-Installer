/**
 * Base Web Component class with common functionality
 */
export abstract class BaseComponent extends HTMLElement {
  protected shadow: ShadowRoot;
  
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }
  
  protected connectedCallback() {
    this.render();
    this.attachEventListeners();
  }
  
  protected disconnectedCallback() {
    this.cleanup();
  }
  
  protected abstract render(): void;
  protected abstract attachEventListeners(): void;
  protected cleanup(): void {
    // Override in child classes if needed
  }
  
  protected emit(eventName: string, detail?: any) {
    this.dispatchEvent(new CustomEvent(eventName, { 
      detail, 
      bubbles: true, 
      composed: true 
    }));
  }
  
  protected applyExternalStyles() {
    // Link to external stylesheet for BEM classes
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/styles.css';
    this.shadow.appendChild(link);
  }
}
