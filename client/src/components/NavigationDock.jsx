import React from "react";
import { FloatingDock } from "./ui/floating-dock";
import {
    IconHome,
    IconTerminal2,
    IconUsers,
} from "@tabler/icons-react";

export function NavigationDock() {
    const links = [
        {
            title: "Home",
            icon: (
                <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: "/",
        },
        {
            title: "Features",
            icon: (
                <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: "/features",
        },
        {
            title: "Members",
            icon: (
                <IconUsers className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: "/members",
        },
    ];

    return (
        <div className="fixed right-6 bottom-6 md:top-6 md:bottom-auto z-[9999]">
            <FloatingDock
                orientation="vertical"
                items={links}
            />
        </div>
    );
}
