import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Loader } from "lucide-react";
import { toast } from "react-toastify";

type Registration = {
  id?: string;
  full_name: string;
  email: string;
  phone: string;
  payment_ref: string;
  payment_status: string; // 'pending' ou 'completed'
  created_at: string;
};

export default function RegistrationsManager() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [verifyingRef, setVerifyingRef] = useState<string | null>(null);

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
      console.error("Erreur chargement registrations:", err);
      toast.error("Impossible de charger les inscriptions.");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Fonction pour vérifier le statut via l'API XentriPAY
  const verifyPaymentStatus = async (paymentRef: string) => {
    if (!paymentRef) {
      toast.error("Aucune référence de paiement trouvée.");
      return;
    }

    setVerifyingRef(paymentRef);

    try {
      const response = await fetch(`/api/payment-requests/check-status?customerRef=${paymentRef}`);
      const data = await response.json();

      if (data.data && data.data.status === "COMPLETED") {
        // Mise à jour de Supabase
        const { error } = await supabase
          .from("registrations")
          .update({ payment_status: "completed" })
          .eq("payment_ref", paymentRef);

        if (error) throw error;

        // Mise à jour de l'état local
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.payment_ref === paymentRef
              ? { ...reg, payment_status: "completed" }
              : reg
          )
        );

        toast.success("Paiement vérifié et confirmé avec succès !");
      } else {
        toast.info(`Statut actuel chez l'opérateur : ${data.data?.status || "En attente"}`);
      }
    } catch (err) {
      console.error("Erreur vérification paiement:", err);
      toast.error("Erreur lors de la communication avec l'API de paiement.");
    } finally {
      setVerifyingRef(null);
    }
  };

  return (
    <div className="bg-white shadow-2xl overflow-hidden border border-gray-100 w-full max-w-7xl mx-auto rounded-lg p-6">
      <h2 className="text-2xl font-bold text-[#001F54] mb-6">
        Gestion des Inscriptions & Paiements
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-[#001F54]">
            <tr>
              <th className="px-6 py-3 text-white text-center">Nom</th>
              <th className="px-6 py-3 text-white text-center">Email</th>
              <th className="px-6 py-3 text-white text-center">Téléphone</th>
              <th className="px-6 py-3 text-white text-center">Référence</th>
              <th className="px-6 py-3 text-white text-center">Statut Paiement</th>
              <th className="px-6 py-3 text-white text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoadingData ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="animate-spin" size={18} />
                    Chargement...
                  </div>
                </td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Aucune inscription trouvée
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.payment_ref || reg.email} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center font-medium">{reg.full_name}</td>
                  <td className="px-6 py-4 text-center">{reg.email}</td>
                  <td className="px-6 py-4 text-center">{reg.phone}</td>
                  <td className="px-6 py-4 text-center font-mono text-xs">{reg.payment_ref}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        reg.payment_status === "completed" || reg.payment_status === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {reg.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {reg.payment_status !== "completed" && (
                      <button
                        disabled={verifyingRef === reg.payment_ref}
                        onClick={() => verifyPaymentStatus(reg.payment_ref)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-semibold disabled:opacity-50"
                      >
                        {verifyingRef === reg.payment_ref ? "Vérification..." : "Vérifier le paiement"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}