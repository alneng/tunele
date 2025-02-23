import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuthWithCode } from "@/api/auth";

/**
 * Custom hook to handle OAuth callback
 */
export const useAuthCallback = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const code = params.get("code");
      const scope = params.get("scope");

      if (!code || !scope) {
        navigate("/");
        return;
      }

      try {
        await getAuthWithCode(code, scope);
        navigate("/");
      } catch (error) {
        console.log(error);
      }
    };

    handleAuth();
  }, [navigate, params]);
};
