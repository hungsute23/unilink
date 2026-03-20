import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register - UniLink",
};

export default function RegisterPage() {
  return (
    <div className="w-full">
      <RegisterForm />
    </div>
  );
}
