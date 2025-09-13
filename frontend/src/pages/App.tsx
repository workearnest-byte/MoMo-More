
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Menu, ChevronRight, Zap, Lock, Eye } from "lucide-react";
import { useUser } from "@stackframe/react";

export default function App() {
  const navigate = useNavigate();
  const user = useUser();

  const handleTrustScoreCheck = () => {
    navigate("/loan-application");
  };

  const handleViewOffers = () => {
    navigate("/offers");
  };

  const handleHowItWorks = () => {
    navigate("/how-it-works");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mtn-navy to-mtn-light-navy">
      {/* Mobile Header */}
      <header className="bg-mtn-navy border-b border-mtn-yellow/20 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="bg-mtn-yellow p-2 rounded-lg">
              <Shield className="h-6 w-6 text-mtn-navy" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">MoMoMore</h1>
              <p className="text-mtn-yellow text-xs font-medium">MTN Financial</p>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="bg-mtn-yellow/10 text-mtn-yellow px-3 py-1 rounded-full text-sm">
                  {user.displayName || user.primaryEmail || 'User'}
                </div>
                <Button variant="ghost" size="sm" className="text-white mobile-touch">
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => navigate('/auth/sign-in')} 
                variant="outline" 
                size="sm" 
                className="border-mtn-yellow text-mtn-yellow hover:bg-mtn-yellow hover:text-mtn-navy mobile-touch"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h2 className="mobile-heading text-white">
            {user ? `Welcome back!` : 'Welcome to MoMoMore'}
          </h2>
          
          {/* Trust Badge */}
          <div className="flex items-center justify-center space-x-2 text-mtn-yellow">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-semibold">Speed</span>
            <span className="text-mtn-yellow/60">•</span>
            <Lock className="h-4 w-4" />
            <span className="text-sm font-semibold">Security</span>
            <span className="text-mtn-yellow/60">•</span>
            <Eye className="h-4 w-4" />
            <span className="text-sm font-semibold">Transparency</span>
          </div>
          
          <p className="mobile-body text-gray-300 max-w-sm mx-auto">
            Get instant loans based on your MTN transaction history. No paperwork, just trust.
          </p>
        </div>

        {/* Primary CTA */}
        <Card className="bg-gradient-to-r from-mtn-yellow to-yellow-400 border-none shadow-lg">
          <CardContent className="p-6 text-center space-y-4">
            <div className="bg-mtn-navy p-3 rounded-full w-fit mx-auto">
              <Shield className="h-8 w-8 text-mtn-yellow" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-mtn-navy">
                Check Your TrustScore
              </h3>
              <p className="text-mtn-navy/80 text-sm">
                See your personalized loan offer in seconds
              </p>
            </div>
            
            <Button 
              onClick={handleTrustScoreCheck}
              className="w-full bg-mtn-navy hover:bg-mtn-navy/90 text-mtn-yellow font-semibold mobile-touch text-lg"
              size="lg"
            >
              Get My Offer Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Secondary Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleViewOffers}
            variant="outline" 
            className="w-full border-mtn-yellow/30 text-white hover:bg-mtn-yellow/10 mobile-touch"
            size="lg"
          >
            <Eye className="mr-2 h-4 w-4" />
            View My Offers
          </Button>
          
          <button 
            onClick={handleHowItWorks}
            className="w-full text-mtn-yellow text-sm underline py-2 mobile-touch"
          >
            How does MoMoMore work?
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="pt-4 border-t border-mtn-yellow/20">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <Badge variant="outline" className="border-mtn-success/30 text-mtn-success">
              MTN Verified
            </Badge>
            <Badge variant="outline" className="border-mtn-yellow/30 text-mtn-yellow">
              Bank Grade Security
            </Badge>
          </div>
        </div>
      </main>
    </div>
  );
}
