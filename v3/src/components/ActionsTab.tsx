import { useAppStore } from "../store/appStore";
import { useStatusStore } from "../store/statusStore";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";

export default function ActionsTab() {
    const { t } = useTranslation();
    const { addMessage } = useStatusStore();
    const { selectedInstallations, installRTX, updateOptions, backupSupportFiles } = useAppStore();

    const handleActionClick = (actionFn: (installPath: string) => Promise<void>) => {
        if (selectedInstallations.size === 0) {
            addMessage({
                message: t("status_select_installation_warning"),
                type: "error",
            });
            return;
        }

        for (const installPath of selectedInstallations) {
            actionFn(installPath);
        }
    };

    const handleRegisterProtocol = async () => {
        try {
            await invoke("register_brtx_protocol");
            addMessage({
                message: "Successfully registered brtx:// protocol",
                type: "success",
            });
        } catch (error) {
            addMessage({
                message: `Failed to register protocol: ${error}`,
                type: "error",
            });
        }
    };

    return (
        <section className="actions-container">
            <div className="section-toolbar mb-4">
                <h2 className="text-lg font-semibold">{t("actions_title")}</h2>
            </div>
            <div className="actions-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <button
                    className="action-btn p-4 rounded-lg border text-left hover:bg-opacity-80 transition-colors bg-app-panel border-app-border"
                    onClick={() => handleActionClick(installRTX)}
                >
                    <h3 className="font-semibold mb-2">
                        {t("action_install_dlss_title")}
                    </h3>
                    <p className="text-sm opacity-75">
                        {t("action_install_dlss_desc")}
                    </p>
                </button>
                <button
                    className="action-btn p-4 rounded-lg border text-left hover:bg-opacity-80 transition-colors bg-app-panel border-app-border"
                    onClick={() => handleActionClick(updateOptions)}
                >
                    <h3 className="font-semibold mb-2">
                        {t("action_update_options_title")}
                    </h3>
                    <p className="text-sm opacity-75">
                        {t("action_update_options_desc")}
                    </p>
                </button>
                <button
                    className="action-btn p-4 rounded-lg border text-left hover:bg-opacity-80 transition-colors bg-app-panel border-app-border"
                    onClick={() => handleActionClick(backupSupportFiles)}
                >
                    <h3 className="font-semibold mb-2">
                        {t("action_backup_title")}
                    </h3>
                    <p className="text-sm opacity-75">
                        {t("action_backup_desc")}
                    </p>
                </button>
                <button
                    className="action-btn p-4 rounded-lg border text-left hover:bg-opacity-80 transition-colors bg-app-panel border-app-border"
                    onClick={handleRegisterProtocol}
                >
                    <h3 className="font-semibold mb-2">
                        Register Protocol
                    </h3>
                    <p className="text-sm opacity-75">
                        Register brtx:// protocol for deep links
                    </p>
                </button>
            </div>
        </section>
    )
}