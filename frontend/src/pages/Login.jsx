import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { AuthContext } from "../context/auth";

export default function Login() {
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await login(email, password);
      if (response.role !== "admin") {
        await logout();
        setError("Unauthorized: This portal is for administrators only.");
        return;
      }
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Admin Portal" 
      subtitle="Sign in to your administrator account to manage platform data."
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        
        {error && (
          <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-medium">
            {error}
          </div>
        )}

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
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-text-main">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-hover transition-colors font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input 
              type={showPassword ? "text" : "password"} 
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="bg-surface/50 focus:bg-surface pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full mt-2 gap-2" 
          disabled={loading || !email || !password}
        >
          {loading ? "Signing in..." : <>Sign In <LogIn className="w-4 h-4" /></>}
        </Button>
      </form>
    </AuthLayout>
  );
}