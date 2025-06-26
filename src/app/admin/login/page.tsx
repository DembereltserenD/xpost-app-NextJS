"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, Shield, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
      } else {
        // Force a hard redirect to ensure middleware runs
        window.location.href = "/admin";
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.15), transparent 40%), linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)`,
      }}
    >
      {/* Interactive cursor glow */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.2) 30%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          transition: "all 0.3s ease-out",
        }}
      />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>

        {/* Mouse follower gradient */}
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-full filter blur-3xl transition-all duration-300 ease-out pointer-events-none"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transform: "translate3d(0, 0, 0)",
          }}
        />
        <div
          className="absolute w-64 h-64 bg-gradient-to-r from-cyan-400/30 via-purple-400/30 to-pink-400/30 rounded-full filter blur-2xl transition-all duration-500 ease-out pointer-events-none"
          style={{
            left: mousePosition.x - 128,
            top: mousePosition.y - 128,
            transform: "translate3d(0, 0, 0)",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main login card */}
      <div
        className="relative z-10 w-full max-w-md transform transition-all duration-1000 ease-out animate-slide-up"
        style={{
          transform: `perspective(1000px) rotateX(${(mousePosition.y - window.innerHeight / 2) * 0.01}deg) rotateY(${(mousePosition.x - window.innerWidth / 2) * -0.01}deg)`,
        }}
      >
        <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:border-white/20">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Admin Portal
            </CardTitle>
            <CardDescription className="text-gray-400 text-lg">
              Secure access to xpost.mn administration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 group">
                <Label htmlFor="email" className="text-gray-300 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@xpost.mn"
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300 group-hover:border-white/30"
                />
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="password" className="text-gray-300 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your secure password"
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 h-12 pr-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300 group-hover:border-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <Alert className="bg-red-500/20 border-red-500/50 animate-shake">
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Access Admin Panel
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-gray-500 text-sm">
                Protected by enterprise-grade security
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
