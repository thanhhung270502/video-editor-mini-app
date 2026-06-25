import { AxiosError } from "axios";

export const asError = (error: unknown): Error => {
  if (error instanceof AxiosError) {
    const errorMsg = error.response?.data.error || "Request failed";
    try {
      const parsedError = JSON.parse(errorMsg);
      return new Error(parsedError.error || error.message);
    } catch {
      return new Error(errorMsg);
    }
  }

  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return new Error(error.message);
    }

    try {
      return new Error(JSON.stringify(error));
    } catch {
      return new Error("An error occurred");
    }
  }

  return new Error(String(error) || "An unknown error occurred");
};
