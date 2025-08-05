import { Button } from "@/components/ui/button";
import { PenTool, Droplets, History, Circle, Download, Upload, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CurrencyPicker } from "@/components/CurrencyPicker";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isMobile?: boolean;
  onSignOut?: () => void;
}

export const Navigation = ({ currentView, onViewChange, isMobile, onSignOut }: NavigationProps) => {
  const primaryNavItems = [
    { id: 'pens', label: 'Pens', icon: PenTool },
    { id: 'inks', label: 'Inks', icon: Droplets },
  ];

  const secondaryNavItems = [
    { id: 'active-pens', label: 'Active Pens', icon: Circle },
    { id: 'inking-history', label: 'History', icon: History },
    { id: 'data-export', label: 'Export Data', icon: Download },
    { id: 'data-import', label: 'Import Data', icon: Upload },
  ];

  if (isMobile) {
    return (
      <nav className="flex items-center space-x-1">
        {/* Primary nav items - always visible */}
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange(item.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
        
        {/* Burger menu for secondary items */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={currentView === item.id ? 'bg-accent' : ''}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="w-full">
                <CurrencyPicker />
              </div>
            </DropdownMenuItem>
            {onSignOut && (
              <DropdownMenuItem onClick={onSignOut}>
                <span>Sign Out</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    );
  }

  // Desktop view - show all items
  const allNavItems = [
    { id: 'pens', label: 'Pens', icon: PenTool },
    { id: 'inks', label: 'Inks', icon: Droplets },
    { id: 'active-pens', label: 'Active', icon: Circle },
    { id: 'inking-history', label: 'History', icon: History },
    { id: 'data-export', label: 'Export', icon: Download },
    { id: 'data-import', label: 'Import', icon: Upload },
  ];

  return (
    <nav className="flex items-center space-x-1">
      {allNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.id}
            variant={currentView === item.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange(item.id)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden md:inline">{item.label}</span>
          </Button>
        );
      })}
    </nav>
  );
};