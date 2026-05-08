import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Truck, 
  Settings, 
  Shield,
  Bell,
  User,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";

const AccountSettings = () => {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const sections = [
    {
      id: "payment-methods",
      title: "Payment Methods",
      description: "Manage your payment options and billing",
      icon: CreditCard,
      path: "/dashboard/payment-methods",
      count: 2,
      color: "bg-blue-600/20 text-blue-300 border-blue-500/30",
      status: "active"
    },
    {
      id: "shipping-profiles",
      title: "Shipping Profiles",
      description: "Configure shipping methods and addresses",
      icon: Truck,
      path: "/dashboard/shipping-profiles",
      count: 3,
      color: "bg-green-600/20 text-green-300 border-green-500/30",
      status: "active"
    },
    {
      id: "settings",
      title: "Account Settings",
      description: "Manage your account preferences and security",
      icon: Settings,
      path: "/dashboard/settings",
      count: null,
      color: "bg-purple-600/20 text-purple-300 border-purple-500/30",
      status: "active"
    }
  ];

  const securityItems = [
    {
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      enabled: twoFactorEnabled,
      toggle: setTwoFactorEnabled,
      icon: Shield
    },
    {
      title: "Email Notifications",
      description: "Receive updates about your orders and activity",
      enabled: emailNotifications,
      toggle: setEmailNotifications,
      icon: Bell
    },
    {
      title: "Push Notifications",
      description: "Get instant notifications on your devices",
      enabled: pushNotifications,
      toggle: setPushNotifications,
      icon: Bell
    }
  ];

  const accountInfo = [
    {
      label: "Email",
      value: user?.email || "user@example.com",
      verified: true
    },
    {
      label: "Account Type",
      value: user?.role || "seller",
      verified: true
    },
    {
      label: "Plan",
      value: user?.planTier || "starter",
      verified: true
    },
    {
      label: "Member Since",
      value: "January 2024",
      verified: true
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 pl-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Account & Settings</h1>
          <p className="text-zinc-400">Manage your account, payment methods, and preferences</p>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Account Information</h3>
              <p className="text-zinc-400 text-sm">Your account details and verification status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accountInfo.map((info, index) => (
              <div key={info.label} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="text-zinc-400 text-sm">{info.label}</p>
                  <p className="text-white font-medium">{info.value}</p>
                </div>
                {info.verified && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center`}>
                    <section.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                    <p className="text-zinc-400 text-sm">{section.description}</p>
                  </div>
                </div>
                {section.count !== null && (
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                    {section.count}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Badge className={section.status === 'active' ? 'bg-green-600/20 text-green-300 border-green-500/30' : 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'}>
                  {section.status}
                </Badge>
                <Link href={section.path}>
                  <a className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                    <span className="text-sm">Manage</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Security & Privacy</h3>
              <p className="text-zinc-400 text-sm">Manage your security settings and privacy preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            {securityItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-zinc-400" />
                    <div>
                      <p className="text-white font-medium">{item.title}</p>
                      <p className="text-zinc-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={item.enabled}
                    onCheckedChange={item.toggle}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/payment-methods">
              <a className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <CreditCard className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-white font-medium">Add Payment Method</p>
                  <p className="text-zinc-400 text-sm">Setup billing options</p>
                </div>
              </a>
            </Link>
            
            <Link href="/dashboard/shipping-profiles">
              <a className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-white font-medium">Shipping Settings</p>
                  <p className="text-zinc-400 text-sm">Configure delivery</p>
                </div>
              </a>
            </Link>
            
            <Link href="/dashboard/settings">
              <a className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <Settings className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-white font-medium">Account Settings</p>
                  <p className="text-zinc-400 text-sm">Update preferences</p>
                </div>
              </a>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountSettings;
