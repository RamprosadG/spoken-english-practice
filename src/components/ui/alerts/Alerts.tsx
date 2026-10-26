import Swal, {
  type SweetAlertOptions,
  type SweetAlertResult,
} from "sweetalert2";

const themeColors = {
  background: "#ffffff",
  titleColor: "#0f172a",
  confirmButtonColor: "#4f46e5",
  cancelButtonColor: "#dc2626",
  successBackground: "#f0fdf4",
  successText: "#166534",
  successIcon: "#22c55e",
  errorBackground: "#fef2f2",
  errorText: "#991b1b",
  errorIcon: "#ef4444",
  warningBackground: "#fffbeb",
  warningText: "#92400e",
  warningIcon: "#f59e0b",
};

const showAlert = (options: SweetAlertOptions): Promise<SweetAlertResult> => {
  return Swal.fire({
    background: themeColors.background,
    color: themeColors.titleColor,
    confirmButtonColor: themeColors.confirmButtonColor,
    cancelButtonColor: themeColors.cancelButtonColor,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    ...options,
  });
};

export const showSuccessAlert = (text: string): void => {
  showAlert({
    text,
    icon: "success",
    iconColor: themeColors.successIcon,
    background: themeColors.successBackground,
    color: themeColors.successText,
    customClass: {
      popup: "rounded-lg border shadow-lg border-green-200 text-sm font-medium",
    },
  });
};

export const showErrorAlert = (text: string): void => {
  showAlert({
    text,
    icon: "error",
    iconColor: themeColors.errorIcon,
    background: themeColors.errorBackground,
    color: themeColors.errorText,
    customClass: {
      popup: "rounded-lg border shadow-lg border-red-200 text-sm font-medium",
    },
  });
};

