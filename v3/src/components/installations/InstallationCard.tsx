import React from "react";
import { cx } from "classix";
import { useTranslation } from "react-i18next";
import PresetIcon from "../presets/PresetIcon";

export interface Installation {
  FriendlyName: string;
  InstallLocation: string;
  Preview: boolean;
  installed_preset?: {
    uuid: string;
    name: string;
    installed_at: string;
  };
}

interface InstallationCardProps {
  installation: Installation;
  selected?: boolean;
  onSelectionChange?: (path: string, selected: boolean) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString().replace(/\//g, "-");
};

export const InstallationCard: React.FC<InstallationCardProps> = ({
  installation,
  selected = false,
  onSelectionChange,
}) => {
  const { t } = useTranslation();

  const handleCardClick = () => {
    const newSelected = !selected;
    onSelectionChange?.(installation.InstallLocation, newSelected);
  };

  const presetIcon = installation.installed_preset ? (
    <PresetIcon uuid={installation.installed_preset.uuid} extra="max-w-24 ml-2" />
  ) : null;

  return (
    <div
      className={cx(
        "installation-card",
        selected && "selected",
        installation.Preview && "preview order-2"
      )}
      data-path={installation.InstallLocation}
      onClick={handleCardClick}
    >
        <h3
          className="installation-header"
          title={installation.InstallLocation}
        >
          {installation.FriendlyName}
          {installation.Preview && (
            <span className="preview-badge ml-2">Preview</span>
          )}
        </h3>

        

        <div
          className={cx(
            "installation-details",
            "overflow-hidden items-center py-2"
          )}
        >
          {presetIcon || (
          <div className="installation-placeholder w-full h-32 bg-app-border/20 rounded flex items-center justify-center">
            <span className="text-app-muted text-sm">
              {installation.Preview ? "Preview" : "Minecraft"}
            </span>
          </div>
        )}
            {installation.installed_preset ? (
              <div className="installed-preset-info">
                <h4 className="text-xs font-medium text-app-muted uppercase tracking-wider mb-0.5 whitespace-nowrap">
                  {t("current_preset")}
                </h4>
                <p>{installation.installed_preset.name}</p>
                <time className="text-xs text-app-muted whitespace-nowrap">
                  {t("install_date", {
                    date: formatDate(installation.installed_preset.installed_at),
                  })}
                </time>
              </div>
            ) : (
              <p className="no-preset-info text-sm text-app-muted">
                {t("no_preset_installed")}
              </p>
            )}
        </div>

      <footer className="installation-footer flex items-center justify-between overflow-auto w-full">
        <p className="text-xs text-app-muted whitespace-nowrap flex-1 truncate min-w-0 max-w-[calc(100vw-20rem)]" title={installation.InstallLocation}>
          {installation.InstallLocation}
        </p>
      </footer>
    </div>
  );
};
