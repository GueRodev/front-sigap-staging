import { ReactNode } from "react";
import { Camera, Laptop, Monitor, Projector, Headphones, Video } from "lucide-react";
import sigapLogo from "@/assets/sigap-logo.png";

interface AuthLayoutProps {
  children: ReactNode;
}

const FloatingIcon = ({
  icon: Icon,
  className,
}: {
  icon: typeof Camera;
  className?: string;
}) => (
  <div className={`absolute opacity-[0.12] ${className}`}>
    <Icon className="w-9 h-9 lg:w-16 lg:h-16 text-primary-foreground" strokeWidth={1.2} />
  </div>
);

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Branding Panel */}
      <div className="relative lg:w-[48%] bg-gradient-to-br from-sigap-sky via-sigap-blue to-sigap-dark flex items-center justify-center p-8 lg:p-16 overflow-hidden">
        {/* Decorative floating icons */}
        <FloatingIcon icon={Camera} className="top-[4%] left-[4%] animate-float lg:top-[12%] lg:left-[10%]" />
        <FloatingIcon icon={Laptop} className="bottom-[4%] left-[5%] animate-float [animation-delay:1s] lg:bottom-[20%] lg:left-[8%]" />
        <FloatingIcon icon={Monitor} className="hidden lg:block top-[25%] right-[12%] animate-float [animation-delay:2s]" />
        <FloatingIcon icon={Projector} className="top-[5%] right-[4%] animate-float [animation-delay:3s] lg:top-[10%] lg:right-[30%]" />
        <FloatingIcon icon={Headphones} className="bottom-[4%] right-[5%] animate-float [animation-delay:4s] lg:bottom-[15%] lg:right-[10%]" />
        <FloatingIcon icon={Video} className="hidden lg:block bottom-[42%] right-[5%] animate-float [animation-delay:2.5s]" />

        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.08),transparent_70%)]" />

        <div className="relative z-10 text-center lg:text-left max-w-md">
          <img
            src={sigapLogo}
            alt="SIGAP Logo"
            className="h-14 lg:h-20 mb-6 mx-auto lg:mx-0 drop-shadow-lg rounded-lg"
          />
          <h1 className="font-display text-2xl lg:text-4xl font-bold text-primary-foreground mb-3 tracking-tight">
            Sistema Integral de Gestión
          </h1>
          <p className="text-primary-foreground/80 text-base lg:text-lg font-light leading-relaxed">
            Gestión de Activos y Préstamos — Administra, controla y optimiza tus recursos de manera eficiente y segura.
          </p>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
