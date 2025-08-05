import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useNavigate } from "react-router-dom";
import { DataExport } from "@/components/DataExport";
import { DataImport } from "@/components/DataImport";
import { Dashboard } from "@/components/Dashboard";
import PenCollection from "@/components/PenCollection";
import InkCollection from "@/components/InkCollection";
import { InkingHistory } from "@/components/InkingHistory";
import { ActivePens } from "@/components/ActivePens";
import { NeglectedPens } from "@/components/NeglectedPens";
import { Navigation } from "@/components/Navigation";
import { CurrencyPicker } from "@/components/CurrencyPicker";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const { user, signOut } = useAuth();
  const { loading } = useSupabaseData();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'pens':
        return <PenCollection />;
      case 'inks':
        return <InkCollection />;
      case 'inking-history':
        return <InkingHistory />;
      case 'active-pens':
        return <ActivePens />;
      case 'neglected-pens':
        return <NeglectedPens onViewChange={setCurrentView} />;
      case 'data-export':
        return <DataExport />;
      case 'data-import':
        return <DataImport />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setCurrentView("dashboard")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                🖋️
              </div>
              <h1 className="text-xl font-bold">Penabler</h1>
            </button>
            <div className="flex items-center gap-2">
              <Navigation 
                currentView={currentView} 
                onViewChange={setCurrentView}
                isMobile={isMobile}
                onSignOut={signOut}
              />
              {!isMobile && <CurrencyPicker />}
              {!isMobile && (
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="text-sm"
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default Index;