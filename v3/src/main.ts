import './styles.css';
import { invoke } from '@tauri-apps/api/core';
import { open, message } from '@tauri-apps/plugin-dialog';
import { createIcons, RefreshCw, RefreshCcw, Trash2, Info, Settings, HelpCircle, ChevronDown, ChevronUp } from 'lucide';

// Import Web Components
import './components/installation-card';
import './components/preset-card';
import './components/console-panel';
import './components/status-bar';
import './components/toolbar-section';
import type { Installation, InstallationCard } from './components/installation-card';
import type { PackInfo, PresetCard } from './components/preset-card';
import type { ConsolePanel } from './components/console-panel';
import type { StatusBar } from './components/status-bar';
import type { ToolbarSection } from './components/toolbar-section';

// Application state
class AppState {
  installations: Installation[] = [];
  presets: PackInfo[] = [];
  selectedInstallations: Set<string> = new Set();
  selectedPreset: string | null = null;
}

// Main application controller
class BetterRTXInstaller {
  private state: AppState;
  private installationsContainer: HTMLElement | null = null;
  private presetsContainer: HTMLElement | null = null;
  private consolePanel: ConsolePanel | null = null;
  private statusBar: StatusBar | null = null;
  private dropZone: HTMLElement | null = null;
  private actionsSidepanel: HTMLElement | null = null;
  private sidepanelOverlay: HTMLElement | null = null;
  private mobileMenuToggle: HTMLElement | null = null;
  
  constructor() {
    this.state = new AppState();
  }
  
  async init() {
    // Get DOM elements
    this.installationsContainer = document.getElementById('installations-list');
    this.presetsContainer = document.getElementById('presets-list');
    this.consolePanel = document.getElementById('console-panel') as ConsolePanel;
    this.statusBar = document.getElementById('status-bar') as StatusBar;
    
    // Initialize Lucide icons
    createIcons({ 
      icons: { 
        RefreshCw, RefreshCcw, Trash2, Info, Settings, HelpCircle, ChevronDown, ChevronUp 
      } 
    });
    
    // Initialize components
    this.attachEventListeners();
    
    // Load initial data
    await this.refreshInstallations();
    await this.refreshPresets();
  }
  
  private updateInstallationsCount() {
    const count = document.getElementById('installations-count');
    if (count) {
      count.textContent = `${this.state.installations.length} found`;
    }
  }
  
  private updatePresetsCount() {
    const count = document.getElementById('presets-count');
    if (count) {
      count.textContent = `${this.state.presets.length} available`;
    }
  }
  
  private async setupComponents() {
    // Create and insert status bar
    const statusContainer = document.getElementById('status-container');
    if (statusContainer) {
      this.statusBar = document.createElement('status-bar') as StatusBar;
      statusContainer.appendChild(this.statusBar);
    }
    
    // Create and insert console panel
    const consoleContainer = document.getElementById('console-container');
    if (consoleContainer) {
      this.consolePanel = document.createElement('console-panel') as ConsolePanel;
      consoleContainer.appendChild(this.consolePanel);
    }
    
    // Create and insert toolbar
    const toolbarContainer = document.getElementById('toolbar-container');
    if (toolbarContainer) {
      const toolbar = document.createElement('toolbar-section') as ToolbarSection;
      toolbarContainer.appendChild(toolbar);
      
      // Listen to toolbar events
      toolbar.addEventListener('settings-clicked', () => this.handleSettings());
      toolbar.addEventListener('help-clicked', () => this.handleHelp());
      toolbar.addEventListener('refresh-clicked', () => this.refreshInstallations());
      toolbar.addEventListener('force-refresh-clicked', () => this.refreshPresets(true));
      toolbar.addEventListener('clear-cache-clicked', () => this.clearCache());
      toolbar.addEventListener('about-clicked', () => this.handleAbout());
    }
    
    // Get containers
    this.installationsContainer = document.getElementById('installations-list');
    this.presetsContainer = document.getElementById('presets-list');
    this.dropZone = document.getElementById('drop-zone');
    this.actionsSidepanel = document.getElementById('actions-sidepanel');
    this.sidepanelOverlay = document.getElementById('sidepanel-overlay');
    this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  }
  
