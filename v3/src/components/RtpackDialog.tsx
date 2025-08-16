import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../store/appStore";
import { useStatusStore } from "../store/statusStore";

interface RtpackDialogProps {
  isOpen: boolean;
  rtpackPath: string;
  onClose: () => void;
}

export const RtpackDialog: React.FC<RtpackDialogProps> = ({
  isOpen,
  rtpackPath,
  onClose,
}) => {
  const { t } = useTranslation();
  const { installations, refreshInstallations } = useAppStore();
  const { addMessage } = useStatusStore();
  const [selectedInstallations, setSelectedInstallations] = useState<Set<string>>(new Set());
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (isOpen && installations.length === 0) {
      refreshInstallations();
    }
  }, [isOpen, installations.length, refreshInstallations]);

  const handleInstallationToggle = (installLocation: string) => {
    const newSet = new Set(selectedInstallations);
    if (newSet.has(installLocation)) {
      newSet.delete(installLocation);
    } else {
      newSet.add(installLocation);
    }
    setSelectedInstallations(newSet);
  };

  const handleInstall = async () => {
    if (selectedInstallations.size === 0) {
      addMessage({
        message: t("status_select_installation_warning"),
        type: "error",
      });
      return;
    }

    setIsInstalling(true);
    try {
      addMessage({ message: t("status_installing_rtpack"), type: "loading" });
      
      await invoke("install_from_rtpack", {
        rtpackPath,
        selectedNames: Array.from(selectedInstallations),
      });

      addMessage({ message: t("status_install_success"), type: "success" });
      await refreshInstallations();
      onClose();
    } catch (error) {
      const errorMsg = t("status_install_error", { error });
      addMessage({ message: errorMsg, type: "error" });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedInstallations.size === installations.length) {
      setSelectedInstallations(new Set());
    } else {
      setSelectedInstallations(new Set(installations.map(i => i.InstallLocation)));
    }
  };

  if (!isOpen) return null;

  const fileName = rtpackPath.split(/[\\\/]/).pop() || rtpackPath;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("rtpack_dialog_title")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            disabled={isInstalling}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {t("rtpack_dialog_description")}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded">
            {fileName}
          </p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("select_minecraft_instances")}
            </h3>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              disabled={isInstalling}
            >
              {selectedInstallations.size === installations.length ? t("deselect_all") : t("select_all")}
            </button>
          </div>

          {installations.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">{t("no_minecraft_installations")}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {installations.map((installation) => (
                <label
                  key={installation.InstallLocation}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedInstallations.has(installation.InstallLocation)}
                    onChange={() => handleInstallationToggle(installation.InstallLocation)}
                    disabled={isInstalling}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {installation.FriendlyName}
                    </p>
                    {installation.Preview && (
                      <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full">
                        {t("preview")}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isInstalling}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 rounded-md disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleInstall}
            disabled={isInstalling || selectedInstallations.size === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md disabled:opacity-50"
          >
            {isInstalling ? t("installing") : t("install")}
          </button>
        </div>
      </div>
    </div>
  );
};
