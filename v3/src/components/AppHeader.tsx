import { useAppStore } from "../store/appStore";
import { useTranslation } from "react-i18next";
import { Settings } from "lucide-react";
import { ToolbarSection } from "./ToolbarSection";
import Logo from "./Logo";

export default function AppHeader() {
  const {
    toolbarOpen,
    setToolbarOpen,
  } = useAppStore();
  const { t } = useTranslation();
  return (
    <header className="top-toolbar">
      <div className="toolbar-left">
        <Logo width={163} height={32} />
      </div>
      
      <div className="toolbar-right">
        {/* Menu button to show toolbar */}
        <button
          id="toolbar-menu-btn"
          className="toolbar-menu-btn"
          onClick={() => setToolbarOpen(!toolbarOpen)}
          aria-expanded={toolbarOpen}
          aria-controls="toolbar-popover"
        >
          <Settings size={16} />
        </button>

        {/* Toolbar popover */}
        <div
          id="toolbar-popover"
          className={`toolbar-popover ${toolbarOpen ? "block" : "hidden"}`}
          role="dialog"
          aria-modal="false"
          aria-label={t("toolbar_options_label")}
        >
          <ToolbarSection />
        </div>
      </div>
    </header>
  );
}
