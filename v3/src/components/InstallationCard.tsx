import React from "react";
import { cx } from "classix";
import PresetIcon from "./PresetIcon";
import Switch from "./ui/Switch";

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
  const handleSwitchChange = (isSelected: boolean) => {
    onSelectionChange?.(installation.InstallLocation, isSelected);
  };

  const switchId = `install-${installation.InstallLocation.replace(
    /[^a-zA-Z0-9]/g,
    ""
  )}`;

  const presetIcon = installation.installed_preset ? (
    <PresetIcon uuid={installation.installed_preset.uuid} />
  ) : null;

  return (
    <div
      className={cx(
        "installation-card rounded-lg border p-4 transition-all duration-200",
        selected
          ? "selected bg-brand-accent/5 border-brand-accent-600"
          : "bg-app-panel border-app-border",
        installation.Preview ? "preview order-2" : ""
      )}
      data-path={installation.InstallLocation}
    >
      <div className="installation-header flex justify-between items-center mb-2">
        <div className="installation-title flex items-center gap-2">
          {presetIcon}
          <h3 className="m-0 text-base font-semibold text-app-fg">
            {installation.FriendlyName}
          </h3>
        </div>
        {installation.Preview && (
          <span className="preview-badge px-2 py-0.5 rounded text-xs font-semibold text-white bg-brand-accent-600">
            Preview
          </span>
        )}
      </div>

      <p className="installation-path">{installation.InstallLocation}</p>

      {installation.installed_preset ? (
        <p className="installed-preset-info text-sm my-2 text-success-600">
          Current preset: {installation.installed_preset.name}
        </p>
      ) : (
        <p className="no-preset-info text-sm my-2 text-app-muted">
          No preset installed
        </p>
      )}

      <div className="installation-actions mt-3">
        <Switch
          id={switchId}
          checked={selected}
          onCheckedChange={handleSwitchChange}
          label="Select for installation"
        />
      </div>
    </div>
  );
};
