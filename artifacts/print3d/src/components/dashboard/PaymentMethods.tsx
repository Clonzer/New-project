import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Check, 
  Shield,
  Building2,
  AlertCircle,
  Star,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { 
  loadStripe, 
  addPaymentMethod, 
  getPaymentMethods, 
  deletePaymentMethod,
  setDefaultPaymentMethod,
  getBankAccounts,
  addBankAccount,
  deleteBankAccount,
  setDefaultBankAccount
} from "@/lib/payments-api";

interface PaymentMethod {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  billingDetails?: {
    name?: string;
    email?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
  };
}

interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  last4: string;
  routingLast4: string;
  isDefault: boolean;
  status: 'new' | 'verified' | 'errored';
}

export function PaymentMethods() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'banks'>('cards');

  // Bank account form
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [accountHolderName, setAccountHolderName] = useState("");

  useEffect(() => {
    fetchPaymentMethods();
  }, [user?.id]);

  const fetchPaymentMethods = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch cards
      const cardsResult = await getPaymentMethods(user.id);
      if (cardsResult.success && cardsResult.methods) {
        setPaymentMethods(cardsResult.methods);
      }
      
      // Fetch bank accounts
      const banksResult = await getBankAccounts(user.id);
      if (banksResult.success && banksResult.accounts) {
        setBankAccounts(banksResult.accounts);
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      toast({
        title: "Error loading payment methods",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!user?.id || !cardNumber || !cardExpiry || !cardCvc || !cardName) {
      toast({
        title: "Missing information",
        description: "Please fill in all card details",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    try {
      const result = await addPaymentMethod(user.id, {
        number: cardNumber.replace(/\s/g, ''),
        exp_month: parseInt(cardExpiry.split('/')[0]),
        exp_year: parseInt('20' + cardExpiry.split('/')[1]),
        cvc: cardCvc,
        name: cardName
      });

      if (result.success) {
        toast({
          title: "Card added successfully",
          description: "Your payment method has been saved"
        });
        setShowAddCard(false);
        setCardNumber("");
        setCardExpiry("");
        setCardCvc("");
        setCardName("");
        fetchPaymentMethods();
      } else {
        toast({
          title: "Failed to add card",
          description: result.error || "Please check your card details",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error adding card",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddBankAccount = async () => {
    if (!user?.id || !bankName || !accountNumber || !routingNumber || !accountHolderName) {
      toast({
        title: "Missing information",
        description: "Please fill in all bank account details",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    try {
      const result = await addBankAccount(user.id, {
        bank_name: bankName,
        account_number: accountNumber,
        routing_number: routingNumber,
        account_type: accountType,
        account_holder_name: accountHolderName
      });

      if (result.success) {
        toast({
          title: "Bank account added",
          description: "Your bank account has been linked. Verification may be required."
        });
        setShowAddBank(false);
        setBankName("");
        setAccountNumber("");
        setRoutingNumber("");
        setAccountHolderName("");
        fetchPaymentMethods();
      } else {
        toast({
          title: "Failed to add bank account",
          description: result.error || "Please check your details",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error adding bank account",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCard = async (paymentMethodId: string) => {
    if (!user?.id) return;

    try {
      const result = await deletePaymentMethod(user.id, paymentMethodId);
      if (result.success) {
        toast({
          title: "Card removed",
          description: "Your payment method has been deleted"
        });
        fetchPaymentMethods();
      } else {
        toast({
          title: "Failed to remove card",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error removing card",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBank = async (bankId: string) => {
    if (!user?.id) return;

    try {
      const result = await deleteBankAccount(user.id, bankId);
      if (result.success) {
        toast({
          title: "Bank account removed",
          description: "Your bank account has been unlinked"
        });
        fetchPaymentMethods();
      } else {
        toast({
          title: "Failed to remove bank account",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error removing bank account",
        variant: "destructive"
      });
    }
  };

  const handleSetDefaultCard = async (paymentMethodId: string) => {
    if (!user?.id) return;

    try {
      const result = await setDefaultPaymentMethod(user.id, paymentMethodId);
      if (result.success) {
        toast({
          title: "Default card updated"
        });
        fetchPaymentMethods();
      }
    } catch (error) {
      toast({
        title: "Error updating default",
        variant: "destructive"
      });
    }
  };

  const handleSetDefaultBank = async (bankId: string) => {
    if (!user?.id) return;

    try {
      const result = await setDefaultBankAccount(user.id, bankId);
      if (result.success) {
        toast({
          title: "Default bank account updated"
        });
        fetchPaymentMethods();
      }
    } catch (error) {
      toast({
        title: "Error updating default",
        variant: "destructive"
      });
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getCardIcon = (brand: string) => {
    // Return card brand styling
    const brandColors: Record<string, string> = {
      visa: "from-blue-600 to-blue-800",
      mastercard: "from-red-600 to-yellow-600",
      amex: "from-blue-400 to-blue-600",
      discover: "from-orange-500 to-orange-700",
    };
    return brandColors[brand.toLowerCase()] || "from-zinc-600 to-zinc-800";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-10 w-32 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
          <p className="text-zinc-400">Manage your cards and bank accounts for purchases and payouts</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Shield className="w-4 h-4" />
          <span>Securely stored with Stripe</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'cards'
              ? 'bg-primary text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 inline mr-2" />
          Cards ({paymentMethods.length})
        </button>
        <button
          onClick={() => setActiveTab('banks')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'banks'
              ? 'bg-primary text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          Bank Accounts ({bankAccounts.length})
        </button>
      </div>

      {/* Cards Tab */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          {paymentMethods.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center">
                <CreditCard className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No cards added</h3>
                <p className="text-zinc-400 mb-4">Add a payment card for quick checkout</p>
                <Button onClick={() => setShowAddCard(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Card
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <AnimatePresence>
                {paymentMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className={`bg-white/5 border-white/10 overflow-hidden ${
                      method.isDefault ? 'ring-2 ring-primary/50' : ''
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Card Visual */}
                            <div className={`w-14 h-10 rounded-lg bg-gradient-to-br ${getCardIcon(method.brand)} flex items-center justify-center`}>
                              <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white capitalize">{method.brand}</span>
                                {method.isDefault && (
                                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                                    <Star className="w-3 h-3 mr-1" />
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-zinc-400">
                                •••• {method.last4} | Expires {method.expMonth}/{method.expYear}
                              </p>
                              {method.billingDetails?.name && (
                                <p className="text-sm text-zinc-500">{method.billingDetails.name}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!method.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefaultCard(method.id)}
                                className="text-zinc-400 hover:text-white"
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCard(method.id)}
                              className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button onClick={() => setShowAddCard(true)} variant="outline" className="w-full border-white/10 text-zinc-400 hover:text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Another Card
              </Button>
            </>
          )}
        </div>
      )}

      {/* Bank Accounts Tab */}
      {activeTab === 'banks' && (
        <div className="space-y-4">
          {bankAccounts.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center">
                <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No bank accounts</h3>
                <p className="text-zinc-400 mb-4">Add a bank account to receive payouts (sellers)</p>
                <Button onClick={() => setShowAddBank(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bank Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <AnimatePresence>
                {bankAccounts.map((account) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className={`bg-white/5 border-white/10 overflow-hidden ${
                      account.isDefault ? 'ring-2 ring-primary/50' : ''
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                              <Building2 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{account.bankName}</span>
                                {account.isDefault && (
                                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                                    <Star className="w-3 h-3 mr-1" />
                                    Default Payout
                                  </Badge>
                                )}
                                {account.status === 'verified' && (
                                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                                    <Check className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                                {account.status === 'new' && (
                                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </div>
                              <p className="text-zinc-400">
                                {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} ••••{account.last4}
                              </p>
                              <p className="text-sm text-zinc-500">
                                Routing: ••••{account.routingLast4}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!account.isDefault && account.status === 'verified' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefaultBank(account.id)}
                                className="text-zinc-400 hover:text-white"
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBank(account.id)}
                              className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button onClick={() => setShowAddBank(true)} variant="outline" className="w-full border-white/10 text-zinc-400 hover:text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Another Bank Account
              </Button>
            </>
          )}
        </div>
      )}

      {/* Add Card Dialog */}
      <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
        <DialogContent className="bg-zinc-950 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Add Payment Card
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Your card information is securely stored with Stripe
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-zinc-300">Cardholder Name</Label>
              <Input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
                className="bg-white/5 border-white/10 text-white mt-1.5"
              />
            </div>
            
            <div>
              <Label className="text-zinc-300">Card Number</Label>
              <div className="relative">
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className="bg-white/5 border-white/10 text-white mt-1.5 pl-10"
                />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 mt-0.5" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Expiry Date</Label>
                <Input
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="bg-white/5 border-white/10 text-white mt-1.5"
                />
              </div>
              <div>
                <Label className="text-zinc-300">CVC</Label>
                <div className="relative">
                  <Input
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    type="password"
                    className="bg-white/5 border-white/10 text-white mt-1.5 pl-10"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 mt-0.5" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2">
              <Shield className="w-4 h-4" />
              <span>Your card details are encrypted and secure</span>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddCard(false)}
                className="flex-1 border-white/10 text-zinc-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCard}
                disabled={isAdding}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isAdding ? "Adding..." : "Add Card"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Bank Account Dialog */}
      <Dialog open={showAddBank} onOpenChange={setShowAddBank}>
        <DialogContent className="bg-zinc-950 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" />
              Add Bank Account
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Link your bank account for receiving payouts
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-zinc-300">Account Holder Name</Label>
              <Input
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="John Doe"
                className="bg-white/5 border-white/10 text-white mt-1.5"
              />
            </div>
            
            <div>
              <Label className="text-zinc-300">Bank Name</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Chase, Bank of America, etc."
                className="bg-white/5 border-white/10 text-white mt-1.5"
              />
            </div>
            
            <div>
              <Label className="text-zinc-300">Account Type</Label>
              <div className="flex gap-2 mt-1.5">
                <Button
                  type="button"
                  variant={accountType === 'checking' ? 'default' : 'outline'}
                  onClick={() => setAccountType('checking')}
                  className={`flex-1 ${accountType === 'checking' ? 'bg-primary' : 'border-white/10 text-zinc-400'}`}
                >
                  Checking
                </Button>
                <Button
                  type="button"
                  variant={accountType === 'savings' ? 'default' : 'outline'}
                  onClick={() => setAccountType('savings')}
                  className={`flex-1 ${accountType === 'savings' ? 'bg-primary' : 'border-white/10 text-zinc-400'}`}
                >
                  Savings
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-zinc-300">Account Number</Label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="000123456789"
                className="bg-white/5 border-white/10 text-white mt-1.5"
              />
            </div>
            
            <div>
              <Label className="text-zinc-300">Routing Number</Label>
              <Input
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="021000021"
                maxLength={9}
                className="bg-white/5 border-white/10 text-white mt-1.5"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2">
              <Shield className="w-4 h-4" />
              <span>Bank details are encrypted and verified</span>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddBank(false)}
                className="flex-1 border-white/10 text-zinc-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddBankAccount}
                disabled={isAdding}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {isAdding ? "Adding..." : "Add Bank Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
