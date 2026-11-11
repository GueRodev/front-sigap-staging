import sigapLogo from "@/assets/sigap-logo.png";

interface AppLogoProps {
  collapsed?: boolean;
}

// Logo natural ratio: 1242x350. Symbol occupies leftmost ~30% of width
// (~372px) and is roughly square.
const EXPANDED_WIDTH = 168;
const COLLAPSED_WIDTH = 44;
// Image width tuned per state:
// - Expanded: matches container so full banner is visible.
// - Collapsed: sized so the symbol (≈30% of image width) exactly fills the 44px box.
const EXPANDED_IMAGE_WIDTH = 168;
const COLLAPSED_IMAGE_WIDTH = 146; // 44 / 0.30 ≈ 146
// Center the symbol horizontally inside the collapsed container.
// Symbol spans 0..(0.30 * 146) = 0..44px → already centered, no offset needed.
const COLLAPSED_OFFSET_X = 0;

const AppLogo = ({ collapsed = false }: AppLogoProps) => {
  return (
    <div className="flex items-center justify-center overflow-hidden">
      <div
        className="relative h-12 shrink-0 overflow-hidden rounded-lg transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        }}
      >
        <img
          src={sigapLogo}
          alt="SIGAP"
          className="absolute left-0 top-1/2 max-w-none -translate-y-1/2 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            width: collapsed ? COLLAPSED_IMAGE_WIDTH : EXPANDED_IMAGE_WIDTH,
          }}
        />
      </div>
    </div>
  );
};

export default AppLogo;
