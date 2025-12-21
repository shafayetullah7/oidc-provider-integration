"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Eye,
  EyeOff,
  Star,
  Link as LinkIcon,
  Globe,
  CheckCircle,
  XCircle,
  RefreshCw,
  Building,
  Search,
  Filter,
  ChevronRight,
  Users,
  TrendingUp,
  Shield,
  Globe as Globe2,
  PhoneCall,
  FileText,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

export type Partner = {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  status: "ACTIVE" | "INACTIVE";
  contactEmail: string;
  contactPhone: string;
  address: string;
  redirectUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  trackingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PartnersResponse = {
  statusCode: number;
  success: boolean;
  data: Partner[];
  message: string;
  timestamp: string;
};

type ViewMode = "grid" | "table";

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const fetchPartners = async () => {
    const accessToken = sessionStorage.getItem("access_token");

    if (!accessToken) {
      setError("Missing access token. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:4001/v1/open/partners", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Request failed (${res.status}): ${errorText}`);
      }

      const json: PartnersResponse = await res.json();
      setPartners(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filteredPartners = useMemo(() => {
    return partners.filter(
      (partner) =>
        partner.name.toLowerCase().includes(search.toLowerCase()) ||
        partner.contactEmail.toLowerCase().includes(search.toLowerCase()) ||
        partner.status.toLowerCase().includes(search.toLowerCase())
    );
  }, [partners, search]);

  const stats = useMemo(
    () => ({
      total: partners.length,
      active: partners.filter((p) => p.status === "ACTIVE").length,
      featured: partners.filter((p) => p.isFeatured).length,
      tracking: partners.filter((p) => p.trackingEnabled).length,
      inactive: partners.filter((p) => p.status === "INACTIVE").length,
    }),
    [partners]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPartners();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg bg-red-50 p-6 border border-red-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar - Partner Details */}
        {selectedPartner ? (
          <div className="hidden lg:block w-96 border-r border-gray-200 bg-white h-screen overflow-y-auto sticky top-0">
            <div className="p-6">
              <button
                onClick={() => setSelectedPartner(null)}
                className="mb-6 text-gray-500 hover:text-gray-700 flex items-center text-sm"
              >
                ← Back to all partners
              </button>

              <div className="space-y-6">
                {/* Partner Header */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={selectedPartner.logo}
                      alt={selectedPartner.name}
                      className="h-16 w-16 rounded-xl object-cover bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-white shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          selectedPartner.name
                        )}&background=4f46e5&color=fff&bold=true&size=64`;
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedPartner.name}
                    </h2>
                    <div className="flex items-center mt-2 space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedPartner.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedPartner.status}
                      </span>
                      {selectedPartner.isFeatured && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Description
                  </h3>
                  <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg">
                    {selectedPartner.description || "No description provided"}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </h3>
                    <a
                      href={`mailto:${selectedPartner.contactEmail}`}
                      className="text-sm text-blue-600 hover:underline block truncate"
                    >
                      {selectedPartner.contactEmail}
                    </a>
                    <a
                      href={`tel:${selectedPartner.contactPhone}`}
                      className="text-sm text-gray-600 hover:text-gray-900 block mt-1 flex items-center"
                    >
                      <PhoneCall className="w-3 h-3 mr-1" />
                      {selectedPartner.contactPhone}
                    </a>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Address
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedPartner.address}
                    </p>
                  </div>
                </div>

                {/* Website & Tracking */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Globe2 className="w-4 h-4 mr-2" />
                      Website
                    </h3>
                    <a
                      href={selectedPartner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      Visit Site <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Tracking
                    </h3>
                    <span
                      className={`text-sm font-medium ${
                        selectedPartner.trackingEnabled
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedPartner.trackingEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                {/* Redirect URL */}
                {selectedPartner.redirectUrl && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Redirect URL
                    </h3>
                    <p className="text-sm text-gray-500 font-mono bg-gray-50 p-3 rounded-lg truncate">
                      {selectedPartner.redirectUrl}
                    </p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Created: {formatDate(selectedPartner.createdAt)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      Updated: {formatDate(selectedPartner.updatedAt)}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {selectedPartner.isActive ? (
                        <>
                          <Eye className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-600">
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-5 h-5 text-red-600 mr-2" />
                          <span className="text-sm font-medium text-red-600">
                            Inactive
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      ID: {selectedPartner.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Partners</h1>
                  <p className="text-gray-600 mt-2">
                    Manage your partner network
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.total}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total Partners
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.active}
                      </div>
                      <div className="text-sm text-gray-500">Active</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Star className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.featured}
                      </div>
                      <div className="text-sm text-gray-500">Featured</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.tracking}
                      </div>
                      <div className="text-sm text-gray-500">Tracking</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Shield className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.inactive}
                      </div>
                      <div className="text-sm text-gray-500">Inactive</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Controls */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search partners by name, email, or status..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("table")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                          viewMode === "table"
                            ? "bg-white shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        Table
                      </button>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                          viewMode === "grid"
                            ? "bg-white shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        Grid
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Partners Content */}
            {viewMode === "table" ? (
              /* Table View */
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Partner
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Website
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Tracking
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPartners.map((partner) => (
                        <tr
                          key={partner.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedPartner(partner)}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <img
                                src={partner.logo}
                                alt={partner.name}
                                className="h-10 w-10 rounded-lg object-cover bg-gray-100 mr-4"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    partner.name
                                  )}&background=4f46e5&color=fff&bold=true&size=40`;
                                }}
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {partner.name}
                                </div>
                                {partner.isFeatured && (
                                  <div className="flex items-center mt-1">
                                    <Star className="w-3 h-3 text-amber-500 mr-1" />
                                    <span className="text-xs text-amber-600 font-medium">
                                      Featured
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                partner.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {partner.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-900">
                              {partner.contactEmail}
                            </div>
                            <div className="text-sm text-gray-500">
                              {partner.contactPhone}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <a
                              href={partner.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {new URL(partner.website).hostname}
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`text-sm font-medium ${
                                partner.trackingEnabled
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {partner.trackingEnabled ? "Enabled" : "Disabled"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-500">
                            {formatDate(partner.createdAt)}
                          </td>
                          <td className="py-4 px-6">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedPartner(partner)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="h-12 w-12 rounded-lg object-cover bg-gray-100 mr-3"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                partner.name
                              )}&background=4f46e5&color=fff&bold=true&size=48`;
                            }}
                          />
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {partner.name}
                            </h3>
                            <div className="flex items-center mt-1 space-x-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  partner.status === "ACTIVE"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {partner.status}
                              </span>
                              {partner.isFeatured && (
                                <Star className="w-3 h-3 text-amber-500" />
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {partner.description}
                      </p>

                      <div className="space-y-3 border-t border-gray-100 pt-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate">
                            {partner.contactEmail}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe2 className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate">
                            {new URL(partner.website).hostname}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-medium ${
                              partner.trackingEnabled
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {partner.trackingEnabled
                              ? "Tracking Enabled"
                              : "No Tracking"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(partner.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredPartners.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No partners found
                </h3>
                <p className="mt-2 text-gray-600">
                  {search
                    ? "Try a different search term"
                    : "No partners available"}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Detail Modal */}
      {selectedPartner && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="min-h-screen px-4 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Partner Details
                </h3>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                {/* Add the same detail content here from the sidebar */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
