import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Shield, CheckCircle, Eye, Bell } from "lucide-react";
import { useUserGuardContext } from "app/auth";
import type { TrustScoreResponse } from "types";

export default function LoanUnderReview() {
  const navigate = useNavigate();
  const { user } = useUserGuardContext();
  const [trustScoreData, setTrustScoreData] = useState<TrustScoreResponse | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('trustScoreResponse');
    if (storedData) {
      const data: TrustScoreResponse = JSON.parse(storedData);
      setTrustScoreData(data);
      
      // Redirect if approved
      if (data.approved) {
        navigate('/loan-approved');
      }
    } else {
      // No data found, redirect to start
      navigate('/loan-application');
    }
  }, [navigate]);

  const handleBack = () => {
    navigate('/loan-application');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleNotifyMe = () => {
    // In a real app, this would set up notifications
    alert("We'll notify you via SMS and email when your application is ready!");
  };

  if (!trustScoreData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-mtn-navy to-mtn-light-navy flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-mtn-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading your application status...</p>
        </div>
      </div>
    );
  }

  const getEstimatedTimeframe = () => {
    // In a real app, this would come from the API based on decision_reason
    return "24-48 hours";
  };

  const getReviewReason = () => {
    // In a real app, this would be more specific based on the actual review reason
    return "Additional verification needed";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mtn-navy to-mtn-light-navy">
      {/* Mobile Header */}
      <header className="bg-mtn-navy border-b border-mtn-yellow/20 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="text-white p-2 mobile-touch"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">Application Status</h1>
            <p className="text-mtn-yellow text-sm">Under review</p>
          </div>
          <div className="bg-orange-500 p-2 rounded-lg">
            <Clock className="h-5 w-5 text-white" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Status Message */}
        <div className="text-center space-y-4">
          <div className="bg-orange-500 p-4 rounded-full w-fit mx-auto">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="mobile-heading text-white">
              Application Under Review
            </h2>
            <p className="text-gray-300">
              We're taking a closer look at your application
            </p>
          </div>
        </div>

        {/* TrustScore Badge */}
        <Card className="bg-gradient-to-r from-mtn-yellow to-yellow-400 border-none">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-mtn-navy">
              <Shield className="h-5 w-5" />
              <span className="font-bold text-lg">TrustScore: {trustScoreData.trust_score}</span>
            </div>
            <p className="text-mtn-navy/80 text-sm mt-1">
              Great score! Just need a bit more verification
            </p>
          </CardContent>
        </Card>

        {/* Review Information */}
        <Card className="bg-white/95 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-mtn-navy flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>What's Happening?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-mtn-navy">TrustScore Calculated</div>
                  <div className="text-sm text-gray-600">Your score looks good!</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mt-0.5" />
                <div>
                  <div className="font-medium text-mtn-navy">{getReviewReason()}</div>
                  <div className="text-sm text-gray-600">
                    Our team is conducting additional security checks to ensure the best experience
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Trust */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-blue-600 mt-1" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">Why the additional review?</h4>
                <p className="text-sm text-blue-800">
                  We use advanced AI to protect both you and MTN from fraud. This extra step ensures 
                  your loan offer is accurate and secure. Your data remains completely confidential.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-white/95 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-mtn-navy flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>What's Next?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-900">Estimated completion time</span>
              </div>
              <div className="text-2xl font-bold text-orange-800">{getEstimatedTimeframe()}</div>
              <p className="text-sm text-orange-700 mt-1">
                Most reviews complete much faster
              </p>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium text-mtn-navy">We'll notify you when:</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Your application is approved</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Your loan offer is ready</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Any updates to your application</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleNotifyMe}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold mobile-touch"
            size="lg"
          >
            <Bell className="mr-2 h-4 w-4" />
            Set Up Notifications
          </Button>
          
          <Button 
            onClick={handleGoHome}
            variant="outline"
            className="w-full border-mtn-yellow/30 text-white hover:bg-mtn-yellow/10 mobile-touch"
            size="lg"
          >
            Back to Home
          </Button>
        </div>

        {/* Reference Number */}
        <div className="bg-mtn-navy/50 p-4 rounded-lg border border-mtn-yellow/20">
          <div className="text-center space-y-1">
            <p className="text-sm text-gray-400">Application Reference</p>
            <p className="font-mono text-mtn-yellow font-medium">{trustScoreData.request_id.toUpperCase()}</p>
            <p className="text-xs text-gray-500">Keep this for your records</p>
          </div>
        </div>

        {/* Support */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Questions? Contact MTN support at{" "}
            <span className="text-mtn-yellow underline">*135#</span>
          </p>
        </div>
      </main>
    </div>
  );
}
