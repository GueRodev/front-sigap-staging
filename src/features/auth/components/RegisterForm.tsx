import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserPlus } from "lucide-react";

const RegisterForm = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fullEmail = username ? `${username}@ucr.ac.cr` : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register:", { fullName, email: fullEmail, password, confirmPassword });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="register-name" className="text-foreground/80 text-sm font-medium">
          Nombre completo
        </Label>
        <Input
          id="register-name"
          type="text"
          placeholder="Juan Pérez"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-12 bg-muted/50 border-border/60 focus:border-primary rounded-lg"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-foreground/80 text-sm font-medium">
          Correo institucional
        </Label>
        <div className="relative">
          <Input
            id="register-email"
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
        <Label htmlFor="register-password" className="text-foreground/80 text-sm font-medium">
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="register-password"
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

      <div className="space-y-2">
        <Label htmlFor="register-confirm" className="text-foreground/80 text-sm font-medium">
          Confirmar contraseña
        </Label>
        <div className="relative">
          <Input
            id="register-confirm"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 bg-muted/50 border-border/60 focus:border-primary rounded-lg pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold rounded-lg bg-primary hover:bg-secondary transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-secondary/25"
      >
        <UserPlus className="mr-2 h-5 w-5" />
        Registrarse
      </Button>
    </form>
  );
};

export default RegisterForm;
