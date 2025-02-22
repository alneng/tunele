import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuthWithCode } from "../api/auth";

/**
 * Custom hook to handle OAuth callback
 */
export const useAuthCallback = async () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const code: string | null = params.get("code");
  const scope: string | null = params.get("scope");

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
