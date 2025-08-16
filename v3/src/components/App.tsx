import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { Settings } from 'lucide-react';
import { ToolbarSection } from './ToolbarSection';
import { PresetCard } from './PresetCard';
import { InstallationCard } from './InstallationCard';
import { StatusBarContainer } from './StatusBar';
import { ConsolePanel } from './ConsolePanel';
import { useAppStore } from '../store/appStore';
import { useStatusStore } from '../store/statusStore';

export const App: React.FC = () => {
    const { t } = useTranslation();
  const { addMessage } = useStatusStore();
  const {
    installations,
    presets,
    selectedInstallations,
    selectedPreset,
    consoleOutput,
    activeTab,
    toolbarOpen,
    setSelectedInstallations,
    setSelectedPreset,
    setActiveTab,
    setToolbarOpen,
    addConsoleOutput,
    clearConsole,
    refreshInstallations,
    refreshPresets,
    clearCache
  } = useAppStore();

  useEffect(() => {
    refreshInstallations();
    refreshPresets();
  }, [refreshInstallations, refreshPresets]);


  const handleInstallationSelection = (path: string, selected: boolean) => {
    const newSet = new Set(selectedInstallations);
    if (selected) {
      newSet.add(path);
    } else {
      newSet.delete(path);
    }
    setSelectedInstallations(newSet);
  };

  const handlePresetSelection = (uuid: string, selected: boolean) => {
    setSelectedPreset(selected ? uuid : null);
  };

  const handlePresetInstall = async (uuid: string) => {
    if (selectedInstallations.size === 0) {
      addMessage({ message: t('status_select_installation_warning'), type: 'error' });
      return;
    }

    try {
      addMessage({ message: t('status_installing_preset'), type: 'loading' });
      addConsoleOutput(t('log_installing_preset', { uuid, count: selectedInstallations.size }));
      
      for (const installPath of selectedInstallations) {
        await invoke('install_preset', { uuid, installPath });
        addConsoleOutput(t('log_installed_to', { installPath }));
      }
      
      addMessage({ message: t('status_install_success'), type: 'success' });
      addConsoleOutput(t('log_install_complete'));
      // Refresh installations to show updated preset info
      await refreshInstallations();
    } catch (error) {
      const errorMsg = t('status_install_error', { error });
      addMessage({ message: errorMsg, type: 'error' });
      addConsoleOutput(errorMsg);
    }
  };

  const handleSettings = () => {
    addConsoleOutput(t('log_settings_clicked'));
  };

  const handleHelp = () => {
    addConsoleOutput(t('log_help_clicked'));
  };

  const handleAbout = () => {
    addConsoleOutput(t('log_about_clicked'));
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-fg">
      {/* Top toolbar with popover API */}
      <header className="top-toolbar">
        <div className="toolbar-left">
          <nav className="nav-tabs">
            <button 
              className={`nav-btn ${activeTab === 'installations' ? 'active' : ''}`}
              onClick={() => setActiveTab('installations')}
            >
              {t('tab_installations')}
            </button>
            <button 
              className={`nav-btn ${activeTab === 'presets' ? 'active' : ''}`}
              onClick={() => setActiveTab('presets')}
            >
              {t('tab_presets')}
            </button>
            <button 
              className={`nav-btn ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              {t('tab_actions')}
            </button>
          </nav>
        </div>
        <div className="toolbar-right">
          {/* Menu button to show toolbar */}
          <button 
            id="toolbar-menu-btn" 
            className="toolbar-menu-btn"
            onClick={() => setToolbarOpen(!toolbarOpen)}
            aria-expanded={toolbarOpen}
            aria-controls="toolbar-popover"
          >
            <Settings size={16} />
          </button>
          
          {/* Toolbar popover */}
          <div 
            id="toolbar-popover" 
            className={`toolbar-popover ${toolbarOpen ? 'block' : 'hidden'}`}
            role="dialog"
            aria-modal="false"
            aria-label={t('toolbar_options_label')}
          >
            <ToolbarSection
              onSettingsClick={handleSettings}
              onHelpClick={handleHelp}
              onRefreshClick={refreshInstallations}
              onForceRefreshClick={() => refreshPresets(true)}
              onClearCacheClick={clearCache}
              onAboutClick={handleAbout}
            />
          </div>
        </div>
      </header>

      <StatusBarContainer />

      {/* Main content */}
      <main className="p-4 pb-32">
        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'installations' && (
            <section className="installations-container">
              <div className="section-toolbar flex justify-between items-center mb-4">
                <div className="toolbar-title">
                  <h2 className="text-lg font-semibold">{t('installations_title')}</h2>
                  <span className="text-sm opacity-75">{t('installations_found_count', { count: installations.length })}</span>
                </div>
              </div>
              <div className="installations-list grid gap-4 grid-cols-2">
                {installations.length > 0 ? (
                  installations.map((installation) => (
                    <InstallationCard
                      key={installation.InstallLocation}
                      installation={installation}
                      selected={selectedInstallations.has(installation.InstallLocation)}
                      onSelectionChange={handleInstallationSelection}
                    />
                  ))
                ) : (
                  <div className="empty-state text-center py-8">
                    <p>{t('installations_none_found')}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'presets' && (
            <section className="presets-container">
              <div className="section-toolbar flex justify-between items-center mb-4">
                <div className="toolbar-title">
                  <h2 className="text-lg font-semibold">{t('presets_title')}</h2>
                  <span className="text-sm opacity-75">{t('presets_loaded_count', { count: presets.length })}</span>
                </div>
              </div>
              <div className="presets-list grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {presets.length > 0 ? (
                  presets.map((preset) => (
                    <PresetCard
                      key={preset.uuid}
                      preset={preset}
                      selected={selectedPreset === preset.uuid}
                      onSelectionChange={handlePresetSelection}
                      onInstall={handlePresetInstall}
                    />
                  ))
                ) : (
                  <div className="empty-state text-center py-8 col-span-full">
                    <p>{t('presets_none_available')}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'actions' && (
            <section className="actions-container">
              <div className="section-toolbar mb-4">
                <h2 className="text-lg font-semibold">{t('actions_title')}</h2>
              </div>
              <div className="actions-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <button className="action-btn p-4 rounded-lg border text-left hover:bg-opacity-80 transition-colors bg-app-panel border-app-border">
                  <h3 className="font-semibold mb-2">{t('action_install_rtpack_title')}</h3>
                  <p className="text-sm opacity-75">{t('action_install_rtpack_desc')}</p>
                </button>
                <button className="action-btn p-4 rounded-lg border text-left hover:bg-opacity-80 transition-colors bg-app-panel border-app-border">
                  <h3 className="font-semibold mb-2">{t('action_install_materials_title')}</h3>
                  <p className="text-sm opacity-75">{t('action_install_materials_desc')}</p>
                </button>
                <button className="action-btn p-4 rounded-lg border text-left hover:bg-opacity-80 transition-colors bg-app-panel border-app-border">
                  <h3 className="font-semibold mb-2">{t('action_backup_title')}</h3>
                  <p className="text-sm opacity-75">{t('action_backup_desc')}</p>
                </button>
              </div>
            </section>
          )}
        </div>

      </main>

      {/* Fixed Console Panel at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <ConsolePanel 
          output={consoleOutput}
          onClear={clearConsole}
        />
      </div>
    </div>
  );
};
