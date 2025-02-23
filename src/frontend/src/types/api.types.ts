import { AxiosError } from "axios";

type ApiError = {
  retry: boolean;
  message: string;
};

export type AxiosApiError = AxiosError<ApiError>;
