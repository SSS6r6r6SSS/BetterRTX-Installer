import React, { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebview } from "@tauri-apps/api/webview";

import { StatusBarContainer } from "./StatusBar";
import { ConsolePanel } from "./ConsolePanel";
import { RtpackDialog } from "./RtpackDialog";
import { DeepLinkDialog } from "./DeepLinkDialog";
import { useAppStore } from "../store/appStore";
import AppHeader from "./AppHeader";
import ActionsTab from "./ActionsTab";
import PresetsTab from "./PresetsTab";
import CreatorTab from "./creator/CreatorTab";
import { SideNav } from "./ui/SideNav";
import InstallationNav from "./installations/InstallationNav";
import InstallationsTab from "./installations/InstallationsTab";
import DropzoneIndicator from "./ui/DropzoneIndicator";

export const App: React.FC = () => {
  const [rtpackDialogOpen, setRtpackDialogOpen] = useState(false);
  const [rtpackPath, setRtpackPath] = useState("");
  const [deepLinkDialogOpen, setDeepLinkDialogOpen] = useState(false);
  const [deepLinkUrl, setDeepLinkUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const {
    consoleOutput,
    activeTab,
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

  // Listen for deep link protocol events
  useEffect(() => {
    const unlisten = listen<string>("deep-link-received", (event) => {
      setDeepLinkUrl(event.payload);
      setDeepLinkDialogOpen(true);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // Handle drag-n-drop indicator and file drops
  useEffect(() => {
    const setupDragDropListener = async () => {
      const webview = getCurrentWebview();
      const unlisten = await webview.onDragDropEvent((event) => {
        if (event.payload.type === 'enter') {
          setIsDragging(true);
        } else if (event.payload.type === 'drop') {
          setIsDragging(false);
          // Handle the dropped files
          const paths = event.payload.paths || [];
          for (const path of paths) {
            if (path.toLowerCase().endsWith(".rtpack")) {
              setRtpackPath(path);
              setRtpackDialogOpen(true);
              break; // Only handle the first .rtpack file
            }
          }
        } else if (event.payload.type === 'leave') {
          setIsDragging(false);
        }
      });

      return unlisten;
    };

    let unlisten: (() => void) | undefined;
    setupDragDropListener().then((fn) => {
      unlisten = fn;
    });

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return (
    <div className="app">
      <DropzoneIndicator isDragging={isDragging} />

      {/* Top Header */}
      <AppHeader />
      <div className="app-with-sidebar">
        {/* Sidebar Navigation */}
        <aside className="app-sidebar">
          <SideNav>
            <InstallationNav />
          </SideNav>
        </aside>

        {/* Main Application Area */}
        <div className="app-main">
          <StatusBarContainer />

          {/* Main Content Area */}
          <main className="app-content">
            <div className="main-content">
              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === "installations" && <InstallationsTab />}

                {activeTab === "presets" && <PresetsTab />}

                {activeTab === "actions" && <ActionsTab />}

                {activeTab === "creator" && <CreatorTab />}
              </div>
            </div>
          </main>

          {/* Fixed Console Panel at bottom */}
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <ConsolePanel output={consoleOutput} onClear={clearConsole} />
          </div>
        </div>

        {/* RTpack Dialog */}
        <RtpackDialog
          isOpen={rtpackDialogOpen}
          rtpackPath={rtpackPath}
          onClose={() => setRtpackDialogOpen(false)}
        />

        {/* Deep Link Dialog */}
        <DeepLinkDialog
          isOpen={deepLinkDialogOpen}
          deepLinkUrl={deepLinkUrl}
          onClose={() => setDeepLinkDialogOpen(false)}
        />
      </div>
    </div>
  );
};
