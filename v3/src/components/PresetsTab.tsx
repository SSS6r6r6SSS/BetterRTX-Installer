import { PresetCard } from "./PresetCard";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/appStore";
import { usePresetsStore } from "../store/presetsStore";

export default function PresetsTab() {
    const { t } = useTranslation();
    const { presets } = useAppStore();
    const { 
        selectedPreset, 
        installingPresets, 
        handlePresetSelection, 
        handlePresetInstall 
    } = usePresetsStore();

    const onPresetInstall = (uuid: string) => handlePresetInstall(uuid, t);

    return (
        <section className="presets-container">
            <div className="section-toolbar flex justify-between items-center mb-4">
                <div className="toolbar-title">
                    <h2 className="text-lg font-semibold">
                        {t("presets_title")}
                    </h2>
                    <span className="text-sm opacity-75">
                        {t("presets_loaded_count", { count: presets.length })}
                    </span>
                </div>
            </div>
            <div className="presets-list">
                {presets.length > 0 ? (
                    presets.map((preset) => (
                        <PresetCard
                            key={preset.uuid}
                            preset={preset}
                            selected={selectedPreset === preset.uuid}
                            isInstalling={installingPresets.has(preset.uuid)}
                            onSelectionChange={handlePresetSelection}
                            onInstall={onPresetInstall}
                        />
                    ))
                ) : (
                    <div className="empty-state text-center py-8 col-span-full">
                        <p>{t("presets_none_available")}</p>
                    </div>
                )}
            </div>
        </section>
    )
}