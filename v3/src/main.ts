import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { message, confirm } from "@tauri-apps/plugin-dialog";

interface Installation {
  FriendlyName: string;
  InstallLocation: string;
  Preview: boolean;
  installed_preset?: {
    uuid: string;
    name: string;
    installed_at: string;
  };
}

interface PackInfo {
  name: string;
  uuid: string;
  stub: string;
  tonemapping: string;
  bloom: string;
}

let installations: Installation[] = [];
let presets: PackInfo[] = [];
let selectedInstallations: Set<string> = new Set();
let selectedPreset: string | null = null;

// UI Elements
let presetsList: HTMLElement;
let statusEl: HTMLElement;
let progressEl: HTMLElement;
let dropZone: HTMLElement;
let actionsSidepanel: HTMLElement;
let sidepanelOverlay: HTMLElement;
let mobileMenuToggle: HTMLElement;
let installationsCount: HTMLElement;
let presetsCount: HTMLElement;

function setStatus(msg: string, isError = false) {
  if (statusEl) {
    statusEl.textContent = msg;
    statusEl.className = `status ${isError ? 'error' : ''}`;
  }
}

function showProgress() {
  if (progressEl) progressEl.style.display = 'block';
}

function hideProgress() {
  if (progressEl) progressEl.style.display = 'none';
}

async function refreshInstallations() {
  try {
    setStatus("Loading Minecraft installations...");
    showProgress();
    installations = await invoke<Installation[]>("list_installations");
    renderInstallations(installations);
    updateInstallationsCount();
    setStatus(`Found ${installations.length} Minecraft installation(s)`);
  } catch (error) {
    setStatus(`Error loading installations: ${error}`, true);
  } finally {
    hideProgress();
  }
}

function renderInstallations(installations: Installation[]) {
  const container = document.getElementById("installations-list");
  const countElement = document.getElementById("installations-count");
  
  if (!container || !countElement) return;
  
  countElement.textContent = `${installations.length} found`;
  
  if (installations.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No Minecraft installations found.</p>
        <p>Make sure Minecraft is installed from the Microsoft Store.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = installations.map(installation => {
    const isSelected = selectedInstallations.has(installation.InstallLocation);
    const presetIcon = installation.installed_preset 
      ? `<img src="https://cdn.jsdelivr.net/gh/BetterRTX/BetterRTX-Packs@main/packs/${installation.installed_preset.uuid}/icon.png" 
             class="preset-icon" alt="${installation.installed_preset.name}" 
             title="Installed: ${installation.installed_preset.name}" 
             onerror="this.style.display='none'">`
      : '';
    
    return `
      <div class="installation-card ${isSelected ? 'selected' : ''}" data-path="${installation.InstallLocation}">
        <div class="installation-header">
          <div class="installation-title">
            ${presetIcon}
            <h3>${installation.FriendlyName}</h3>
          </div>
          ${installation.Preview ? '<span class="preview-badge">Preview</span>' : ''}
        </div>
        <p class="installation-path">${installation.InstallLocation}</p>
        ${installation.installed_preset ? 
          `<p class="installed-preset-info">Current preset: ${installation.installed_preset.name}</p>` : 
          '<p class="no-preset-info">No preset installed</p>'
        }
        <div class="installation-actions">
          <input type="checkbox" id="install-${installation.InstallLocation.replace(/[^a-zA-Z0-9]/g, '')}" 
                 class="installation-checkbox" value="${installation.InstallLocation}" ${isSelected ? 'checked' : ''}>
          <label for="install-${installation.InstallLocation.replace(/[^a-zA-Z0-9]/g, '')}" class="checkbox-label">
            Select for installation
          </label>
        </div>
      </div>
    `;
  }).join('');
  
  // Add event listeners for checkboxes
  document.querySelectorAll('.installation-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const card = target.closest('.installation-card') as HTMLElement;
      
      if (target.checked) {
        selectedInstallations.add(target.value);
        card.classList.add('selected');
      } else {
        selectedInstallations.delete(target.value);
        card.classList.remove('selected');
      }
      
      updateInstallationsCount();
    });
  });
}

