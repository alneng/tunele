import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuthWithCode } from "@/api/auth";
import { useUserStore } from "@/store/user.store";

/**
 * Custom hook to handle OAuth callback.
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
        // Check auth status after successful authentication
        await useUserStore.getState().checkAuth();
        navigate("/");
      } catch (error) {
        console.error(error);
        navigate("/");
      }
    };

    handleAuth();
  }, [navigate, params]);
};
