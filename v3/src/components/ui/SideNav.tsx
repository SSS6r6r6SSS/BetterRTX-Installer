import React from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store/appStore";
import { cx } from "classix";
import {
    Home,
    Package,
    Wrench,
    Palette
} from "lucide-react";

interface SideNavProps {
    className?: string;
    children?: React.ReactNode;
}

export const SideNav: React.FC<SideNavProps> = ({ className, children }) => {
    const { activeTab, setActiveTab } = useAppStore();
    const { t } = useTranslation();

    const navItems = [
        {
            id: "presets" as const,
            label: t("tab_presets"),
            icon: Package,
            description: "Browse and install RTX presets"
        },
        {
            id: "creator" as const,
            label: "Creator",
            icon: Palette,
            description: "Create custom presets"
        },
        {
            id: "actions" as const,
            label: t("tab_actions"),
            icon: Wrench,
            description: "Quick actions and tools"
        },
        {
            id: "installations" as const,
            label: t("tab_installations"),
            icon: Home,
            description: "Manage your Minecraft installations"
        },
    ];

    return (
        <nav className={cx("sidebar-nav", className)}>
            <div className="sidebar-nav__header">
                <h2 className="sidebar-nav__title">{t("currently_installed")}</h2>
            </div>
            {children}

            <div className="sidebar-nav__header">
                <h2 className="sidebar-nav__title">{t("navigation")}</h2>
            </div>
            <div className="sidebar-nav__content">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            className={cx(
                                "sidebar-nav__item",
                                isActive ? "sidebar-nav__item--active" : "cursor-pointer"
                            )}
                            onClick={() => setActiveTab(item.id)}
                            title={item.description}
                        >
                            <div className="sidebar-nav__item-icon">
                                <Icon size={20} />
                            </div>
                            <div className="sidebar-nav__item-content">
                                <span className="sidebar-nav__item-label">{item.label}</span>
                                <span className="sidebar-nav__item-description">{item.description}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};