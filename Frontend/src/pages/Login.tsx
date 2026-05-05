import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  /*useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/athlete-profile");
      }
    });

    return () => unsubscribe();
  }, [navigate]);*/

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) e.email = "Please enter your email address.";
    else if (!email.includes("@")) e.email = "An email address must contain a single @.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "An email address must contain a single @.";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  //UPDATR
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();

      console.log("TOKEN:", token);

      const res = await fetch("http://localhost:3000/api/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      console.log("PROFILE:", data);

      if (data.role === "athlete") {
        navigate("/athlete-profile");
      } else if (data.role === "coach") {
        navigate("/coach-profile");
      } else if (data.role === "scout") {
        navigate("/scout-profile");
      } else {
        navigate("/feed");
      }

    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <MainLayout backTo="/">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Log in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Email<span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => { const v = e.target.value; setEmail(v); if (!v.trim()) setErrors(p => ({ ...p, email: "Please enter your email address." })); else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) setErrors(p => ({ ...p, email: "An email address must contain a single @." })); else setErrors(p => ({ ...p, email: undefined })); }}
              placeholder="example: someone@example.com"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Password<span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm font-medium text-secondary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full py-6 text-base" size="lg">
            Log In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/" className="font-semibold text-secondary hover:underline">
            Sign up
          </a>
        </p>
        <button
          type="button"
          onClick={() => navigate("/reset-password")}
          className="mt-3 w-full text-center text-sm font-medium text-secondary hover:underline"
        >
          Go to Reset Password
        </button>
      </div>
    </MainLayout>
  );
};

export default Login;