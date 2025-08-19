import { useAppStore } from "../../store/appStore";
import { useStatusStore } from "../../store/statusStore";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import Button from "../ui/Button";
import SelectInstallationsDialog from "../SelectInstallationsDialog";
import { CheckCircle } from "lucide-react";

export default function ActionsTab() {
  const { t } = useTranslation();
  const { addMessage } = useStatusStore();
  const {
    installRTX,
    updateOptions,
    backupSupportFiles,
  } = useAppStore();
  const [isProtocolRegistered, setIsProtocolRegistered] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"dlss" | "update" | "backup" | null>(
    null
  );


  const openSelectDialog = (type: "dlss" | "update" | "backup"): void => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  const closeSelectDialog = (): void => {
    setActionDialogOpen(false);
    setActionType(null);
  };

  const handleActionConfirm = async (paths: string[]): Promise<boolean> => {
    try {
      if (actionType === "dlss") {
        addMessage({ message: t("status_installing_dlss", "Installing DLSS..."), type: "loading" });
        for (const p of paths) {
          await installRTX(p);
        }
        addMessage({ message: t("status_install_dlss_success", "DLSS installed successfully"), type: "success" });
        return true;
      }
      if (actionType === "update") {
        addMessage({ message: t("updating_options", "Updating options..."), type: "loading" });
        for (const p of paths) {
          await updateOptions(p);
        }
        addMessage({ message: t("status_update_options_success", "Options updated successfully"), type: "success" });
        return true;
      }
      if (actionType === "backup") {
        addMessage({ message: t("backing_up", "Creating backups..."), type: "loading" });
        for (const p of paths) {
          await backupSupportFiles(p);
        }
        addMessage({ message: t("status_backup_success", "Backups completed successfully"), type: "success" });
        return true;
      }
      return false;
    } catch (error) {
      addMessage({ message: String(error), type: "error" });
      return false;
    }
  };

  const checkProtocolStatus = async () => {
    try {
      const registered = await invoke<boolean>("is_brtx_protocol_registered");
      setIsProtocolRegistered(registered);
    } catch (error) {
      console.error("Failed to check protocol status:", error);
    }
  };

  const handleProtocolToggle = async (checked: boolean) => {
    if (checked) {
      try {
        await invoke("register_brtx_protocol");
        setIsProtocolRegistered(true);
        addMessage({
          message: t("status_register_protocol_success"),
          type: "success",
        });
      } catch (error) {
        addMessage({
          message: t("status_register_protocol_error", { error: String(error) }),
          type: "error",
        });
      }
    }
    // Note: We don't handle unregistration as it's typically not needed
  };

  useEffect(() => {
    checkProtocolStatus();
  }, []);

  return (
    <section className="actions-container">
      <div className="section-toolbar mb-4">
        <h2 className="text-lg font-semibold">{t("actions_title")}</h2>
      </div>
      <div className="actions-grid flex flex-col">
        <div className="action-btn p-4 rounded-lg border bg-app-panel border-app-border w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col flex-grow-1 w-full">
              <h3 className="font-semibold mb-2">
                {t("action_install_dlss_title")}
              </h3>
              <p className="text-sm opacity-75">{t("action_install_dlss_desc")}</p>
            </div>
            <div className="ml-4">
              <Button
                theme="primary"
                size="md"
                onClick={() => openSelectDialog("dlss")}
              >
                {t("install")}
              </Button>
            </div>
          </div>
        </div>
        <div className="action-btn p-4 rounded-lg border bg-app-panel border-app-border w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col flex-grow-1 w-full">
              <h3 className="font-semibold mb-2">
                {t("action_update_options_title")}
              </h3>
              <p className="text-sm opacity-75">
                {t("action_update_options_desc")}
              </p>
            </div>
            <div className="ml-4">
              <Button
                theme="primary"
                size="md"
                onClick={() => openSelectDialog("update")}
              >
                {t("update")}
              </Button>
            </div>
          </div>
        </div>
        <div className="action-btn p-4 rounded-lg border bg-app-panel border-app-border w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col flex-grow-1 w-full">
              <h3 className="font-semibold mb-2">{t("action_backup_title")}</h3>
              <p className="text-sm opacity-75">{t("action_backup_desc")}</p>
            </div>
            <div className="ml-4">
              <Button
                theme="primary"
                size="md"
                onClick={() => openSelectDialog("backup")}
              >
                {t("backup")}
              </Button>
            </div>
          </div>
        </div>
        <div className="action-btn p-4 rounded-lg border bg-app-panel border-app-border w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col flex-grow-1 w-full">
              <h3 className="font-semibold mb-2">{t("action_register_protocol_title")}</h3>
              <p className="text-sm opacity-75">
                {t("action_register_protocol_desc")}
              </p>
            </div>
            <div className="ml-4">
              <Button
                theme="secondary"
                size="md"
                disabled={isProtocolRegistered}
                onClick={() => handleProtocolToggle(true)}
              >
                {isProtocolRegistered ? <CheckCircle /> : t("register")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <SelectInstallationsDialog
        isOpen={actionDialogOpen}
        onClose={closeSelectDialog}
        title={
          actionType === "dlss"
            ? t("dialog_install_dlss_title", "Install DLSS")
            : actionType === "update"
            ? t("dialog_update_options_title", "Update Options")
            : actionType === "backup"
            ? t("dialog_backup_title", "Backup Selected")
            : ""
        }
        description={
          actionType === "dlss"
            ? t(
                "dialog_install_dlss_desc",
                "Select which Minecraft instances to install DLSS to"
              )
            : actionType === "update"
            ? t(
                "dialog_update_options_desc",
                "Select which Minecraft instances to update options for"
              )
            : actionType === "backup"
            ? t(
                "dialog_backup_desc",
                "Select which Minecraft instances to back up"
              )
            : undefined
        }
        confirmKey={
          actionType === "dlss"
            ? "install_to_selected"
            : actionType === "update"
            ? "update_to_selected"
            : "backup_to_selected"
        }
        busyKey={
          actionType === "dlss"
            ? "installing"
            : actionType === "update"
            ? "updating_options"
            : "backing_up"
        }
        onConfirm={handleActionConfirm}
      />
    </section>
  );
}
