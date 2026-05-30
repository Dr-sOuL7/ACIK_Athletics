import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { supabase } from "../api/supabase";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/errorHelper";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we actually have a recovery session
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Recovery in progress, good to proceed
      }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      setSuccess(true);
      toast.success("Password updated successfully!");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full glass rounded-3xl p-8 border border-white/5 text-center space-y-6">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-white">Password Updated</h2>
          <p className="text-text-muted">Your password has been changed successfully. You can now log in with your new password.</p>
          <Button variant="primary" className="w-full" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-elevated border border-white/10 shadow-xl mb-6">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-heading font-black text-white mb-2 tracking-tight">
            Reset Password
          </h2>
          <p className="text-text-muted text-lg">
            Enter your new password below.
          </p>
        </div>

        <div className="glass rounded-3xl p-8 sm:p-10 border border-white/5 shadow-2xl">
          <form className="space-y-6" onSubmit={handleReset}>
            
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
                </div>
                <Input 
                  type={showPassword ? "text" : "password"}
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-surface-elevated border-white/10 focus:border-primary/50 py-3"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Confirm New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
                </div>
                <Input 
                  type={showPassword ? "text" : "password"}
                  required 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 bg-surface-elevated border-white/10 focus:border-primary/50 py-3"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-3 text-base font-semibold mt-8" 
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
