import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shield, Phone, CheckCircle, Clock, Lock } from "lucide-react";
import { useUserGuardContext } from "app/auth";
import brain from "brain";
import { toast } from "sonner";
import type { TrustScoreRequest, TrustScoreResponse } from "types";

export default function LoanApplication() {
  const navigate = useNavigate();
  const { user } = useUserGuardContext();
  const [msisdn, setMsisdn] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleBack = () => {
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!msisdn || !consentGiven) {
      toast.error("Please fill in all required fields and give consent");
      return;
    }

    // Validate MSISDN format (basic validation)
    const cleanMsisdn = msisdn.replace(/\s+/g, "");
    if (!/^\+?[0-9]{10,15}$/.test(cleanMsisdn)) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    setIsLoading(true);
    setCurrentStep(2);

    try {
      const request: TrustScoreRequest = {
        msisdn: cleanMsisdn,
        consent_given: consentGiven
      };

      const response = await brain.calculate_trust_score(request);
      const data: TrustScoreResponse = await response.json();

      // Store the response for next page
      sessionStorage.setItem('trustScoreResponse', JSON.stringify(data));
      
      // Navigate based on approval status
      if (data.approved) {
        navigate('/loan-approved');
      } else {
        navigate('/loan-under-review');
      }
    } catch (error) {
      console.error('TrustScore calculation failed:', error);
      toast.error("Something went wrong. Please try again.");
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = currentStep === 1 ? 25 : 75;

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
            disabled={isLoading}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">Loan Application</h1>
            <p className="text-mtn-yellow text-sm">Get your instant offer</p>
          </div>
          <div className="bg-mtn-yellow p-2 rounded-lg">
            <Shield className="h-5 w-5 text-mtn-navy" />
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="px-4 py-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Step {currentStep} of 2</span>
            <span>{progressPercentage}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-2 space-y-6">
        {currentStep === 1 ? (
          /* Step 1: Application Form */
          <>
            <Card className="bg-white/95 border-none shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-mtn-navy flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Your Mobile Number</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="msisdn" className="text-mtn-navy font-medium">
                      MTN Mobile Number *
                    </Label>
                    <Input
                      id="msisdn"
                      type="tel"
                      placeholder="+27 81 234 5678"
                      value={msisdn}
                      onChange={(e) => setMsisdn(e.target.value)}
                      className="mobile-touch text-lg border-mtn-navy/20 focus:border-mtn-yellow"
                      required
                    />
                    <p className="text-sm text-gray-600">
                      We'll use this to check your MTN transaction history
                    </p>
                  </div>

                  {/* Data Sources Preview */}
                  <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium text-mtn-navy flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Data We'll Check</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Account Status</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Payment History</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Balance Patterns</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Usage Analytics</span>
                      </div>
                    </div>
                  </div>

                  {/* Consent */}
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consent"
                      checked={consentGiven}
                      onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                      className="mt-1 mobile-touch"
                    />
                    <Label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed">
                      I consent to MoMoMore securely accessing my MTN data for credit assessment. 
                      Your data is encrypted and never shared with third parties.
                    </Label>
                  </div>

                  <Button 
                    type="submit"
                    disabled={!msisdn || !consentGiven || isLoading}
                    className="w-full bg-mtn-navy hover:bg-mtn-navy/90 text-mtn-yellow font-semibold mobile-touch text-lg"
                    size="lg"
                  >
                    Check My TrustScore
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Lock className="h-3 w-3" />
                  <span>Bank-grade security</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Instant decision</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Step 2: Processing */
          <div className="text-center space-y-6 py-8">
            <div className="bg-mtn-yellow p-6 rounded-full w-fit mx-auto animate-pulse">
              <Shield className="h-12 w-12 text-mtn-navy" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Calculating Your TrustScore...
              </h3>
              <p className="text-gray-300">
                Analyzing your MTN data securely
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Checking account status</span>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Analyzing payment history</span>
                <div className="w-4 h-4 border-2 border-mtn-yellow border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Calculating offer</span>
                <Clock className="h-4 w-4" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
