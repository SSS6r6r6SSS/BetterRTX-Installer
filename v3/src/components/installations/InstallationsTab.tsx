import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store/appStore";
import { InstallationCard, Installation } from "./InstallationCard";
import Button from "../ui/Button";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export default function InstallationsTab() {
  const { t } = useTranslation();
  const { installations, selectedInstallations, setSelectedInstallations, addInstallation } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInstallPath, setNewInstallPath] = useState("");
  const [newInstallName, setNewInstallName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleInstallationSelection = (path: string, selected: boolean): void => {
    const newSet = new Set(selectedInstallations);
    if (selected) {
      newSet.add(path);
    } else {
      newSet.delete(path);
    }
    setSelectedInstallations(newSet);
  };


  const handleAddInstallation = async (): Promise<void> => {
    if (!newInstallPath.trim()) return;
    
    setIsAdding(true);
    try {
      // Validate the path exists and contains a valid Minecraft installation
      const isValid = await invoke('validate_minecraft_path', { path: newInstallPath });
      
      if (isValid) {
        const newInstallation: Installation = {
          FriendlyName: newInstallName.trim() || 'Custom Installation',
          InstallLocation: newInstallPath,
          Preview: false,
        };
        
        addInstallation?.(newInstallation);
        setNewInstallPath('');
        setNewInstallName('');
        setShowAddForm(false);
      } else {
        alert(t('invalid_minecraft_path'));
      }
    } catch (error) {
      console.error('Error adding installation:', error);
      alert(t('error_adding_installation'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleBrowseFolder = async (): Promise<void> => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Minecraft Installation Folder'
      });
      if (selected) {
        setNewInstallPath(selected as string);
      }
    } catch (error) {
      console.error('Error opening folder dialog:', error);
    }
  };

  return (
    <section className="installations-container">
      <div className="section-toolbar mb-4">
        <div className="toolbar-title">
          <h2>{t('installations')}</h2>
          <span className="item-count">
            {installations.length} {t('found')}
          </span>
        </div>
        <div className="toolbar-actions">
          <Button
            className="btn btn--primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? t('cancel') : t('add_installation')}
          </Button>
        </div>
      </div>

      <div className="installations-list grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {showAddForm && (
          <div className="installation-card panel flex flex-col p-4 border-dashed border-2 border-brand-accent/50 bg-brand-accent/5">
            <h3 className="text-sm font-semibold mb-4 text-center">{t('add_custom_installation')}</h3>
            <div className="space-y-3 flex-1">
              <div className="field">
                <label className="field__label">{t('installation_name')}</label>
                <input
                  type="text"
                  className="field__input"
                  value={newInstallName}
                  onChange={(e) => setNewInstallName(e.target.value)}
                  placeholder={t('installation_name_placeholder')}
                />
              </div>
              <div className="field">
                <label className="field__label">{t('installation_path')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="field__input flex-1"
                    value={newInstallPath}
                    onChange={(e) => setNewInstallPath(e.target.value)}
                    placeholder={t('installation_path_placeholder')}
                  />
                  <Button
                    className="btn"
                    onClick={handleBrowseFolder}
                  >
                    {t('browse')}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                className="btn button--ghost flex-1"
                onClick={() => {
                  setShowAddForm(false);
                  setNewInstallPath('');
                  setNewInstallName('');
                }}
              >
                {t('cancel')}
              </Button>
              <Button
                className="btn btn--primary flex-1"
                onClick={handleAddInstallation}
                disabled={!newInstallPath.trim() || isAdding}
              >
                {isAdding ? t('adding') : t('add')}
              </Button>
            </div>
          </div>
        )}
        
        {installations.length > 0 ? (
          installations.map((installation) => (
            <InstallationCard
              key={installation.InstallLocation}
              installation={installation}
              selected={selectedInstallations.has(
                installation.InstallLocation
              )}
              onSelectionChange={handleInstallationSelection}
            />
          ))
        ) : (
          !showAddForm && (
            <div className="empty-state text-center py-8 col-span-full">
              <p>{t("installations_none_found")}</p>
              <p className="text-xs text-app-muted mt-2">
                {t("installations_none_found_hint")}
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