async function refreshPresets(forceRefresh = false) {
  try {
    setStatus("Loading available presets...");
    showProgress();
    presets = await invoke<PackInfo[]>("list_presets", { forceRefresh });
    renderPresets();
    updatePresetsCount();
    setStatus(`Loaded ${presets.length} preset(s)`);
  } catch (error) {
    setStatus(`Error loading presets: ${error}`, true);
  } finally {
    hideProgress();
  }
}

function renderPresets() {
  if (!presetsList) return;
  
  presetsList.innerHTML = presets.map(preset => `
    <div class="preset-card ${selectedPreset === preset.uuid ? 'selected' : ''}" 
         data-uuid="${preset.uuid}">
      <div class="preset-header">
        <img class="preset-icon" 
             src="https://cdn.jsdelivr.net/gh/BetterRTX/presets@main/data/${preset.uuid}/icon.png" 
             alt="${preset.name} icon"
             onerror="this.style.display='none'">
        <h3>${preset.name}</h3>
      </div>
      <button class="install-preset-btn" data-uuid="${preset.uuid}">Install</button>
    </div>
  `).join('');

  // Add click handlers
  presetsList.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('install-preset-btn')) return;
      
      const uuid = card.getAttribute('data-uuid')!;
      presetsList.querySelectorAll('.preset-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPreset = uuid;
    });
  });

  // Add install button handlers
  presetsList.querySelectorAll('.install-preset-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const uuid = (btn as HTMLElement).getAttribute('data-uuid')!;
      await installPreset(uuid);
    });
  });
}

async function installPreset(uuid: string) {
  if (selectedInstallations.size === 0) {
    await message("Please select at least one Minecraft installation first.", { title: "No Installation Selected", kind: "warning" });
    return;
  }

  const preset = presets.find(p => p.uuid === uuid);
  const presetName = preset ? preset.name : uuid;

  try {
    addConsoleOutput(`Starting installation of preset: ${presetName}`);
    addConsoleOutput(`Target installations: ${Array.from(selectedInstallations).join(', ')}`);
    setStatus("Installing preset...");
    showProgress();
    await invoke("download_and_install_pack", { 
      uuid, 
      selectedNames: Array.from(selectedInstallations) 
    });
    addConsoleOutput(`Preset "${presetName}" installed successfully!`);
    setStatus("Preset installed successfully!");
    await refreshInstallations();
  } catch (error) {
    const errorMsg = String(error);
    addConsoleOutput(`Error installing preset: ${errorMsg}`);
    if (errorMsg.includes("IObit Unlocker not found")) {
      await message(
        "IObit Unlocker is required to install presets to Microsoft Store Minecraft installations.\n\nPlease download and install IObit Unlocker from iobit.com, then try again.",
        { title: "IObit Unlocker Required", kind: "error" }
      );
    } else if (errorMsg.includes("Access is denied")) {
      await message(
        "Access denied when copying files. This usually means:\n\n1. IObit Unlocker is needed for Microsoft Store installations\n2. The app needs to run as administrator\n3. Antivirus software is blocking the operation",
        { title: "Access Denied", kind: "error" }
      );
    }
    setStatus(`Error installing preset: ${error}`, true);
  } finally {
    hideProgress();
  }
}

async function installRtpackFile() {
  if (selectedInstallations.size === 0) {
    await message("Please select at least one Minecraft installation first.", { title: "No Installation Selected", kind: "warning" });
    return;
  }

  try {
    const file = await open({
      title: "Select .rtpack file",
      filters: [{ name: "RTX Pack", extensions: ["rtpack"] }]
    });

    if (!file) return;

    setStatus("Installing .rtpack file...");
    showProgress();
    await invoke("install_from_rtpack", {
      rtpackPath: file,
      selectedNames: Array.from(selectedInstallations)
    });
    setStatus("RTX pack installed successfully!");
    await refreshInstallations();
  } catch (error) {
    setStatus(`Error installing .rtpack: ${error}`, true);
  } finally {
    hideProgress();
  }
}

