import { useState, useEffect } from "react";
import { supabase, Registration } from "../lib/supabase";
import {
  Lock,
  LogOut,
  Mail,
  Phone,
  Building,
  Globe,
  User,
  FileText,
  Calendar,
  Loader,
  RefreshCw,
  Users,
  Download,
  Trash2,
  X,
  CheckSquare,
  Square,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NewsLetter from "./NewsLetter";
import Subscribers from "./RegistrationsManager";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const navigation = useNavigate();

  const rolesList = [
    "All Roles",
    "Speaker",
    "Startup Founder",
    "Investor",
    "Government Official",
    "Corporate Representative",
    "Development Partner",
    "Ecosystem Builder",
    "Academic/Researcher",
    "Media",
    "Other",
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    if (session) {
      fetchRegistrations();
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      setIsAuthenticated(true);
      fetchRegistrations();
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Login error:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setRegistrations([]);
  };

  const fetchRegistrations = async () => {
    setIsLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError(
        "Failed to load registrations. Please ensure you have admin access.",
      );
    } finally {
      setIsLoadingData(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (
      selectedIds.length === filteredRegistrations.length &&
      filteredRegistrations.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRegistrations.map((r) => r.id!));
    }
  };

  const exportCSV = (data: Registration[]) => {
    if (data.length === 0) return;

    // Define headers in specific order
    const headers = [
      "id",
      "full_name",
      "email",
      "phone",
      "organization",
      "country",
      "role",
      "field_of_activity",
      "reason",
      "created_at",
    ];

    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const val = row[header as keyof Registration] || "";
            return `"${val.toString().replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `asc_registrations_${new Date().getTime()}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `WARNING: Are you sure you want to permanently delete ${selectedIds.length} delegate(s)?`,
      )
    )
      return;

    setIsDeleting(true);
    try {
      const { error: delError } = await supabase
        .from("registrations")
        .delete()
        .in("id", selectedIds);

      if (delError) throw delError;

      setRegistrations((prev) =>
        prev.filter((r) => !selectedIds.includes(r.id!)),
      );
      setSelectedIds([]);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Security Protocol: Failed to delete selected records.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRole === "All Roles" || reg.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#001F54] flex items-center justify-center">
        <div className="text-center">
          <Loader
            className="animate-spin text-[#FDB913] mx-auto mb-4"
            size={64}
          />
          <p className="text-white font-black uppercase tracking-widest">
            Securing Connection...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#001F54] flex flex-col md:flex-row overflow-hidden font-sans">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex w-1/2 relative bg-[#003580] items-center justify-center p-20 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://placehold.co/1920x1080/001F54/003580?text=Security+Matrix"
              alt="Admin Decor"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10">
            <h1 className="text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">
              Admin <br />
              <span className="text-[#FDB913]">Terminal.</span>
            </h1>
            <p className="text-blue-200 text-xl font-bold uppercase tracking-widest border-l-4 border-[#FDB913] pl-6">
              Authorized personnel only. <br />
              Accessing the ASC Command Center.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-grow flex items-center justify-center p-8 bg-white">
          <div className="max-w-md w-full">
            <div className="mb-12 text-center lg:text-left">
              <div className="bg-[#001F54] p-4 rounded-2xl w-max mx-auto lg:mx-0 mb-6">
                <Lock className="text-[#FDB913]" size={32} />
              </div>
              <h2 className="text-4xl font-black text-[#001F54] uppercase tracking-tighter">
                System Access
              </h2>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                Sign in to manage the ecosystem
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Primary Identifier
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#FDB913] outline-none transition-all font-bold text-[#001F54]"
                    placeholder="ADMIN@ASC.COM"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Access Key
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#FDB913] outline-none transition-all font-bold text-[#001F54]"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-bold uppercase">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-[#001F54] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#003580] transition-all transform hover:scale-[1.02] shadow-xl"
              >
                Establish Connection
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Bar */}
      <nav className="bg-[#001F54] text-white py-6 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigation("/")}
            >
              <div className="rounded-lg">
                {/* <Layers className="text-[#001F54]" size={24} /> */}
                <img src="assets/fav.png" alt="logo" width={40} />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tighter">
                ASC Command Center
              </h1>
            </div>
            <div className="flex gap-5 font-semibold">
              <button
                className={
                  activeTab === "dashboard"
                    ? "border-b-2 border-[#FDB913] text-[#FDB913]"
                    : "hover:border-b-2 hover:border-[#FDB913] p-2"
                }
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard
              </button>
              <button
                className={
                  activeTab === "subscribers"
                    ? "border-b-2 border-[#FDB913] text-[#FDB913]"
                    : "hover:border-b-2 hover:border-[#FDB913] p-2"
                }
                onClick={() => setActiveTab("subscribers")}
              >
                Subscribers
              </button>
              <button
                className={
                  activeTab === "newsLetter"
                    ? "border-b-2 border-[#FDB913] text-[#FDB913]"
                    : "hover:border-b-2 hover:border-[#FDB913] p-2"
                }
                onClick={() => setActiveTab("newsLetter")}
              >
                news Letter
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl font-black uppercase tracking-widest text-sm transition-all"
            >
              <LogOut size={18} className="text-[#FDB913]" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {activeTab === "dashboard" && (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Dashboard Header/Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-8 rounded-3xl border-2 border-transparent hover:border-[#FDB913] transition-all shadow-lg group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <Users className="text-[#001F54]" size={32} />
                </div>
                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-black uppercase">
                  Active
                </span>
              </div>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">
                Total Delegates
              </h2>
              <div className="text-5xl font-black text-[#001F54]">
                {registrations.length}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border-2 border-transparent hover:border-[#FDB913] transition-all shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-amber-50 p-4 rounded-2xl">
                  <Building className="text-[#FDB913]" size={32} />
                </div>
              </div>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">
                Organizations
              </h2>
              <div className="text-5xl font-black text-[#001F54]">
                {new Set(registrations.map((r) => r.organization)).size}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border-2 border-transparent hover:border-[#FDB913] transition-all shadow-lg flex flex-col justify-between">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                Quick Actions
              </h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={fetchRegistrations}
                  className="flex-grow flex items-center justify-center gap-2 bg-[#001F54] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-md active:scale-95"
                >
                  <RefreshCw size={16} /> Sync
                </button>
                <button
                  onClick={() =>
                    exportCSV(
                      selectedIds.length > 0
                        ? registrations.filter((r) =>
                            selectedIds.includes(r.id!),
                          )
                        : registrations,
                    )
                  }
                  className="flex-grow flex items-center justify-center gap-2 bg-gray-100 text-[#001F54] py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all shadow-sm active:scale-95"
                >
                  <Download size={16} />{" "}
                  {selectedIds.length > 0
                    ? `Export (${selectedIds.length})`
                    : "Export All"}
                </button>
                {selectedIds.length > 0 && (
                  <button
                    onClick={deleteSelected}
                    disabled={isDeleting}
                    className="flex-grow flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-100 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete ({selectedIds.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Data Table View */}
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-[#001F54] p-8 text-white flex flex-col sm:flex-row justify-between items-center border-b border-white/10 gap-4">
              <div>
                <h3 className="text-3xl font-bold line-none">
                  Delegate Catalog
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-blue-200 font-bold uppercase tracking-widest text-xs opacity-60">
                    ASC 2027 REGISTRY
                  </span>
                  {selectedIds.length > 0 && (
                    <span className="bg-[#FDB913] text-[#001F54] px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      {selectedIds.length} SELECTED
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full sm:w-56 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-xs font-black text-white focus:bg-white/10 outline-none appearance-none cursor-pointer transition-all"
                  >
                    {rolesList.map((role) => (
                      <option
                        key={role}
                        value={role}
                        className="bg-[#001F54] text-white"
                      >
                        {role.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                    <RefreshCw size={12} className="rotate-90" />
                  </div>
                </div>

                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="SEARCH DELEGATES, ORGS..."
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-xs font-black text-white focus:bg-white/10 outline-none placeholder:text-white/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoadingData ? (
                <div className="flex flex-col justify-center items-center py-32 space-y-4">
                  <Loader className="animate-spin text-[#FDB913]" size={64} />
                  <p className="text-[#001F54] font-black uppercase tracking-widest">
                    Querying Registries...
                  </p>
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="py-32 text-center">
                  <div className="bg-gray-50 p-8 rounded-full w-max mx-auto mb-6">
                    <User className="text-gray-300" size={64} />
                  </div>
                  <h4 className="text-2xl font-black text-gray-400 uppercase tracking-tighter">
                    No Records Found
                  </h4>
                  <p className="text-gray-300 font-bold uppercase">
                    The search parameters returned no results
                  </p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-5 text-left">
                        <button
                          onClick={toggleAll}
                          className="text-[#001F54] transition-colors"
                        >
                          {selectedIds.length ===
                            filteredRegistrations.length &&
                          filteredRegistrations.length > 0 ? (
                            <CheckSquare className="text-[#FDB913]" size={20} />
                          ) : (
                            <Square className="text-gray-300" size={20} />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                        Delegate
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                        Organization
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                        Contact Info
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                        Region
                      </th>
                      <th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRegistrations.map((reg) => (
                      <tr
                        key={reg.id}
                        className={`transition-all group cursor-pointer ${selectedIds.includes(reg.id!) ? "bg-blue-50/50" : "hover:bg-gray-50/50"}`}
                      >
                        <td className="px-8 py-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelection(reg.id!);
                            }}
                            className="text-[#001F54] transition-colors"
                          >
                            {selectedIds.includes(reg.id!) ? (
                              <CheckSquare
                                className="text-[#FDB913]"
                                size={20}
                              />
                            ) : (
                              <Square
                                className="text-gray-300 group-hover:text-gray-400"
                                size={20}
                              />
                            )}
                          </button>
                        </td>
                        <td
                          className="px-4 py-6"
                          onClick={() => setSelectedRegistration(reg)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-[#001F54] h-12 w-12 rounded-xl flex items-center justify-center font-black text-white shrink-0 group-hover:scale-110 transition-transform shadow-lg uppercase">
                              {reg.full_name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-[#001F54] capitalize text-lg leading-tight group-hover:text-[#003580] transition-colors">
                                {reg.full_name}
                              </div>
                              <div className="text-xs font-bold text-gray-400 uppercase">
                                {reg.role}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td
                          className="px-8 py-6"
                          onClick={() => setSelectedRegistration(reg)}
                        >
                          <div className="flex items-center gap-2 font-black text-[#001F54] uppercase text-xs tracking-widest">
                            <Building size={14} className="text-[#FDB913]" />{" "}
                            {reg.organization}
                          </div>
                        </td>
                        <td
                          className="px-8 py-6"
                          onClick={() => setSelectedRegistration(reg)}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                              <Mail size={12} /> {reg.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                              <Phone size={12} /> {reg.phone}
                            </div>
                          </div>
                        </td>
                        <td
                          className="px-8 py-6"
                          onClick={() => setSelectedRegistration(reg)}
                        >
                          <div className="flex items-center gap-2 font-black text-[#001F54] uppercase text-[10px] tracking-widest bg-gray-100 w-max px-3 py-1 rounded-full border border-gray-200">
                            <Globe size={12} /> {reg.country}
                          </div>
                        </td>
                        <td
                          className="px-8 py-6 text-right"
                          onClick={() => setSelectedRegistration(reg)}
                        >
                          <div className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">
                            {new Date(reg.created_at || "").toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </div>
                          <div className="text-[10px] font-black text-[#FDB913] uppercase tracking-widest">
                            {new Date(reg.created_at || "").toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "subscribers" && (
        <div className="min-h-screen bg-gray-50 flex justify-center p-5">
          <Subscribers />
        </div>
      )}
      {activeTab === "newsLetter" && (
        <div className="min-h-screen bg-gray-50 flex justify-center p-5">
          <NewsLetter />
        </div>
      )}

      {/* Registration Detail Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#001F54]/90 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedRegistration(null)}
          ></div>

          <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-4 border-[#FDB913]">
            {/* Modal Header */}
            <div className="bg-[#001F54] p-10 text-white relative">
              <button
                onClick={() => setSelectedRegistration(null)}
                className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="bg-[#FDB913] h-24 w-24 rounded-3xl flex items-center justify-center text-4xl font-black text-[#001F54] shadow-2xl shrink-0 uppercase">
                  {selectedRegistration.full_name.charAt(0)}
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-2">
                    {selectedRegistration.full_name}
                  </h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <span className="bg-white/10 border border-white/20 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                      {selectedRegistration.role}
                    </span>
                    <span className="bg-[#FDB913] text-[#001F54] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                      {selectedRegistration.country}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                      Organization Profile
                    </h4>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <Building className="text-[#001F54]" size={24} />
                      <span className="text-lg font-black text-[#001F54] uppercase">
                        {selectedRegistration.organization}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                      Electronic Mail
                    </h4>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <Mail className="text-[#FDB913]" size={24} />
                      <span className="text-lg font-bold text-[#001F54]">
                        {selectedRegistration.email}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                      Telecommunication
                    </h4>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <Phone className="text-[#001F54]" size={24} />
                      <span className="text-lg font-bold text-[#001F54]">
                        {selectedRegistration.phone}
                      </span>
                    </div>
                  </div>

                  {selectedRegistration.field_of_activity && (
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                        Field of Activity
                      </h4>
                      <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <Target size={24} className="text-[#001F54]" />
                        <span className="text-lg font-black text-[#001F54] uppercase">
                          {selectedRegistration.field_of_activity}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                    Statement of Purpose
                  </h4>
                  <div className="bg-blue-50/50 p-8 rounded-[2rem] border-2 border-blue-100 min-h-[250px] relative">
                    <FileText
                      className="absolute top-6 right-6 text-blue-200"
                      size={48}
                    />
                    <p className="text-xl text-[#001F54] font-medium leading-relaxed relative z-10 italic">
                      "{selectedRegistration.reason}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                  <Calendar className="text-gray-300" size={20} />
                  <span className="text-sm font-black text-gray-400 uppercase tracking-widest">
                    Registered:{" "}
                    {new Date(
                      selectedRegistration.created_at || "",
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      exportCSV([selectedRegistration]);
                      setSelectedRegistration(null);
                    }}
                    className="bg-[#001F54] text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#003580] transition-all flex items-center gap-2"
                  >
                    <Download size={16} /> DOWNLOAD RECORD
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Delete this record permanently?")) {
                        try {
                          await supabase
                            .from("registrations")
                            .delete()
                            .eq("id", selectedRegistration.id);
                          setRegistrations((prev) =>
                            prev.filter(
                              (r) => r.id !== selectedRegistration.id,
                            ),
                          );
                          setSelectedRegistration(null);
                        } catch (err) {
                          console.error("Error deleting record:", err);
                          alert("Error deleting record.");
                        }
                      }
                    }}
                    className="bg-red-50 text-red-600 px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-100 transition-all flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
