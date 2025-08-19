import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { copyFile, mkdir } from "@tauri-apps/plugin-fs";
import Button from "../ui/Button";
import { useAppStore } from "../../store/appStore";
import { useStatusStore } from "../../store/statusStore";
import InstallationInstanceModal from "../installations/InstallationInstanceModal";

export default function CreatorTab() {
  const { t } = useTranslation();
  const { installations } = useAppStore();
  const { addMessage } = useStatusStore();
  const [settingsHash, setSettingsHash] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInstall = async (selectedNames: string[]) => {
    if (selectedNames.length === 0) {
      addMessage({
        message: t("status_select_installation_warning"),
        type: "error",
      });
      return;
    }

    setIsProcessing(true);
    setIsModalOpen(false);
    try {
      await invoke("download_creator_settings", {
        settingsHash: settingsHash.trim(),
        selectedNames,
      });

      addMessage({
        message: t("creator_install_success", { hash: settingsHash.slice(0, 8) }),
        type: "success",
      });

      setSettingsHash("");
    } catch (error) {
      addMessage({
        message: t("creator_install_error", { error }),
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!settingsHash.trim()) {
      addMessage({
        message: t("creator_please_enter_hash"),
        type: "error",
      });
      return;
    }

    setIsModalOpen(true);
  };

  const handleHashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsHash(e.target.value);
  };

  const handleFileUpload = async () => {
    setIsProcessing(true);
    try {
      // Use Tauri dialog plugin to select file
      const filePath = await open({
        title: "Select .material.bin file",
        filters: [{
          name: "Material Files",
          extensions: ["material.bin"]
        }],
        multiple: false
      });

      if (!filePath) {
        setIsProcessing(false);
        return;
      }

      // Extract filename from path
      const filename = filePath.split(/[\\\/]/).pop() || "unknown";
      
      // Get BetterRTX directory and create creator/uploaded folder
      const brtxDir = await invoke("get_brtx_dir") as string;
      const targetDir = `${brtxDir}/creator/uploaded`;
      
      // Ensure target directory exists using fs plugin
      await mkdir(targetDir, { recursive: true });
      
      // Copy file to target directory using fs plugin
      const targetPath = `${targetDir}/${filename}`;
      await copyFile(filePath, targetPath);

      addMessage({
        message: t("creator_file_uploaded", { filename }),
        type: "success",
      });

      // Add to uploaded files list
      setUploadedFiles(prev => [...prev, filename]);
      
    } catch (error) {
      addMessage({
        message: t("creator_upload_error", { error }),
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = (filename: string) => {
    setUploadedFiles(prev => prev.filter(f => f !== filename));
    addMessage({
      message: t("creator_file_removed", { filename }),
      type: "info",
    });
  };

  const isValidHash = settingsHash.trim().length >= 8;

  return (
    <section className="creator-container">
      <div className="section-toolbar mb-4">
        <div className="toolbar-title">
          <h2 className="text-lg font-semibold">{t("creator_title")}</h2>
          <span className="text-sm opacity-75">
            {t("creator_subtitle")}
          </span>
        </div>
      </div>

      <div className="creator-content space-y-6">
        <div className="panel">
          <div className="panel__header">
            <h3 className="panel__title">{t("creator_install_title")}</h3>
          </div>
          <div className="panel__body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="field">
                <label className="field__label" htmlFor="settings-hash">
                  {t("creator_settings_hash")}
                </label>
                <div className="field__control">
                  <input
                    id="settings-hash"
                    type="text"
                    className="field__input font-mono"
                    placeholder={t("creator_settings_hash_placeholder")}
                    value={settingsHash}
                    onChange={handleHashChange}
                    disabled={isProcessing}
                  />
                </div>
                <p className="text-xs text-app-muted mt-1">
                  {t("creator_settings_hash_help")}
                </p>
              </div>

              <div className="form-actions">
                <Button
                  type="submit"
                  theme="primary"
                  disabled={isProcessing || !isValidHash}
                >
                  {isProcessing ? t("creator_installing") : t("creator_install_button")}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <h3 className="panel__title">{t("creator_material_files_title")}</h3>
          </div>
          <div className="panel__body">
            <div className="space-y-4">
              <p className="text-sm text-app-muted">
                {t("creator_material_files_subtitle")}
              </p>
              
              <div className="field">
                <label className="field__label">
                  {t("creator_upload_materials")}
                </label>
                <div className="field__control">
                  <Button
                    type="button"
                    theme="secondary"
                    onClick={handleFileUpload}
                    disabled={isProcessing}
                  >
                    {isProcessing ? t("creator_installing") : t("creator_select_files")}
                  </Button>
                </div>
                <p className="text-xs text-app-muted mt-1">
                  {t("creator_upload_dialog_help")}
                </p>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  <h4 className="text-sm font-medium mb-2">{t("creator_uploaded_files")}</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((filename, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-app-surface rounded border">
                        <span className="text-sm font-mono">{filename}</span>
                        <Button
                          type="button"
                          theme="secondary"
                          size="sm"
                          onClick={() => handleRemoveFile(filename)}
                          disabled={isProcessing}
                        >
                          {t("remove")}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <InstallationInstanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        installations={installations}
        presetName={`settings ${settingsHash.slice(0, 8)}...`}
        onInstall={handleInstall}
        isInstalling={isProcessing}
      />
    </section>
  );
}
