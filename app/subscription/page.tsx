"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShoppingCart,
  Clock,
  DollarSign,
  Shield,
  Zap,
  Star,
  TrendingUp,
  Users,
  ExternalLink,
  ChevronRight,
  Info,
  Loader2,
  Lock,
  Crown,
  RefreshCw,
  XCircle,
  Building,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";

export type Plan = {
  id: string;
  subscriptionPackageId: string;
  price: number;
  interval: "MONTHLY" | "YEARLY" | "QUARTERLY" | "LIFETIME" | "WEEKLY";
  createdAt: string;
  updatedAt: string;
};

export type Partner = {
  id: string;
  name: string;
  logo: string;
  website: string;
  description?: string;
};

export type Partnership = {
  partner: Partner;
};

export type SubscriptionPackage = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  plans: Plan[];
  partnerships: Partnership[];
};

export type UserSubscriptionPackage = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  partners: Partner[];
  plan: Plan;
};

export type UserSubscription = {
  id: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "PENDING" | "CANCELLED" | "EXPIRED";
  createdAt: string;
  updatedAt: string;
  package: UserSubscriptionPackage;
};

type SubscriptionRequest = {
  packageId: string;
  planId: string;
};

type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
};

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");

  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<
    UserSubscription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] =
    useState<SubscriptionPackage | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);

  const fetchPackages = async () => {
    try {
      const res = await fetch(
        "http://localhost:4001/v1/open/subscription-packages",
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error(`Failed to fetch packages: ${res.status}`);

      const json: ApiResponse<SubscriptionPackage[]> = await res.json();
      setPackages(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load packages");
    }
  };

  const fetchUserSubscriptions = async () => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      setError("Please log in to view your subscriptions");
      return;
    }

    try {
      const res = await fetch("http://localhost:4001/v1/user/subscriptions", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch subscriptions: ${res.status}`);
      }

      const json: ApiResponse<UserSubscription[]> = await res.json();
      setUserSubscriptions(json.data);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      if (err instanceof Error && err.message.includes("401")) {
        setError("Session expired. Please log in again.");
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPackages(), fetchUserSubscriptions()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const subscribeToPackage = async (packageId: string, planId: string) => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      setError("Please log in to subscribe");
      return;
    }

    setSubscribing(true);
    setError(null);
    setSuccess(null);

    try {
      const requestBody: SubscriptionRequest = { packageId, planId };

      const res = await fetch("http://localhost:4001/v1/user/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Subscription failed: ${res.status}`);
      }

      if (uid) {
        setSuccess(
          "Subscription successful! Redirecting you back to the login flow..."
        );
        setTimeout(() => {
          window.location.href = `http://localhost:4001/oauth/interaction/${uid}/confirm-subscription`;
        }, 2000);
      } else {
        setSuccess("Subscription successful! Your plan is now active.");
      }

      setShowConfirmation(false);

      // Refresh subscriptions
      await fetchUserSubscriptions();

      // Reset selections
      setSelectedPackage(null);
      setSelectedPlan(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subscription failed");
    } finally {
      setSubscribing(false);
    }
  };

  const handleSubscribeClick = (pkg: SubscriptionPackage, plan: Plan) => {
    setSelectedPackage(pkg);
    setSelectedPlan(plan);
    setShowConfirmation(true);
  };

  const handleConfirmSubscribe = () => {
    if (selectedPackage && selectedPlan) {
      subscribeToPackage(selectedPackage.id, selectedPlan.id);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchPackages(), fetchUserSubscriptions()]);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case "MONTHLY":
        return "per month";
      case "YEARLY":
        return "per year";
      case "QUARTERLY":
        return "per quarter";
      case "LIFETIME":
        return "one-time";
      case "WEEKLY":
        return "per week";
      default:
        return interval.toLowerCase();
    }
  };

  const getIntervalColor = (interval: string) => {
    switch (interval) {
      case "MONTHLY":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "YEARLY":
        return "bg-green-100 text-green-800 border border-green-200";
      case "QUARTERLY":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "LIFETIME":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border border-red-200";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getActiveSubscription = (packageId: string) => {
    return userSubscriptions.find(
      (sub) => sub.package.id === packageId && sub.status === "ACTIVE"
    );
  };

  const calculateRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate yearly savings for yearly plans
  const calculateYearlySavings = (
    monthlyPrice: number,
    yearlyPrice: number
  ) => {
    const monthlyTotal = monthlyPrice * 12;
    const savings = monthlyTotal - yearlyPrice;
    const percentage = (savings / monthlyTotal) * 100;
    return {
      amount: savings,
      percentage: Math.round(percentage),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Subscription Plans
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your subscriptions and explore new plans
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-green-700">{success}</span>
                </div>
              </div>
            )}

            {/* Active Subscriptions Section */}
            {userSubscriptions.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Active Subscriptions
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">
                      {
                        userSubscriptions.filter((s) => s.status === "ACTIVE")
                          .length
                      }{" "}
                      Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userSubscriptions.map((subscription) => {
                    const remainingDays = calculateRemainingDays(
                      subscription.endDate
                    );
                    const isExpiringSoon = remainingDays <= 7;

                    return (
                      <div
                        key={subscription.id}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {/* Subscription Header */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-gray-900 text-lg">
                                  {subscription.package.name}
                                </h3>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                    subscription.status
                                  )}`}
                                >
                                  {subscription.status}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <DollarSign className="w-4 h-4 mr-1" />
                                <span className="font-medium">
                                  {formatCurrency(
                                    subscription.package.plan.price
                                  )}
                                </span>
                                <span className="mx-2">•</span>
                                <span
                                  className={`px-2 py-1 rounded text-xs ${getIntervalColor(
                                    subscription.package.plan.interval
                                  )}`}
                                >
                                  {subscription.package.plan.interval}
                                </span>
                              </div>
                            </div>
                            {isExpiringSoon &&
                              subscription.status === "ACTIVE" && (
                                <div className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                                  Expires in {remainingDays} days
                                </div>
                              )}
                          </div>

                          {subscription.package.description && (
                            <p className="text-gray-600 text-sm mt-3">
                              {subscription.package.description}
                            </p>
                          )}
                        </div>

                        {/* Subscription Details */}
                        <div className="p-6">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-gray-500 mb-1 flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Start Date
                                </div>
                                <div className="font-medium text-gray-900">
                                  {formatDate(subscription.startDate)}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500 mb-1 flex items-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  End Date
                                </div>
                                <div className="font-medium text-gray-900">
                                  {formatDate(subscription.endDate)}
                                </div>
                              </div>
                            </div>

                            {/* Included Partners */}
                            {subscription.package.partners.length > 0 && (
                              <div>
                                <div className="text-sm text-gray-500 mb-2 flex items-center">
                                  <Users className="w-4 h-4 mr-2" />
                                  Included Partners
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {subscription.package.partners.map(
                                    (partner) => (
                                      <a
                                        key={partner.id}
                                        href={partner.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group"
                                      >
                                        <img
                                          src={partner.logo}
                                          alt={partner.name}
                                          className="w-6 h-6 rounded"
                                        />
                                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                          {partner.name}
                                        </span>
                                        <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                                      </a>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Subscription Actions */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center">
                                <Receipt className="w-4 h-4 mr-2" />
                                ID: {subscription.id.slice(0, 8)}...
                              </div>
                            </div>
                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                              Manage Subscription
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Login Prompt */}
            {!sessionStorage.getItem("access_token") && (
              <div className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                <div className="flex items-center">
                  <Lock className="w-8 h-8 text-blue-600 mr-4" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">
                      Sign in to subscribe
                    </h3>
                    <p className="text-gray-600">
                      Please log in to view available plans and manage your
                      subscriptions.
                    </p>
                  </div>
                  <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Available Packages Section */}
          {sessionStorage.getItem("access_token") && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Available Packages
                </h2>
                <p className="text-gray-600">
                  Choose from our selection of subscription plans
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages
                  .filter((pkg) => pkg.isActive)
                  .map((pkg) => {
                    const activeSubscription = getActiveSubscription(pkg.id);
                    const monthlyPlan = pkg.plans.find(
                      (p) => p.interval === "MONTHLY"
                    );
                    const yearlyPlan = pkg.plans.find(
                      (p) => p.interval === "YEARLY"
                    );

                    // Calculate savings if both monthly and yearly plans exist
                    let yearlySavings = null;
                    if (monthlyPlan && yearlyPlan) {
                      yearlySavings = calculateYearlySavings(
                        monthlyPlan.price,
                        yearlyPlan.price
                      );
                    }

                    return (
                      <div
                        key={pkg.id}
                        className={`bg-white rounded-2xl border-2 ${
                          activeSubscription
                            ? "border-green-500"
                            : "border-gray-200"
                        } overflow-hidden hover:shadow-xl transition-all duration-300`}
                      >
                        {/* Package Header */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-2xl font-bold text-gray-900">
                                  {pkg.name}
                                </h3>
                                {activeSubscription && (
                                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Subscribed
                                  </span>
                                )}
                              </div>
                              {pkg.description && (
                                <p className="text-gray-600">
                                  {pkg.description}
                                </p>
                              )}
                            </div>
                            {pkg.partnerships.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="w-5 h-5 text-purple-600" />
                                <span className="text-sm text-gray-500">
                                  {pkg.partnerships.length}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Plans List */}
                        <div className="p-6">
                          <div className="space-y-4">
                            {pkg.plans.length > 0 ? (
                              pkg.plans.map((plan) => {
                                const isCurrentPlan =
                                  activeSubscription?.package.plan.id ===
                                  plan.id;

                                return (
                                  <div
                                    key={plan.id}
                                    className={`p-4 rounded-xl border ${
                                      isCurrentPlan
                                        ? "border-green-300 bg-green-50"
                                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                    } transition-colors`}
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div>
                                        <span
                                          className={`px-3 py-1 rounded-lg text-sm font-semibold ${getIntervalColor(
                                            plan.interval
                                          )}`}
                                        >
                                          {plan.interval}
                                        </span>
                                        {plan.interval === "YEARLY" &&
                                          yearlySavings &&
                                          yearlySavings.percentage > 0 && (
                                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                              Save {yearlySavings.percentage}%
                                            </span>
                                          )}
                                      </div>
                                      {isCurrentPlan && (
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                          Current Plan
                                        </span>
                                      )}
                                    </div>

                                    <div className="mb-4">
                                      <div className="text-3xl font-bold text-gray-900">
                                        {formatCurrency(plan.price)}
                                      </div>
                                      <div className="text-gray-500">
                                        {getIntervalLabel(plan.interval)}
                                      </div>
                                      {plan.interval === "YEARLY" &&
                                        yearlySavings &&
                                        yearlySavings.amount > 0 && (
                                          <div className="text-sm text-green-600 font-medium mt-1">
                                            Save{" "}
                                            {formatCurrency(
                                              yearlySavings.amount
                                            )}{" "}
                                            vs monthly
                                          </div>
                                        )}
                                    </div>

                                    {activeSubscription ? (
                                      isCurrentPlan ? (
                                        <button
                                          disabled
                                          className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl opacity-75 cursor-not-allowed"
                                        >
                                          <div className="flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Currently Active
                                          </div>
                                        </button>
                                      ) : (
                                        <button
                                          disabled
                                          className="w-full py-3 bg-gray-100 text-gray-500 font-semibold rounded-xl cursor-not-allowed"
                                        >
                                          Upgrade Available Soon
                                        </button>
                                      )
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleSubscribeClick(pkg, plan)
                                        }
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 group"
                                      >
                                        <div className="flex items-center justify-center">
                                          <ShoppingCart className="w-5 h-5 mr-2" />
                                          Subscribe Now
                                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                      </button>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">
                                  No plans available
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                  Check back later
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Partner Preview */}
                          {pkg.partnerships.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <Star className="w-5 h-5 mr-2 text-amber-600" />
                                Included Partners
                              </h4>
                              <div className="space-y-2">
                                {pkg.partnerships
                                  .slice(0, 3)
                                  .map((partnership) => (
                                    <a
                                      key={partnership.partner.id}
                                      href={partnership.partner.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group"
                                    >
                                      <img
                                        src={partnership.partner.logo}
                                        alt={partnership.partner.name}
                                        className="w-8 h-8 rounded-lg object-cover"
                                      />
                                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                        {partnership.partner.name}
                                      </span>
                                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 ml-auto" />
                                    </a>
                                  ))}
                                {pkg.partnerships.length > 3 && (
                                  <div className="text-sm text-gray-500 pl-11">
                                    +{pkg.partnerships.length - 3} more partners
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center">
                              <Info className="w-4 h-4 mr-2" />
                              {activeSubscription ? (
                                <span className="text-green-600 font-medium">
                                  Active until{" "}
                                  {formatDate(activeSubscription.endDate)}
                                </span>
                              ) : (
                                "No commitment. Cancel anytime."
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}

          {/* Empty State for Packages */}
          {packages.filter((pkg) => pkg.isActive).length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Packages Available
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                There are currently no subscription packages available. Please
                check back later.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedPackage && selectedPlan && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="min-h-screen px-4 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  Confirm Subscription
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Package Details */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Package Details
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900">
                        {selectedPackage.name}
                      </div>
                      {selectedPackage.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {selectedPackage.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedPlan.price)}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {getIntervalLabel(selectedPlan.interval)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auto-renew Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center">
                    <RefreshCw className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Auto-renew
                      </div>
                      <div className="text-sm text-gray-600">
                        Your subscription will automatically renew
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRenew}
                      onChange={(e) => setAutoRenew(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Included Benefits:
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Access to all package features</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Partner integrations included</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>Cancel anytime</span>
                    </div>
                    {selectedPlan.interval === "YEARLY" && (
                      <div className="flex items-center text-gray-700">
                        <Star className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />
                        <span>Best value - save with annual billing</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Partners Preview */}
                {selectedPackage.partnerships.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Includes {selectedPackage.partnerships.length} Partner(s):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPackage.partnerships
                        .slice(0, 5)
                        .map((partnership) => (
                          <a
                            key={partnership.partner.id}
                            href={partnership.partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <img
                              src={partnership.partner.logo}
                              alt={partnership.partner.name}
                              className="w-6 h-6 rounded"
                            />
                            <span className="text-sm text-gray-700">
                              {partnership.partner.name}
                            </span>
                          </a>
                        ))}
                      {selectedPackage.partnerships.length > 5 && (
                        <div className="px-3 py-2 bg-gray-100 rounded-lg">
                          <span className="text-sm text-gray-700">
                            +{selectedPackage.partnerships.length - 5} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-6 py-3 text-gray-700 font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={subscribing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSubscribe}
                    disabled={subscribing}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center"
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Confirm Subscription
                      </>
                    )}
                  </button>
                </div>

                {/* Security Note */}
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Shield className="w-4 h-4 mr-2" />
                    Your payment information is secure and encrypted
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
