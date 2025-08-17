
import { useTranslation } from "react-i18next";
import PresetIcon from "../PresetIcon";
import { useAppStore } from "../../store/appStore";


export default function InstallationNav() {
    const { t } = useTranslation();
    const { installations } = useAppStore();
    // Show the currently installed preset icons in the nav
    const installedPresets = installations.map((installation) => {
        if (!installation.installed_preset) return null;

        return {
            uuid: installation.installed_preset.uuid,
            name: installation.installed_preset.name,
            installed_at: installation.installed_preset.installed_at,
            installation
        }
    }).filter((preset) => preset !== null);

  return (
    <div className="flex flex-col gap-2 p-2">
      {installedPresets.map((preset) => (
        <div key={preset.uuid} className="flex flex-row items-center gap-2 cursor-pointer" title={t('open_installation', { installation: preset.installation.FriendlyName })} onClick={() => {
            if (preset.installation.Preview) {
                window.open(`minecraft-preview://`);
                return;
            }

            window.open(`minecraft://`);
        }}>
          <PresetIcon uuid={preset.uuid} extra="max-w-16" />
          <div className="flex flex-col items-start gap-2">
            <h3 className="m-0 text-sm font-semibold text-app-fg" title={preset.installation.InstallLocation}>
              {preset.installation.FriendlyName}
            </h3>
            <span className="text-xs opacity-75">{preset.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}