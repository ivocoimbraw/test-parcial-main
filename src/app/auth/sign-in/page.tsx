import BackgroundLayout from "@/components/BackgroundLayout";
import React from "react";
import LoginForm from "./login-form";

function SignIn() {
  return (
    <BackgroundLayout>
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <LoginForm />
        </div>
      </div>
    </BackgroundLayout>
  );
}

export default SignIn;