async function installMaterialFiles() {
  if (selectedInstallations.size === 0) {
    await message("Please select at least one Minecraft installation first.", { title: "No Installation Selected", kind: "warning" });
    return;
  }

  try {
    const files = await open({
      title: "Select material files",
      filters: [{ name: "Material Files", extensions: ["bin"] }],
      multiple: true
    });

    if (!files || files.length === 0) return;

    setStatus("Installing material files...");
    showProgress();
    await invoke("install_materials", {
      materialPaths: files,
      selectedNames: Array.from(selectedInstallations)
    });
    setStatus("Material files installed successfully!");
    await refreshInstallations();
  } catch (error) {
    setStatus(`Error installing materials: ${error}`, true);
  } finally {
    hideProgress();
  }
}

async function backupSelected() {
  if (selectedInstallations.size === 0) {
    await message("Please select at least one Minecraft installation first.", { title: "No Installation Selected", kind: "warning" });
    return;
  }

  try {
    const dir = await open({
      title: "Select backup destination",
      directory: true
    });

    if (!dir) return;

    setStatus("Creating backups...");
    showProgress();
    const created = await invoke<string[]>("backup_selected", {
      destDir: dir,
      selectedNames: Array.from(selectedInstallations)
    });
    setStatus(`Created ${created.length} backup file(s)`);
  } catch (error) {
    setStatus(`Error creating backup: ${error}`, true);
  } finally {
    hideProgress();
  }
}

async function installDlss() {
  if (selectedInstallations.size === 0) {
    await message("Please select at least one Minecraft installation first.", { title: "No Installation Selected", kind: "warning" });
    return;
  }

  try {
    setStatus("Installing DLSS...");
    showProgress();
    await invoke("install_dlss_for_selected", {
      selectedNames: Array.from(selectedInstallations)
    });
    setStatus("DLSS installed successfully!");
    await refreshInstallations();
  } catch (error) {
    setStatus(`Error installing DLSS: ${error}`, true);
  } finally {
    hideProgress();
  }
}

async function updateOptions() {
  if (selectedInstallations.size === 0) {
    await message("Please select at least one Minecraft installation first.", { title: "No Installation Selected", kind: "warning" });
    return;
  }

  try {
    setStatus("Updating options...");
    showProgress();
    await invoke("update_options_for_selected", {
      selectedNames: Array.from(selectedInstallations)
    });
    setStatus("Options updated successfully!");
  } catch (error) {
    setStatus(`Error updating options: ${error}`, true);
  } finally {
    hideProgress();
  }
}

async function registerRtpack() {
  try {
    setStatus("Registering .rtpack extension...");
    showProgress();
    await invoke("register_rtpack_extension");
    setStatus(".rtpack extension registered successfully!");
  } catch (error) {
    setStatus(`Error registering extension: ${error}`, true);
  } finally {
    hideProgress();
  }
}

