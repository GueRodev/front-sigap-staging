import { LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  icon: LucideIcon;
  description?: string;
}

const PlaceholderPage = ({ title, icon: Icon, description = "Esta sección estará disponible próximamente." }: PlaceholderPageProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <div className="flex h-20 w-20 animate-fade-in items-center justify-center rounded-2xl bg-accent">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h1 className="animate-fade-in text-2xl font-bold text-foreground" style={{ animationDelay: "0.1s" }}>
        {title}
      </h1>
      <p className="max-w-md animate-fade-in text-center text-muted-foreground" style={{ animationDelay: "0.2s" }}>
        {description}
      </p>
    </div>
  );
};

export default PlaceholderPage;
