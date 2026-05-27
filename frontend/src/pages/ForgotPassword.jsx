import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { supabase } from "../api/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      setStatus("success");
    } catch (error) {
      console.error(error);
      alert("Failed to send reset link: " + error.message);
      setStatus("idle");
    }
  };

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your email to receive a reset link."
    >
      {status === "success" ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-success/30">
            <Mail className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Check your inbox</h3>
          <p className="text-text-muted mb-8">
            We've sent password reset instructions to {email}
          </p>
          <Link to="/login">
            <Button variant="surface" className="w-full">
              Back to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-main">Email address</label>
            <Input 
              type="email" 
              required
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="athlete@example.com" 
              className="bg-surface/50 focus:bg-surface"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-2" 
            disabled={status === "loading" || !email}
          >
            {status === "loading" ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center mt-6">
            <Link to="/login" className="text-sm text-text-muted hover:text-primary transition-colors inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
