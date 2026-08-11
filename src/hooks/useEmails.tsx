import { supabase } from "../lib/supabase";
import { useState } from "react";

function useEmails() {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("subscriptions")
      .select("email")
      .eq("subscription_status", "active");

    if (error) {
      console.error(error);
      setError(error.message);
      setLoading(false);
      return;
    }

    const emailList = data.map((sub) => sub.email);

    setEmails(emailList);
    setLoading(false);
  };

  return {
    emails,
    loading,
    error,
    fetchEmails,
  };
}

export default useEmails;
