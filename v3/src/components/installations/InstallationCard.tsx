import React from "react";
import { cx } from "classix";
import { useTranslation } from "react-i18next";
import PresetIcon from "../PresetIcon";
import BlockPath from "../ui/BlockPath";

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
    <PresetIcon uuid={installation.installed_preset.uuid} extra="max-w-24" />
  ) : null;

  return (
    <div
      className={cx(
        "installation-card",
        selected 
          ? "selected bg-brand-accent/5 border-brand-accent-600"
          : "bg-app-panel",
        installation.Preview ? "preview order-2" : ""
      )}
      data-path={installation.InstallLocation}
      onClick={handleCardClick}
    >
      <div className="flex flex-col w-full">
        {presetIcon || (
          <div className="installation-placeholder w-full h-32 bg-app-border/20 rounded flex items-center justify-center">
            <span className="text-app-muted text-sm">
              {installation.Preview ? "Preview" : "Minecraft"}
            </span>
          </div>
        )}
        <h3 className="installation-header" title={installation.InstallLocation}>
          {installation.FriendlyName}
          {installation.Preview && (
            <span className="preview-badge ml-2">Preview</span>
          )}
        </h3>
      </div>
      
      <div className={cx("installation-details", "overflow-hidden", !selected ? "max-h-0" : "max-h-full")}>
        <div className="flex flex-col gap-2 text-xs">
          {installation.installed_preset ? (
            <div className="installed-preset-info">
              <p className="text-sm font-medium">
                {t('current_preset', { name: installation.installed_preset.name })}
              </p>
              <p className="text-xs text-app-muted">
                Installed: {new Date(installation.installed_preset.installed_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="no-preset-info text-sm text-app-muted">
              {t('no_preset_installed')}
            </p>
          )}
          
          <div>
            <dt className="font-medium text-app-muted">Installation Path</dt>
            <dd>
              <BlockPath path={installation.InstallLocation} />
            </dd>
          </div>
        </div>
      </div>
      
    </div>
  );
};
