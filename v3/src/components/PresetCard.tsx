import React from "react";
import { useTranslation } from "react-i18next";
import { cx } from "classix";
import Button from "./ui/Button";

export interface PackInfo {
  name: string;
  uuid: string;
  slug?: string;
  stub: string;
  tonemapping: string;
  bloom: string;
}

interface PresetCardProps {
  preset: PackInfo;
  selected?: boolean;
  isInstalling?: boolean;
  onSelectionChange?: (uuid: string, selected: boolean) => void;
  onInstall?: (uuid: string) => void;
}

export const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  selected = false,
  isInstalling = false,
  onSelectionChange,
  onInstall,
}) => {
  const { t } = useTranslation();
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".install-preset-btn")) return;

    const newSelected = !selected;
    onSelectionChange?.(preset.uuid, newSelected);
  };

  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInstall?.(preset.uuid);
  };

  return (
    <div
      className={cx(
        "preset-card",
        selected 
          ? "selected bg-brand-accent/5 border-brand-accent-600"
          : "bg-app-panel"
      )}
      data-uuid={preset.uuid}
      onClick={handleCardClick}
    >
      <div className="flex flex-col w-full">
      <img
        className="preset-icon w-full h-auto"
        src={`https://cdn.jsdelivr.net/gh/BetterRTX/presets@main/data/${preset.uuid}/icon.png`}
        alt={`${preset.name} icon`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <h3 className="preset-header">
        {preset.name}
      </h3>
      </div>
      <div className={cx("preset-details", "overflow-hidden", !selected ? "max-h-0" : "max-h-full")}>
        <div className="flex flex-col gap-1 text-xs">
          <p>View on <a className="preset-link" href={`https://bedrock.graphics/presets/${preset.slug ?? preset.uuid}`} target="_blank">bedrock.graphics</a></p>
          <dl>
            <dt>Stub</dt>
            <dd>
              <div className="preset-stub-container">
                <a className="preset-stub-link" href={preset.stub} target="_blank" rel="noopener noreferrer">{preset.stub}</a>
              </div>
            </dd>
            <dt>Tonemapping</dt>
            <dd>
              <div className="preset-stub-container">
                <a className="preset-stub-link" href={preset.tonemapping} target="_blank" rel="noopener noreferrer">{preset.tonemapping}</a>
              </div>
            </dd>
            <dt>Bloom</dt>
            <dd>
              <div className="preset-stub-container">
                <a className="preset-stub-link" href={preset.bloom} target="_blank" rel="noopener noreferrer">{preset.bloom}</a>
              </div>
            </dd>
          </dl>
        </div>
      </div>
      <Button
        className={cx(
          "btn",
          !isInstalling && "btn--primary",
          "h-min sm:w-fit"
        )}
        onClick={handleInstallClick}
        disabled={isInstalling}
        data-uuid={preset.uuid}
      >
        {isInstalling ? t("installing") : t("install")}
      </Button>
    </div>
  );
};
