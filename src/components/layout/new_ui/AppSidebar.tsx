"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronDownIcon, 
  HorizontaLDots,
  GridIcon,
  ListIcon,
  TableIcon,
  PageIcon,
  CalenderIcon,
  UserCircleIcon,
} from "./Icons";
import {
  PieChartIcon,
  BoxCubeIcon,
  PlugInIcon
} from "@/new_ui_design_system/icons";
import { useSidebar } from "@/context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { useLanguage } from "@/context/LanguageContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  roles?: string[];
};

export default function AppSidebar({ user }: { user?: any }) {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { t } = useLanguage();
  const role = user?.role || "MERCHANT";

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<number, number>>({});
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => pathname === path,
    [pathname]
  );

  const navigation: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      subItems: [{ name: "Ecommerce", path: "/dashboard" }],
    },
    {
      icon: <CalenderIcon />,
      name: "Calendar",
      path: "/calendar",
    },
    {
      icon: <UserCircleIcon />,
      name: "User Profile",
      path: "/profile",
    },
    {
      name: "Forms",
      icon: <ListIcon />,
      subItems: [{ name: "Form Elements", path: "/form-elements" }],
    },
    {
      name: "Tables",
      icon: <TableIcon />,
      subItems: [{ name: "Basic Tables", path: "/basic-tables" }],
    },
    {
      name: "Pages",
      icon: <PageIcon />,
      subItems: [
        { name: "Blank Page", path: "/blank" },
        { name: "404 Error", path: "/error-404" },
      ],
    },
  ];

  const othersItems: NavItem[] = [
    {
      icon: <PieChartIcon />,
      name: "Charts",
      subItems: [
        { name: "Line Chart", path: "/line-chart" },
        { name: "Bar Chart", path: "/bar-chart" },
      ],
    },
    {
      icon: <BoxCubeIcon />,
      name: "UI Elements",
      subItems: [
        { name: "Alerts", path: "/alerts" },
        { name: "Avatar", path: "/avatars" },
        { name: "Badge", path: "/badge" },
        { name: "Buttons", path: "/buttons" },
        { name: "Images", path: "/images" },
        { name: "Videos", path: "/videos" },
      ],
    },
    {
      icon: <PlugInIcon />,
      name: "Authentication",
      subItems: [
        { name: "Sign In", path: "/signin" },
        { name: "Sign Up", path: "/signup" },
      ],
    },
  ];

  const visibleItems = navigation;

  useEffect(() => {
    visibleItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
          }
        });
      }
    });
  }, [pathname, isActive, visibleItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      if (subMenuRefs.current[openSubmenu]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="font-black text-xl text-[#0F172A] uppercase tracking-tighter">
              Business<span className="text-brand-500">Connect</span>
            </span>
          ) : (
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">
              B
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              <ul className="flex flex-col gap-2 mb-6">
                {visibleItems.map((nav, index) => (
                  <SidebarItem key={nav.name} nav={nav} index={index} type="main" />
                ))}
              </ul>

              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              <ul className="flex flex-col gap-2">
                {othersItems.map((nav, index) => (
                  <SidebarItem key={nav.name} nav={nav} index={index + 100} type="others" />
                ))}
              </ul>
            </div>
          </div>
        </nav>
        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
}

function SidebarItem({ nav, index, type }: { nav: NavItem; index: number; type: string }) {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState(0);
  const subMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

  const hasActiveSubItem = nav.subItems?.some(sub => isActive(sub.path));

  useEffect(() => {
    if (hasActiveSubItem) {
      setOpenSubmenu(index);
    }
  }, [hasActiveSubItem, index]);

  useEffect(() => {
    if (openSubmenu === index && subMenuRef.current) {
      setSubMenuHeight(subMenuRef.current.scrollHeight);
    } else {
      setSubMenuHeight(0);
    }
  }, [openSubmenu, index]);

  return (
    <li>
      {nav.subItems ? (
        <>
          <button
            onClick={() => setOpenSubmenu(prev => prev === index ? null : index)}
            className={`menu-item group ${
              openSubmenu === index
                ? "menu-item-active"
                : "menu-item-inactive"
            } cursor-pointer ${
              !isExpanded && !isHovered
                ? "lg:justify-center"
                : "lg:justify-start"
            }`}
          >
            <span
              className={`menu-item-icon-size ${
                openSubmenu === index
                  ? "text-brand-500 dark:text-brand-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {nav.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <>
                <span className="flex-1 text-sm font-medium ml-3 dark:text-gray-300">{nav.name}</span>
                <ChevronDownIcon
                  className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                    openSubmenu === index ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </button>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={subMenuRef}
              className="overflow-hidden transition-all duration-300"
              style={{
                height: `${subMenuHeight}px`,
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <Link
          href={nav.path || "#"}
          className={`menu-item group ${
            isActive(nav.path!) ? "menu-item-active" : "menu-item-inactive"
          } ${
            !isExpanded && !isHovered
              ? "lg:justify-center"
              : "lg:justify-start"
          }`}
        >
          <span
            className={`menu-item-icon-size ${
              isActive(nav.path!) ? "text-brand-500 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {nav.icon}
          </span>
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="ml-3 text-sm font-medium dark:text-gray-300">{nav.name}</span>
          )}
        </Link>
      )}
    </li>
  );
}
