import { cx } from "classix";

export default function PresetIcon({ uuid, size, extra }: { uuid: string; size?: string; extra?: string }) {
  return (
    <img
      className={cx("preset-icon rounded-lg object-cover w-full h-auto border border-white/50", size === "lg" ? "size-16" : "size-12", extra)}
      src={`https://cdn.jsdelivr.net/gh/BetterRTX/presets@main/data/${uuid}/icon.png`}
      alt={`${uuid} icon`}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
