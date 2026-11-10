"use client";

import Modal from "@/components/ui/modals/Modal";
import { CompleteProfileForm } from "./CompleteProfileForm";
import { useAuth } from "./AuthProvider";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthModals() {
  const { activeModal, closeModal } = useAuth();

  return (
    <>
      <Modal
        isOpen={activeModal === "login"}
        onClose={closeModal}
        title="Sign In"
        className="max-w-md"
      >
        <LoginForm />
      </Modal>

      <Modal
        isOpen={activeModal === "register"}
        onClose={closeModal}
        title="Create Account"
        className="max-w-2xl"
      >
        <RegisterForm />
      </Modal>

      <Modal
        isOpen={activeModal === "complete-profile"}
        onClose={closeModal}
        title="Complete Your Profile"
        className="max-w-md"
      >
        <CompleteProfileForm />
      </Modal>
    </>
  );
}