async function locateIobit() {
  try {
    const file = await open({
      title: "Locate IObit Unlocker",
      filters: [
        { name: "Executable Files", extensions: ["exe"] },
        { name: "Shortcuts", extensions: ["lnk"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });

    if (!file) return;

    setStatus("Setting IObit Unlocker path...");
    showProgress();
    
    const result = await invoke<string>("set_iobit_path", { path: file });
    setStatus(result);
    
    await message("IObit Unlocker path has been set successfully!", { 
      title: "Success", 
      kind: "info" 
    });
  } catch (error) {
    setStatus(`Error setting IObit path: ${error}`, true);
    await message(String(error), { 
      title: "Error", 
      kind: "error" 
    });
  } finally {
    hideProgress();
  }
}

async function uninstallPackage() {
  const shouldRestore = await confirm(
    "Do you want to restore original shader files before uninstalling?",
    { title: "Uninstall BetterRTX", kind: "warning" }
  );

  try {
    setStatus("Uninstalling...");
    showProgress();
    await invoke("uninstall_package", { restoreInitial: shouldRestore });
    setStatus("Uninstalled successfully!");
    // Reload lists to reflect changes
    selectedInstallations.clear();
    selectedPreset = null;
    await refreshInstallations();
    await refreshPresets();
  } catch (error) {
    setStatus(`Error during uninstall: ${error}`, true);
  } finally {
    hideProgress();
  }
}

// Console panel functions
function toggleConsole() {
  const panel = document.getElementById("console-panel");
  const arrow = document.getElementById("console-arrow");
  
  if (panel?.classList.contains("collapsed")) {
    panel.classList.remove("collapsed");
    panel.classList.add("expanded");
    if (arrow) arrow.textContent = "▲";
  } else {
    panel?.classList.remove("expanded");
    panel?.classList.add("collapsed");
    if (arrow) arrow.textContent = "▼";
  }
}

function clearConsole() {
  const output = document.getElementById("console-output");
  if (output) output.textContent = "";
}

function addConsoleOutput(message: string) {
  const output = document.getElementById("console-output");
  if (output) {
    const timestamp = new Date().toLocaleTimeString();
    output.textContent += `[${timestamp}] ${message}\n`;
    output.scrollTop = output.scrollHeight;
    
    // Auto-expand console when new output is added
    const panel = document.getElementById("console-panel");
    if (panel?.classList.contains("collapsed")) {
      toggleConsole();
    }
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  dropZone?.classList.add('drag-over');
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  dropZone?.classList.remove('drag-over');
}

async function handleDrop(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  dropZone?.classList.remove('drag-over');

  if (selectedInstallations.size === 0) {
    await message("Please select at least one Minecraft installation first.", { title: "No Installation Selected", kind: "warning" });
    return;
  }

  // Note: Browser File objects don't have path property in standard web context
  // This drag-and-drop functionality would need additional Tauri APIs to work properly
  // For now, show a message directing users to use the file picker buttons instead
  await message(
    "Drag and drop is not fully supported yet. Please use the 'Install .rtpack File' or 'Install Material Files' buttons instead.",
    { title: "Feature Not Available", kind: "info" }
  );
}

// Slideout sidepanel functions
function openSidepanel() {
  actionsSidepanel?.classList.add("open");
  sidepanelOverlay?.classList.add("visible");
  mobileMenuToggle?.classList.add("active");
}

function closeSidepanel() {
  actionsSidepanel?.classList.remove("open");
  sidepanelOverlay?.classList.remove("visible");
  mobileMenuToggle?.classList.remove("active");
}

function updateInstallationsCount() {
  if (installationsCount) {
    installationsCount.textContent = `${installations.length} found`;
  }
}

function updatePresetsCount() {
  if (presetsCount) {
    presetsCount.textContent = `${presets.length} loaded`;
  }
}

async function clearCache() {
  try {
    setStatus("Clearing cache...");
    await invoke("clear_cache");
    setStatus("Cache cleared successfully");
  } catch (error) {
    setStatus(`Error clearing cache: ${error}`, true);
  }
}

async function showCacheInfo() {
  try {
    const info = await invoke("get_cache_info");
    console.log("Cache info:", info);
    addConsoleOutput(`Cache Info: ${JSON.stringify(info, null, 2)}`);
  } catch (error) {
    setStatus(`Error getting cache info: ${error}`, true);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  // Get UI elements
  presetsList = document.getElementById("presets-list")!;
  statusEl = document.getElementById("status")!;
  progressEl = document.getElementById("progress")!;
  dropZone = document.getElementById("drop-zone")!;
  actionsSidepanel = document.getElementById("actions-sidepanel")!;
  sidepanelOverlay = document.getElementById("sidepanel-overlay")!;
  mobileMenuToggle = document.getElementById("mobile-menu-toggle")!;
  installationsCount = document.getElementById("installations-count")!;
  presetsCount = document.getElementById("presets-count")!;

  // Add event listeners
  document.getElementById("refresh-installations")?.addEventListener("click", refreshInstallations);
  document.getElementById("refresh-presets")?.addEventListener("click", () => refreshPresets(false));
  document.getElementById("force-refresh-presets")?.addEventListener("click", () => refreshPresets(true));
  document.getElementById("clear-cache")?.addEventListener("click", clearCache);
  document.getElementById("show-cache-info")?.addEventListener("click", showCacheInfo);
  
  // Mobile sidepanel controls
  mobileMenuToggle?.addEventListener("click", openSidepanel);
  document.getElementById("show-actions")?.addEventListener("click", openSidepanel);
  document.getElementById("close-sidepanel")?.addEventListener("click", closeSidepanel);
  sidepanelOverlay?.addEventListener("click", closeSidepanel);
  
  // Action buttons (both sidepanel and desktop versions)
  document.getElementById("install-rtpack")?.addEventListener("click", installRtpackFile);
  document.getElementById("install-rtpack-desktop")?.addEventListener("click", installRtpackFile);
  document.getElementById("install-materials")?.addEventListener("click", installMaterialFiles);
  document.getElementById("install-materials-desktop")?.addEventListener("click", installMaterialFiles);
  document.getElementById("backup-selected")?.addEventListener("click", backupSelected);
  document.getElementById("backup-selected-desktop")?.addEventListener("click", backupSelected);
  document.getElementById("install-dlss")?.addEventListener("click", installDlss);
  document.getElementById("install-dlss-desktop")?.addEventListener("click", installDlss);
  document.getElementById("update-options")?.addEventListener("click", updateOptions);
  document.getElementById("update-options-desktop")?.addEventListener("click", updateOptions);
  document.getElementById("register-rtpack")?.addEventListener("click", registerRtpack);
  document.getElementById("register-rtpack-desktop")?.addEventListener("click", registerRtpack);
  document.getElementById("locate-iobit")?.addEventListener("click", locateIobit);
  document.getElementById("locate-iobit-desktop")?.addEventListener("click", locateIobit);
  document.getElementById("uninstall")?.addEventListener("click", uninstallPackage);
  document.getElementById("uninstall-desktop")?.addEventListener("click", uninstallPackage);
  
  // Console panel toggle
  document.getElementById("console-toggle")?.addEventListener("click", toggleConsole);
  document.getElementById("clear-console")?.addEventListener("click", clearConsole);
  
  // Popover action buttons
  document.getElementById("clear-cache-popover")?.addEventListener("click", clearCache);
  document.getElementById("show-cache-info-popover")?.addEventListener("click", showCacheInfo);
  document.getElementById("locate-iobit-popover")?.addEventListener("click", locateIobit);
  document.getElementById("check-iobit-popover")?.addEventListener("click", async () => {
    addConsoleOutput("Checking IObit Unlocker status...");
    try {
      const result = await invoke<string>("check_iobit_unlocker");
      await message(result, { title: "IObit Unlocker", kind: "info" });
    } catch (error) {
      await message(String(error), { title: "IObit Unlocker", kind: "error" });
    }
  });
  document.getElementById("register-rtpack-popover")?.addEventListener("click", registerRtpack);
  document.getElementById("uninstall-popover")?.addEventListener("click", uninstallPackage);
  
  // Navigation buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const section = target.dataset.section;
      
      // Update active state
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      target.classList.add('active');
      
      // Show/hide sections
      document.querySelectorAll('main section').forEach(s => {
        (s as HTMLElement).style.display = 'none';
      });
      
      if (section === 'installations') {
        document.getElementById('installations-section')!.style.display = 'block';
      } else if (section === 'presets') {
        document.getElementById('presets-section')!.style.display = 'block';
      } else if (section === 'actions') {
        document.getElementById('actions-section')!.style.display = 'block';
      }
    });
  });

  // Drag and drop
  dropZone?.addEventListener("dragover", handleDragOver);
  dropZone?.addEventListener("dragleave", handleDragLeave);
  dropZone?.addEventListener("drop", handleDrop);

  // Initial load
  refreshInstallations();
  refreshPresets();
});
