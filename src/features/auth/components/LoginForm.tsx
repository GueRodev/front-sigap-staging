import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import LoadingOverlay from "@/components/shared/LoadingOverlay";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fullEmail = username ? `${username}@ucr.ac.cr` : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(fullEmail, password);
    if (success) {
      setIsLoading(true);
      const user = useAuthStore.getState().user;
      setTimeout(() => {
        navigate(user?.role === "super_admin" ? "/admin" : "/catalogo");
      }, 1500);
    } else {
      toast({ title: "Error", description: "Credenciales inválidas", variant: "destructive" });
    }
  };

  return (
    <>
    <LoadingOverlay isLoading={isLoading} message="Iniciando sesión..." />
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-foreground/80 text-sm font-medium">
          Correo institucional
        </Label>
        <div className="relative">
          <Input
            id="login-email"
            type="text"
            placeholder="usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-12 bg-muted/50 border-border/60 focus:border-primary rounded-lg pr-[120px]"
            required
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium select-none">
            @ucr.ac.cr
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password" className="text-foreground/80 text-sm font-medium">
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 bg-muted/50 border-border/60 focus:border-primary rounded-lg pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm text-primary hover:text-secondary transition-colors font-medium"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold rounded-lg bg-primary hover:bg-secondary transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-secondary/25"
      >
        <LogIn className="mr-2 h-5 w-5" />
        Iniciar Sesión
      </Button>
    </form>
    </>
  );
};

export default LoginForm;