  private attachEventListeners() {
    // Get additional DOM elements
    this.dropZone = document.getElementById('drop-zone');
    this.actionsSidepanel = document.getElementById('actions-sidepanel');
    this.sidepanelOverlay = document.getElementById('sidepanel-overlay');
    this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    
    // Mobile menu toggle
    this.mobileMenuToggle?.addEventListener('click', () => this.toggleMobileMenu());
    document.getElementById('close-sidepanel')?.addEventListener('click', () => this.closeSidepanel());
    this.sidepanelOverlay?.addEventListener('click', () => this.closeSidepanel());
    
    // Action buttons (both sidepanel and desktop versions)
    const actionHandlers = {
      'install-rtpack': () => this.installRtpackFile(),
      'install-materials': () => this.installMaterialFiles(),
      'backup-selected': () => this.backupSelected(),
      'install-dlss': () => this.installDlss(),
      'update-options': () => this.updateOptions(),
      'register-rtpack': () => this.registerRtpack(),
      'locate-iobit': () => this.locateIobit(),
      'uninstall': () => this.uninstallPackage()
    };
    
    Object.entries(actionHandlers).forEach(([id, handler]) => {
      document.getElementById(id)?.addEventListener('click', handler);
      document.getElementById(`${id}-desktop`)?.addEventListener('click', handler);
      document.getElementById(`${id}-popover`)?.addEventListener('click', handler);
    });
    
    // Special popover actions
    document.getElementById('check-iobit-popover')?.addEventListener('click', async () => {
      this.addToConsole('Checking IObit Unlocker status...');
      try {
        const cacheInfo = await invoke('get_cache_info');
        await message(`Cache Info:\n${JSON.stringify(cacheInfo, null, 2)}`, { title: 'Cache Information' });
      } catch (error) {
        await message(String(error), { title: 'IObit Unlocker', kind: 'error' });
      }
    });
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleNavigation(e));
    });
    
    // Drag and drop
    this.dropZone?.addEventListener('dragover', (e: DragEvent) => this.handleDragOver(e));
    this.dropZone?.addEventListener('dragleave', (e: DragEvent) => this.handleDragLeave(e));
    this.dropZone?.addEventListener('drop', (e: DragEvent) => this.handleDrop(e));
  }
  
  private setStatus(message: string, isError = false) {
    // Update status bar component
    if (this.statusBar) {
      this.statusBar.setStatus(message, isError);
    }
  }
  
  private showProgress() {
    this.statusBar?.showProgress();
  }
  
  private hideProgress() {
    this.statusBar?.hideProgress();
  }
  
  private addToConsole(text: string) {
    if (this.consolePanel) {
      this.consolePanel.addOutput(text);
    }
  }
  
  
  async refreshInstallations() {
    try {
      this.setStatus('Loading Minecraft installations...');
      this.showProgress();
      this.state.installations = await invoke<Installation[]>('list_installations');
      this.renderInstallations();
      this.setStatus(`Found ${this.state.installations.length} Minecraft installation(s)`);
    } catch (error) {
      this.setStatus(`Error loading installations: ${error}`, true);
    } finally {
      this.hideProgress();
    }
  }
  
  private renderInstallations() {
    if (!this.installationsContainer) return;
    
    const countElement = document.getElementById('installations-count');
    if (countElement) {
      countElement.textContent = `${this.state.installations.length} found`;
    }
    
    if (this.state.installations.length === 0) {
      this.installationsContainer.innerHTML = `
        <div class="empty-state">
          <p>No Minecraft installations found.</p>
          <p>Make sure Minecraft is installed from the Microsoft Store.</p>
        </div>
      `;
      return;
    }
    
    // Clear container
    this.installationsContainer.innerHTML = '';
    
    // Create installation cards
    this.state.installations.forEach(installation => {
      const card = document.createElement('installation-card') as InstallationCard;
      card.data = installation;
      card.selected = this.state.selectedInstallations.has(installation.InstallLocation);
      
      // Listen for selection changes
      card.addEventListener('selection-changed', ((e: CustomEvent) => {
        if (e.detail.selected) {
          this.state.selectedInstallations.add(e.detail.path);
        } else {
          this.state.selectedInstallations.delete(e.detail.path);
        }
      }) as EventListener);
      
      this.installationsContainer!.appendChild(card);
    });
  }
  
  async refreshPresets(forceRefresh = false) {
    try {
      this.setStatus('Loading available presets...');
      this.showProgress();
      this.state.presets = await invoke<PackInfo[]>('list_presets', { forceRefresh });
      this.renderPresets();
      this.setStatus(`Loaded ${this.state.presets.length} preset(s)`);
    } catch (error) {
      this.setStatus(`Error loading presets: ${error}`, true);
    } finally {
      this.hideProgress();
    }
  }
  
  private renderPresets() {
    if (!this.presetsContainer) return;
    
    // Clear container
    this.presetsContainer.innerHTML = '';
    
    // Create preset cards
    this.state.presets.forEach(preset => {
      const card = document.createElement('preset-card') as PresetCard;
      card.data = preset;
      card.selected = this.state.selectedPreset === preset.uuid;
      
      // Listen for selection changes
      card.addEventListener('selection-changed', ((e: CustomEvent) => {
        const { uuid, selected } = e.detail;
        if (selected) {
          this.state.selectedPreset = uuid;
          // Deselect other presets
          this.state.presets.forEach(p => {
            if (p.uuid !== uuid) {
              const otherCard = this.presetsContainer?.querySelector(`preset-card[data-uuid="${p.uuid}"]`);
              if (otherCard) {
                otherCard.removeAttribute('selected');
              }
            }
          });
        } else {
          this.state.selectedPreset = null;
        }
      }) as EventListener);
      
      // Listen for install events
      card.addEventListener('install-preset', ((e: CustomEvent) => {
        const { uuid } = e.detail;
        this.installPreset(uuid);
      }) as EventListener);
      
      this.presetsContainer!.appendChild(card);
    });
  }
  
  private async installPreset(uuid: string) {
    if (this.state.selectedInstallations.size === 0) {
      await message('Please select at least one Minecraft installation first.', { 
        title: 'No Installation Selected', 
        kind: 'warning' 
      });
      return;
    }
    
    const preset = this.state.presets.find(p => p.uuid === uuid);
    
    try {
      this.addToConsole(`Installing preset: ${preset?.name || uuid}`);
      this.addToConsole(`To installations: ${Array.from(this.state.selectedInstallations).join(', ')}`);
      
      const result = await invoke('download_and_install_pack', {
        uuid: uuid,
        selectedNames: Array.from(this.state.selectedInstallations)
      });
      
      this.addToConsole(`Installation complete: ${result}`);
      this.setStatus('Preset installed successfully!');
      await this.refreshInstallations();
    } catch (error) {
      const errorMsg = String(error);
      this.addToConsole(`Error: ${errorMsg}`);
      this.setStatus(`Installation failed: ${errorMsg}`, true);
      
      if (errorMsg.includes('IObit Unlocker not found')) {
        await message(
          'IObit Unlocker is required to install presets to Microsoft Store Minecraft installations.\n\nPlease download and install IObit Unlocker from iobit.com, then try again.',
          { title: 'IObit Unlocker Required', kind: 'error' }
        );
      } else if (errorMsg.includes('Access is denied')) {
        await message(
          'Access denied when copying files. This usually means:\n\n1. IObit Unlocker is needed for Microsoft Store installations\n2. The app needs to run as administrator\n3. Antivirus software is blocking the operation',
          { title: 'Access Denied', kind: 'error' }
        );
      }
    } finally {
      this.hideProgress();
    }
  }
  
  private async installRtpackFile() {
    if (this.state.selectedInstallations.size === 0) {
      await message('Please select at least one Minecraft installation first.', { 
        title: 'No Installation Selected', 
        kind: 'warning' 
      });
      return;
    }
    
    try {
      const file = await open({
        title: 'Select .rtpack file',
        filters: [{ name: 'RTX Pack', extensions: ['rtpack'] }]
      });
      
      if (!file) return;
      
      this.addToConsole(`Installing .rtpack file: ${file}`);
      this.addToConsole(`To installations: ${Array.from(this.state.selectedInstallations).join(', ')}`);
      const result = await invoke('install_rtpack', {
        rtpackPath: file,
        installPaths: Array.from(this.state.selectedInstallations)
      });
      this.addToConsole(`Installation complete: ${result}`);
      this.setStatus('.rtpack file installed successfully!');
    } catch (error) {
      this.addToConsole(`Error: ${error}`);
      this.setStatus(`Installation failed: ${error}`, true);
    } finally {
      this.hideProgress();
    }
  }
  
  private async installMaterialFiles() {
    if (this.state.selectedInstallations.size === 0) {
      await message('Please select at least one Minecraft installation first.', { 
        title: 'No Installation Selected', 
        kind: 'warning' 
      });
      return;
    }
    
    try {
      const files = await open({
        title: 'Select material files',
        filters: [{ name: 'Material Files', extensions: ['bin'] }],
        multiple: true
      });
      
      if (!files || files.length === 0) return;
      
      this.setStatus('Installing material files...');
      this.showProgress();
      await invoke('install_materials', {
        materialPaths: files,
        selectedNames: Array.from(this.state.selectedInstallations)
      });
      this.setStatus('Material files installed successfully!');
      await this.refreshInstallations();
    } catch (error) {
      this.setStatus(`Error installing materials: ${error}`, true);
    } finally {
      this.hideProgress();
    }
  }
  
  private async backupSelected() {
    if (this.state.selectedInstallations.size === 0) {
      await message('Please select at least one Minecraft installation first.', { 
        title: 'No Installation Selected', 
        kind: 'warning' 
      });
      return;
    }
    
    try {
      const dir = await open({
        title: 'Select backup destination',
        directory: true
      });
      
      if (!dir) return;
      
      this.setStatus('Creating backups...');
      this.showProgress();
      const created = await invoke<string[]>('backup_selected', {
        destDir: dir,
        selectedNames: Array.from(this.state.selectedInstallations)
      });
      this.setStatus(`Created ${created.length} backup file(s)`);
    } catch (error) {
      this.setStatus(`Error creating backup: ${error}`, true);
    } finally {
      this.hideProgress();
    }
  }
  
  private async installDlss() {
    if (this.state.selectedInstallations.size === 0) {
      await message('Please select at least one Minecraft installation first.', { 
        title: 'No Installation Selected', 
        kind: 'warning' 
      });
      return;
    }
    
    try {
      this.setStatus('Installing DLSS...');
      this.showProgress();
      await invoke('install_dlss_for_selected', {
        selectedNames: Array.from(this.state.selectedInstallations)
      });
      this.setStatus('DLSS installed successfully!');
      await this.refreshInstallations();
    } catch (error) {
      this.setStatus(`Error installing DLSS: ${error}`, true);
    } finally {
      this.hideProgress();
    }
  }
  
  private async updateOptions() {
    if (this.state.selectedInstallations.size === 0) {
      await message('Please select at least one Minecraft installation first.', { 
        title: 'No Installation Selected', 
        kind: 'warning' 
      });
      return;
    }
    
    try {
      this.setStatus('Updating options...');
      this.showProgress();
      await invoke('update_options_for_selected', {
        selectedNames: Array.from(this.state.selectedInstallations)
      });
      this.setStatus('Options updated successfully!');
    } catch (error) {
      this.setStatus(`Error updating options: ${error}`, true);
    } finally {
      this.hideProgress();
    }
  }
  
  private async registerRtpack() {
    try {
      this.setStatus('Registering .rtpack extension...');
      this.showProgress();
      await invoke('register_rtpack_extension');
      this.setStatus('.rtpack extension registered successfully!');
    } catch (error) {
      this.setStatus(`Error registering extension: ${error}`, true);
    } finally {
      this.hideProgress();
    }
  }
  
  private async locateIobit() {
    try {
      const file = await open({
        title: 'Locate IObit Unlocker',
        filters: [
          { name: 'Executable Files', extensions: ['exe'] },
          { name: 'Shortcuts', extensions: ['lnk'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (!file) return;
      
      this.setStatus('Setting IObit Unlocker path...');
      this.showProgress();
      
      const result = await invoke<string>('set_iobit_path', { path: file });
      this.setStatus(result);
      
      await message('IObit Unlocker path has been set successfully!', { 
        title: 'Success', 
        kind: 'info' 
      });
    } catch (error) {
      this.setStatus(`Error setting IObit path: ${error}`, true);
      await message(String(error), { 
        title: 'Error', 
        kind: 'error' 
      });
    } finally {
      this.hideProgress();
    }
  }
  
  private async uninstallPackage() {
    try {
      this.setStatus('Uninstalling...');
      this.showProgress();
      await invoke('uninstall_package');
      this.setStatus('Uninstalled successfully!');
      
      // Reload lists to reflect changes
      this.state.selectedInstallations.clear();
      this.state.selectedPreset = null;
      await this.refreshInstallations();
      await this.refreshPresets();
    } catch (error) {
      this.setStatus(`Error during uninstall: ${error}`, true);
    } finally {
      this.hideProgress();
    }
  }
  
  private async clearCache() {
    try {
      this.setStatus('Clearing cache...');
      await invoke('clear_cache');
      this.setStatus('Cache cleared successfully');
    } catch (error) {
      this.setStatus(`Error clearing cache: ${error}`, true);
    }
  }
  
  private async handleSettings() {
    this.addToConsole('Settings clicked - Feature coming soon');
  }
  
  private async handleHelp() {
    this.addToConsole('Help clicked - Feature coming soon');
  }
  
  private async handleAbout() {
    this.addToConsole('About clicked - Feature coming soon');
  }
  
  private handleNavigation(e: Event) {
    const target = e.target as HTMLButtonElement;
    const section = target.dataset.section;
    
    // Update active state
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    target.classList.add('active');
    
    // Show/hide only the main content sections
    const mainSections = ['installations-section', 'presets-section', 'actions-section'];
    mainSections.forEach(id => {
      const el = document.getElementById(id);
      if (el) (el as HTMLElement).style.display = 'none';
    });
    
    if (section === 'installations') {
      document.getElementById('installations-section')!.style.display = 'block';
    } else if (section === 'presets') {
      document.getElementById('presets-section')!.style.display = 'block';
    } else if (section === 'actions') {
      document.getElementById('actions-section')!.style.display = 'block';
    }
  }
  
  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone?.classList.add('drag-over');
  }
  
  private handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone?.classList.remove('drag-over');
  }
  
  private async handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone?.classList.remove('drag-over');
    
    if (this.state.selectedInstallations.size === 0) {
      await message('Please select at least one Minecraft installation first.', { 
        title: 'No Installation Selected', 
        kind: 'warning' 
      });
      return;
    }
    
    await message(
      'Drag and drop is not fully supported yet. Please use the "Install .rtpack File" or "Install Material Files" buttons instead.',
      { title: 'Feature Not Available', kind: 'info' }
    );
  }
  
  private toggleMobileMenu() {
    if (this.actionsSidepanel?.classList.contains('open')) {
      this.closeSidepanel();
    } else {
      this.openSidepanel();
    }
  }
  
  private openSidepanel() {
    this.actionsSidepanel?.classList.add('open');
    this.sidepanelOverlay?.classList.add('visible');
    this.mobileMenuToggle?.classList.add('active');
  }
  
  private closeSidepanel() {
    this.actionsSidepanel?.classList.remove('open');
    this.sidepanelOverlay?.classList.remove('visible');
    this.mobileMenuToggle?.classList.remove('active');
  }
  
}

// Initialize the application
window.addEventListener('DOMContentLoaded', async () => {
  const app = new BetterRTXInstaller();
  await app.init();
});
