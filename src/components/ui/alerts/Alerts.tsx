import Swal, {
  type SweetAlertOptions,
  type SweetAlertResult,
} from "sweetalert2";

const themeColors = {
  background: "#ffffff",
  titleColor: "#1f2937",
  confirmButtonColor: "#2563eb",
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
  borderColor: "#e5e7eb",
  mutedText: "#6b7280",
};

const showAlert = (options: SweetAlertOptions): Promise<SweetAlertResult> => {
  return Swal.fire({
    background: themeColors.background,
    color: themeColors.titleColor,
    confirmButtonColor: themeColors.confirmButtonColor,
    cancelButtonColor: themeColors.cancelButtonColor,
    toast: true,
    position: "top",
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
    ...options,
  });
};

export const showSuccessAlert = (
  text: string,
  showIcon: boolean = false,
): void => {
  const alertOptions: SweetAlertOptions = {
    text,
    timer: 3000,
    showConfirmButton: false,
    background: themeColors.successBackground,
    color: themeColors.successText,
    width: "400px",
    padding: "5px",
    customClass: {
      popup: "rounded-lg border shadow-lg border-green-100",
      title: "font-semibold text-green-800",
      htmlContainer: "text-green-700",
    },
  };

  if (showIcon) {
    alertOptions.icon = "success";
    alertOptions.iconColor = themeColors.successIcon;
  }

  showAlert(alertOptions);
};

export const showErrorAlert = (
  text: string,
  showIcon: boolean = false,
): void => {
  const alertOptions: SweetAlertOptions = {
    text,
    timer: 3000,
    showConfirmButton: false,
    background: themeColors.errorBackground,
    color: themeColors.errorText,
    width: "400px",
    padding: "5px",
    customClass: {
      popup: "rounded-lg border shadow-lg border-red-100",
      title: "font-semibold text-red-800",
      htmlContainer: "text-red-700",
    },
  };

  if (showIcon) {
    alertOptions.icon = "error";
    alertOptions.iconColor = themeColors.errorIcon;
  }

  showAlert(alertOptions);
};