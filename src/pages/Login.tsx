
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InteractiveLoginCharacter } from "@/components/InteractiveLoginCharacter";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-950 selection:bg-indigo-500/30">
      {/* Playful background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-600/20 blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />

      <div className="w-full max-w-md relative z-10 pt-16">
        {/* Interactive Character Component */}
        <InteractiveLoginCharacter
          isEmailFocused={isEmailFocused}
          isPasswordFocused={isPasswordFocused}
          emailLength={email.length}
        />

        <Card className="border border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden relative z-20 transition-all duration-300 hover:shadow-indigo-500/20">
          <CardHeader className="space-y-2 text-center pt-8 pb-4">
            <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Welcome Back!
            </CardTitle>
            <CardDescription className="text-slate-400 text-md font-medium">
              We're so excited to see you again.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 relative group">
                <Label htmlFor="email" className="text-slate-300 font-semibold ml-1 transition-colors group-focus-within:text-indigo-400">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    required
                    className="pl-4 h-12 rounded-xl bg-slate-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all shadow-sm focus-visible:bg-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-2 relative group">
                <Label htmlFor="password" className="text-slate-300 font-semibold ml-1 transition-colors group-focus-within:text-purple-400">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    required
                    className="pl-4 h-12 rounded-xl bg-slate-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-purple-500 focus-visible:border-purple-500 transition-all shadow-sm focus-visible:bg-slate-800"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 mt-4 text-lg font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 border-0"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Let's Go!"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-8 text-center text-sm font-medium text-slate-500 bg-slate-900/50 py-2 rounded-full w-3/4 mx-auto backdrop-blur-sm border border-slate-800">
          Only authorized users can access this platform.
        </p>
      </div>
    </div>
  );
};

export default Login;
