import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import { InstallationCard } from "./InstallationCard";
import { StatusBarContainer } from "./StatusBar";
import { ConsolePanel } from "./ConsolePanel";
import { RtpackDialog } from "./RtpackDialog";
import { useAppStore } from "../store/appStore";
import { useStatusStore } from "../store/statusStore";
import AppHeader from "./AppHeader";
import ActionsTab from "./ActionsTab";
import PresetsTab from "./PresetsTab";

export const App: React.FC = () => {
  const { t } = useTranslation();
  const { addMessage } = useStatusStore();
  const [rtpackDialogOpen, setRtpackDialogOpen] = useState(false);
  const [rtpackPath, setRtpackPath] = useState("");
  const {
    installations,
    selectedInstallations,
    consoleOutput,
    activeTab,
    setSelectedInstallations,
    addConsoleOutput,
    clearConsole,
    refreshInstallations,
    refreshPresets,
  } = useAppStore();

  useEffect(() => {
    refreshInstallations();
    refreshPresets();
  }, [refreshInstallations, refreshPresets]);

  // Listen for rtpack file open events
  useEffect(() => {
    const unlisten = listen<string>("rtpack-file-opened", (event) => {
      setRtpackPath(event.payload);
      setRtpackDialogOpen(true);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // Handle file drops
  useEffect(() => {
    const unlisten = listen<string[]>("tauri://file-drop", (event) => {
      const paths = event.payload;
      for (const path of paths) {
        if (path.toLowerCase().endsWith(".rtpack")) {
          setRtpackPath(path);
          setRtpackDialogOpen(true);
          break; // Only handle the first .rtpack file
        }
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleInstallationSelection = (path: string, selected: boolean) => {
    const newSet = new Set(selectedInstallations);
    if (selected) {
      newSet.add(path);
    } else {
      newSet.delete(path);
    }
    setSelectedInstallations(newSet);
  };


  return (
    <div className="min-h-screen bg-app-bg text-app-fg">
      {/* Top toolbar with popover API */}
      <AppHeader />

      <StatusBarContainer />

      {/* Main content */}
      <main className="p-4 pb-32">
        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "installations" && (
            <section className="installations-container">
              <div className="section-toolbar flex justify-between items-center mb-4">
                <div className="toolbar-title">
                  <h2 className="text-lg font-semibold">
                    {t("installations_title")}
                  </h2>
                  <span className="text-sm opacity-75">
                    {t("installations_found_count", {
                      count: installations.length,
                    })}
                  </span>
                </div>
              </div>
              <div className="installations-list grid gap-4 sm:grid-cols-2">
                {installations.length > 0 ? (
                  installations.map((installation) => (
                    <InstallationCard
                      key={installation.InstallLocation}
                      installation={installation}
                      selected={selectedInstallations.has(
                        installation.InstallLocation
                      )}
                      onSelectionChange={handleInstallationSelection}
                    />
                  ))
                ) : (
                  <div className="empty-state text-center py-8">
                    <p>{t("installations_none_found")}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "presets" && (
            <PresetsTab />
          )}

          {activeTab === "actions" && (
            <ActionsTab />
          )}
        </div>
      </main>

      {/* Fixed Console Panel at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <ConsolePanel output={consoleOutput} onClear={clearConsole} />
      </div>

      {/* RTpack Dialog */}
      <RtpackDialog
        isOpen={rtpackDialogOpen}
        rtpackPath={rtpackPath}
        onClose={() => setRtpackDialogOpen(false)}
      />
    </div>
  );
};
