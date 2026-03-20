import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authenticate } from "@/api/auth";
import { useUserStore } from "@/store/user.store";
import { retrieveAndClearOIDCParams, validateState } from "@/utils/oidc.utils";

/**
 * Custom hook to handle OIDC callback.
 */
export const useAuthCallback = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions (infinite loop protection)
    if (hasProcessed.current) {
      return;
    }

    const handleAuth = async () => {
      // Mark as processed immediately to prevent re-runs
      hasProcessed.current = true;

      const code = params.get("code");
      const returnedState = params.get("state");

      if (!code || !returnedState) {
        console.error("Missing code or state in callback");
        navigate("/");
        return;
      }

      // Retrieve stored OIDC parameters
      const storedParams = retrieveAndClearOIDCParams();

      if (!storedParams) {
        console.error("No stored OIDC parameters found");
        navigate("/");
        return;
      }

      // Validate state (CSRF protection)
      if (!validateState(returnedState, storedParams.state)) {
        console.error("State validation failed - possible CSRF attack");
        navigate("/");
        return;
      }

      try {
        // Authenticate with OIDC
        await authenticate(code, storedParams.state, storedParams.nonce, storedParams.codeVerifier);

        // Check auth status after successful authentication
        await useUserStore.getState().checkAuth();
        navigate("/");
      } catch (error) {
        console.error("OIDC authentication failed:", error);
        navigate("/");
      }
    };

    handleAuth();
  }, [navigate, params]);
};
