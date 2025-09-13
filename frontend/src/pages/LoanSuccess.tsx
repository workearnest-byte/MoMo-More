
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CheckCircle, Wallet, Building2, Copy, ArrowRight, Star, Zap } from "lucide-react";
import { useUserGuardContext } from "app/auth";
import { toast } from "sonner";
import type { TrustScoreResponse, LoanOption } from "types";

interface LoanAcceptanceData {
  trustScoreResponse: TrustScoreResponse;
  selectedLoanOption: LoanOption;
  disbursementMethod: string;
  bankAccount: string | null;
  transactionRef: string;
  acceptedAt: string;
}

export default function LoanSuccess() {
  const navigate = useNavigate();
  const { user } = useUserGuardContext();
  const [acceptanceData, setAcceptanceData] = useState<LoanAcceptanceData | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem('loanAcceptance');
    if (storedData) {
      const data: LoanAcceptanceData = JSON.parse(storedData);
      setAcceptanceData(data);
    } else {
      // No acceptance data found, redirect to start
      navigate('/loan-application');
    }

    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleCopyReference = () => {
    if (acceptanceData) {
      navigator.clipboard.writeText(acceptanceData.transactionRef);
      toast.success("Reference number copied!");
    }
  };

  const handleGoHome = () => {
    // Clear session data
    sessionStorage.removeItem('trustScoreResponse');
    sessionStorage.removeItem('loanAcceptance');
    navigate('/');
  };

  const handleViewAccount = () => {
    // In a real app, this would navigate to account/transaction history
    toast.info("Account view coming soon!");
  };

  if (!acceptanceData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-mtn-navy to-mtn-light-navy flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-mtn-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading confirmation...</p>
        </div>
      </div>
    );
  }

  const disbursementIcon = acceptanceData.disbursementMethod === 'momo' ? Wallet : Building2;
  const disbursementText = acceptanceData.disbursementMethod === 'momo' ? 'MTN MoMo Wallet' : 'Bank Account';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-mtn-yellow rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Mobile Header */}
      <header className="bg-green-700 border-b border-white/20 px-4 py-3 relative z-10">
        <div className="flex items-center justify-center space-x-3">
          <div className="bg-white p-2 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-center">
            <h1 className="text-white font-bold text-lg">Loan Approved!</h1>
            <p className="text-green-100 text-sm">Money on the way</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6 relative z-10">
        {/* Success Message */}
        <div className="text-center space-y-4">
          <div className="bg-white p-6 rounded-full w-fit mx-auto shadow-lg animate-pulse">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              🎉 Congratulations!
            </h2>
            <p className="text-green-100 text-lg">
              Your loan has been approved and disbursed
            </p>
          </div>
        </div>

        {/* Transaction Summary */}
        <Card className="bg-white border-none shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-700 text-center">Transaction Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amount */}
            <div className="text-center py-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-700">
                R{acceptanceData.selectedLoanOption.amount.toLocaleString()}
              </div>
              <p className="text-green-600 text-sm">Transferred successfully</p>
            </div>

            {/* Disbursement Method */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-green-600 p-2 rounded">
                  {React.createElement(disbursementIcon, { className: "h-4 w-4 text-white" })}
                </div>
                <div>
                  <div className="font-medium text-gray-900">Sent to</div>
                  <div className="text-sm text-gray-600">{disbursementText}</div>
                  {acceptanceData.bankAccount && (
                    <div className="text-xs text-gray-500">{acceptanceData.bankAccount}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Instant</span>
              </div>
            </div>

            {/* Transaction Reference */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Transaction Reference</Label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <code className="flex-1 font-mono text-sm text-gray-800">
                  {acceptanceData.transactionRef}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyReference}
                  className="mobile-touch"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">Save this reference for your records</p>
            </div>
          </CardContent>
        </Card>

        {/* Loan Details */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Loan Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700 font-medium">Term:</span>
                <div className="text-green-800">{acceptanceData.selectedLoanOption.term_days} days</div>
              </div>
              <div>
                <span className="text-green-700 font-medium">Interest Rate:</span>
                <div className="text-green-800">{acceptanceData.selectedLoanOption.interest_rate_percent}%</div>
              </div>
              <div>
                <span className="text-green-700 font-medium">Total Repayment:</span>
                <div className="text-green-800 font-bold">
                  R{acceptanceData.selectedLoanOption.total_repayment.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-green-700 font-medium">Due Date:</span>
                <div className="text-green-800">
                  {new Date(Date.now() + acceptanceData.selectedLoanOption.term_days * 24 * 60 * 60 * 1000)
                    .toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <span>Check your {disbursementText.toLowerCase()} for the funds</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <span>We'll send you repayment reminders via SMS</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <span>Pay on time to improve your TrustScore for better future offers</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleViewAccount}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold mobile-touch"
            size="lg"
          >
            View My Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            onClick={handleGoHome}
            variant="outline"
            className="w-full border-white text-white hover:bg-white/10 mobile-touch"
            size="lg"
          >
            Back to Home
          </Button>
        </div>

        {/* Support */}
        <div className="text-center bg-white/10 p-4 rounded-lg">
          <p className="text-white text-sm">
            Need help? Contact MTN support at{" "}
            <span className="font-bold underline">*135#</span>
          </p>
        </div>
      </main>
    </div>
  );
}
