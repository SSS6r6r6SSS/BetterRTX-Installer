import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Button from "../ui/Button";
import { useAppStore } from "../../store/appStore";
import { useStatusStore } from "../../store/statusStore";
import InstallationInstanceModal from "../installations/InstallationInstanceModal";

export default function CreatorTab() {
  const { installations } = useAppStore();
  const { addMessage } = useStatusStore();
  const [settingsHash, setSettingsHash] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInstall = async (selectedNames: string[]) => {
    if (selectedNames.length === 0) {
      addMessage({
        message: "Please select at least one installation",
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
        message: `Successfully installed creator settings ${settingsHash.slice(0, 8)}...`,
        type: "success",
      });
      
      setSettingsHash("");
    } catch (error) {
      addMessage({
        message: `Installation failed: ${error}`,
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
        message: "Please enter a settings hash",
        type: "error",
      });
      return;
    }

    setIsModalOpen(true);
  };

  const handleHashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsHash(e.target.value);
  };

  const isValidHash = settingsHash.trim().length >= 8;

  return (
    <section className="creator-container">
      <div className="section-toolbar mb-4">
        <div className="toolbar-title">
          <h2 className="text-lg font-semibold">Creator Settings</h2>
          <span className="text-sm opacity-75">
            Install custom creator settings using a settings hash
          </span>
        </div>
      </div>

      <div className="creator-content space-y-6">
        <div className="panel">
          <div className="panel__header">
            <h3 className="panel__title">Install Creator Settings</h3>
          </div>
          <div className="panel__body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="field">
                <label className="field__label" htmlFor="settings-hash">
                  Settings Hash
                </label>
                <div className="field__control">
                  <input
                    id="settings-hash"
                    type="text"
                    className="field__input font-mono"
                    placeholder="Enter settings hash"
                    value={settingsHash}
                    onChange={handleHashChange}
                    disabled={isProcessing}
                  />
                </div>
                <p className="text-xs text-app-muted mt-1">
                  The settings hash from bedrock.graphics creator tools
                </p>
              </div>

              <div className="form-actions">
                <Button
                  type="submit"
                  theme="primary"
                  disabled={isProcessing || !isValidHash}
                >
                  {isProcessing ? "Installing..." : "Install Creator Settings"}
                </Button>
              </div>
            </form>
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
