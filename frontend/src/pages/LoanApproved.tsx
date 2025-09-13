import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CheckCircle, Wallet, Building2, Star, Zap } from "lucide-react";
import { useUserGuardContext } from "app/auth";
import { toast } from "sonner";
import type { TrustScoreResponse, LoanOption } from "types";

export default function LoanApproved() {
  const navigate = useNavigate();
  const { user } = useUserGuardContext();
  const [trustScoreData, setTrustScoreData] = useState<TrustScoreResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [disbursementMethod, setDisbursementMethod] = useState("momo");
  const [bankAccount, setBankAccount] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem('trustScoreResponse');
    if (storedData) {
      const data: TrustScoreResponse = JSON.parse(storedData);
      setTrustScoreData(data);
      
      // Redirect if not approved
      if (!data.approved) {
        navigate('/loan-under-review');
      }
    } else {
      // No data found, redirect to start
      navigate('/loan-application');
    }
  }, [navigate]);

  const handleBack = () => {
    navigate('/loan-application');
  };

  const handleAcceptOffer = async () => {
    if (!trustScoreData || !trustScoreData.loan_options[selectedOption]) {
      toast.error("No loan option selected");
      return;
    }

    if (disbursementMethod === "bank" && !bankAccount.trim()) {
      toast.error("Please enter your bank account details");
      return;
    }

    setIsAccepting(true);
    
    try {
      // Simulate API call for loan acceptance
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store acceptance data for confirmation page
      const acceptanceData = {
        trustScoreResponse: trustScoreData,
        selectedLoanOption: trustScoreData.loan_options[selectedOption],
        disbursementMethod,
        bankAccount: disbursementMethod === "bank" ? bankAccount : null,
        transactionRef: `MMM${Date.now()}`,
        acceptedAt: new Date().toISOString()
      };
      
      sessionStorage.setItem('loanAcceptance', JSON.stringify(acceptanceData));
      navigate('/loan-success');
    } catch (error) {
      console.error('Loan acceptance failed:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  if (!trustScoreData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-mtn-navy to-mtn-light-navy flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-mtn-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading your offer...</p>
        </div>
      </div>
    );
  }

  const selectedLoanOption = trustScoreData.loan_options[selectedOption];

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
            disabled={isAccepting}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">Loan Approved!</h1>
            <p className="text-mtn-yellow text-sm">Choose your offer</p>
          </div>
          <div className="bg-green-500 p-2 rounded-lg">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Approval Message */}
        <div className="text-center space-y-4">
          <div className="bg-green-500 p-4 rounded-full w-fit mx-auto">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="mobile-heading text-white">
              Congratulations!
            </h2>
            <p className="text-gray-300">
              Your loan application has been approved
            </p>
          </div>
        </div>

        {/* TrustScore Badge */}
        <Card className="bg-gradient-to-r from-mtn-yellow to-yellow-400 border-none">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-mtn-navy">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-bold text-lg">TrustScore: {trustScoreData.trust_score}</span>
              <Star className="h-5 w-5 fill-current" />
            </div>
            <p className="text-mtn-navy/80 text-sm mt-1">
              Based on your excellent MTN history
            </p>
          </CardContent>
        </Card>

        {/* Loan Options */}
        <Card className="bg-white/95 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-mtn-navy">Choose Your Loan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={selectedOption.toString()} onValueChange={(value) => setSelectedOption(parseInt(value))}>
              {trustScoreData.loan_options.map((option: LoanOption, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mobile-touch" />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-lg text-mtn-navy">
                          R{option.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {option.term_days} days • {option.interest_rate_percent}% interest
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Total repayment</div>
                        <div className="font-semibold text-mtn-navy">
                          R{option.total_repayment.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Disbursement Method */}
        <Card className="bg-white/95 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-mtn-navy">How do you want to receive your money?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={disbursementMethod} onValueChange={setDisbursementMethod}>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="momo" id="momo" className="mobile-touch" />
                <Label htmlFor="momo" className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="bg-mtn-yellow p-2 rounded">
                      <Wallet className="h-4 w-4 text-mtn-navy" />
                    </div>
                    <div>
                      <div className="font-medium text-mtn-navy">MTN MoMo Wallet</div>
                      <div className="text-sm text-gray-600 flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>Instant transfer (Recommended)</span>
                      </div>
                    </div>
                  </div>
                </Label>
                <Badge variant="outline" className="border-green-500 text-green-600">Free</Badge>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="bank" id="bank" className="mobile-touch" />
                <Label htmlFor="bank" className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 p-2 rounded">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-mtn-navy">Bank Account</div>
                      <div className="text-sm text-gray-600">Transfer to your bank</div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            
            {disbursementMethod === "bank" && (
              <div className="space-y-2 animate-in slide-in-from-top duration-300">
                <Label htmlFor="bankAccount" className="text-mtn-navy font-medium">
                  Bank Account Details
                </Label>
                <Input
                  id="bankAccount"
                  placeholder="Enter account number or details"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="mobile-touch"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offer Summary */}
        <Card className="bg-mtn-navy border-mtn-yellow/20 border">
          <CardContent className="p-4">
            <div className="text-white space-y-2">
              <div className="flex justify-between">
                <span>Loan amount:</span>
                <span className="font-bold text-mtn-yellow">R{selectedLoanOption.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Term:</span>
                <span>{selectedLoanOption.term_days} days</span>
              </div>
              <div className="flex justify-between">
                <span>Interest rate:</span>
                <span>{selectedLoanOption.interest_rate_percent}%</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-mtn-yellow/20 pt-2">
                <span>Total repayment:</span>
                <span className="text-mtn-yellow">R{selectedLoanOption.total_repayment.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accept Button */}
        <Button 
          onClick={handleAcceptOffer}
          disabled={isAccepting || (disbursementMethod === "bank" && !bankAccount.trim())}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold mobile-touch text-lg"
          size="lg"
        >
          {isAccepting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>Accept Loan Offer</>
          )}
        </Button>

        {/* Terms */}
        <p className="text-xs text-gray-400 text-center px-4">
          By accepting this offer, you agree to MoMoMore's terms and conditions. 
          Funds will be transferred within seconds to your selected method.
        </p>
      </main>
    </div>
  );
}
