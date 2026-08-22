import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import styles from "@/components/auth/ChangePasswordForm.module.css";

export const metadata: Metadata = { title: "Change Password" };

export default function RepChangePasswordPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Update Your Password</h1>
        <p className={styles.subtitle}>
          For your security, you are required to change your default password before accessing the portal.
        </p>
      </div>
      <div className={styles.card}>
        <ChangePasswordForm portalPrefix="/rep" />
      </div>
    </div>
  );
}
