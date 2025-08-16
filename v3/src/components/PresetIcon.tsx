export default function PresetIcon({ uuid }: { uuid: string }) {
    return (
        <img 
          className="preset-icon w-12 h-12 rounded-lg object-cover"
          src={`https://cdn.jsdelivr.net/gh/BetterRTX/presets@main/data/${uuid}/icon.png`}
          alt={`${uuid} icon`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
    );
}