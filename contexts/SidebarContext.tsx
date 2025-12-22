import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface SidebarContextValue {
  // State
  isExpanded: boolean;
  isHovered: boolean;
  isCollapsible: boolean; // Whether sidebar can be collapsed (false on homepage)
  sidebarWidth: number;

  // Actions
  setIsHovered: (hovered: boolean) => void;
  toggleExpanded: () => void;
  expandSidebar: () => void;
  collapseSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

// Sidebar width constants
export const SIDEBAR_WIDTH_EXPANDED = 360;
export const SIDEBAR_WIDTH_COLLAPSED = 60;

// Routes where sidebar should be expanded by default
const EXPANDED_ROUTES = ['/', '/home'];

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);

  // Determine if current route should have expanded sidebar
  const shouldBeExpanded = useCallback(() => {
    return EXPANDED_ROUTES.includes(location.pathname);
  }, [location.pathname]);

  // Update sidebar state when route changes
  useEffect(() => {
    const isHomepage = shouldBeExpanded();
    setIsCollapsible(!isHomepage);

    if (isHomepage) {
      // Always expanded on homepage
      setIsExpanded(true);
    } else {
      // Collapsed by default on other pages
      setIsExpanded(false);
    }
  }, [location.pathname, shouldBeExpanded]);

  // Calculate actual sidebar width based on state
  const sidebarWidth = isExpanded || isHovered ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  const toggleExpanded = useCallback(() => {
    if (isCollapsible) {
      setIsExpanded((prev) => !prev);
    }
  }, [isCollapsible]);

  const expandSidebar = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapseSidebar = useCallback(() => {
    if (isCollapsible) {
      setIsExpanded(false);
    }
  }, [isCollapsible]);

  const value: SidebarContextValue = {
    isExpanded,
    isHovered,
    isCollapsible,
    sidebarWidth,
    setIsHovered,
    toggleExpanded,
    expandSidebar,
    collapseSidebar,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = (): SidebarContextValue => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default SidebarContext;
