import { StripeConnectOnboarding } from "@/components/stripe/StripeConnectOnboarding";
import { StripeProductCreation } from "@/components/stripe/StripeProductCreation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function StripeConnect() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl">
          <CreditCard className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Stripe Connect</h1>
          <p className="text-sm text-zinc-400">Connect your Stripe account to receive payments and create products</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StripeConnectOnboarding />
        <StripeProductCreation />
      </div>

      <Card className="bg-white/5 border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">About Stripe Connect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-400">
            Stripe Connect allows you to accept payments and manage your finances securely. 
            Once you complete onboarding, you can create products and start selling.
          </p>
          <ul className="text-sm text-zinc-400 space-y-2">
            <li>• Secure payment processing</li>
            <li>• Automatic payouts to your bank account</li>
            <li>• 10% platform fee on all transactions</li>
            <li>• Real-time transaction tracking</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
