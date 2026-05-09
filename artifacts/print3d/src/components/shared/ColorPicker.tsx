import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Pipette } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
  allowCustom?: boolean;
}

const DEFAULT_COLORS = [
  { name: "Any", value: "Any", class: "bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600", icon: "?" },
  { name: "Black", value: "#000000", class: "bg-black" },
  { name: "White", value: "#FFFFFF", class: "bg-white border border-zinc-600" },
  { name: "Gray", value: "#6B7280", class: "bg-gray-500" },
  { name: "Red", value: "#EF4444", class: "bg-red-500" },
  { name: "Orange", value: "#F97316", class: "bg-orange-500" },
  { name: "Green", value: "#10B981", class: "bg-emerald-500" },
  { name: "Yellow", value: "#F59E0B", class: "bg-amber-500" },
  { name: "Blue", value: "#3B82F6", class: "bg-blue-500" },
  { name: "Purple", value: "#8B5CF6", class: "bg-violet-500" },
  { name: "Pink", value: "#EC4899", class: "bg-pink-500" },
  { name: "Brown", value: "#92400E", class: "bg-amber-800" },
  { name: "Clear", value: "Clear/Transparent", class: "bg-gradient-to-br from-white/30 to-white/10 border border-white/30", icon: "✨" },
];

export function ColorPicker({ value, onChange, allowCustom = true }: ColorPickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customColor, setCustomColor] = useState("#F97316");
  const [hue, setHue] = useState(25);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const saturationRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const selectedColor = DEFAULT_COLORS.find(c => c.name === value || c.value === value);

  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Update custom color when HSL changes
  useEffect(() => {
    setCustomColor(hslToHex(hue, saturation, lightness));
  }, [hue, saturation, lightness]);

  const handleSaturationDrag = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!saturationRef.current) return;
    
    const rect = saturationRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    
    setSaturation(Math.round(x * 100));
    setLightness(Math.round((1 - y) * 100));
  }, []);

  const handleHueDrag = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!hueRef.current) return;
    
    const rect = hueRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setHue(Math.round(x * 360));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        if (showCustom) {
          handleSaturationDrag(e);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMouseMove as any);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove as any);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, showCustom, handleSaturationDrag]);

  const applyCustomColor = () => {
    onChange(customColor);
    setShowCustom(false);
  };

  return (
    <div className="space-y-3">
      {/* Preset Colors Grid */}
      <div className="grid grid-cols-7 gap-2">
        {DEFAULT_COLORS.map((color) => (
          <motion.button
            key={color.name}
            type="button"
            onClick={() => onChange(color.name)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative w-full aspect-square rounded-xl ${color.class}
              transition-all duration-200
              ${value === color.name ? "ring-2 ring-primary ring-offset-2 ring-offset-zinc-900" : "hover:ring-1 hover:ring-white/30"}
            `}
            title={color.name}
          >
            {color.icon && <span className="text-lg">{color.icon}</span>}
            {value === color.name && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className={`w-5 h-5 ${color.name === "White" ? "text-black" : "text-white"} drop-shadow-md`} />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Custom Color Option */}
      {allowCustom && (
        <div className="pt-2 border-t border-white/10">
          {!showCustom ? (
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <Pipette className="w-4 h-4" />
              <span>Custom color...</span>
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              {/* Saturation/Lightness Box */}
              <div
                ref={saturationRef}
                className="relative h-32 rounded-lg cursor-crosshair overflow-hidden"
                style={{ backgroundColor: `hsl(${hue}, 100%, 50%)` }}
                onMouseDown={(e) => {
                  setIsDragging(true);
                  handleSaturationDrag(e);
                }}
                onTouchStart={(e) => {
                  setIsDragging(true);
                  handleSaturationDrag(e);
                }}
              >
                {/* Saturation gradient */}
                <div 
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to right, #fff, transparent)" }}
                />
                {/* Lightness gradient */}
                <div 
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent, #000)" }}
                />
                {/* Draggable indicator */}
                <motion.div
                  className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg"
                  style={{
                    left: `${saturation}%`,
                    top: `${100 - lightness}%`,
                    transform: "translate(-50%, -50%)",
                    backgroundColor: customColor,
                  }}
                  animate={{
                    scale: isDragging ? 1.2 : 1,
                  }}
                />
              </div>

              {/* Hue Slider */}
              <div
                ref={hueRef}
                className="relative h-6 rounded-full cursor-pointer"
                style={{
                  background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
                }}
                onClick={(e) => {
                  const rect = hueRef.current!.getBoundingClientRect();
                  const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  setHue(Math.round(x * 360));
                }}
              >
                <motion.div
                  className="absolute top-0 w-6 h-6 rounded-full border-2 border-white shadow-lg -translate-y-0"
                  style={{
                    left: `${(hue / 360) * 100}%`,
                    transform: "translateX(-50%)",
                    backgroundColor: `hsl(${hue}, 100%, 50%)`,
                  }}
                />
              </div>

              {/* Preview and Actions */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border border-white/20"
                  style={{ backgroundColor: customColor }}
                />
                <div className="flex-1">
                  <p className="text-xs text-zinc-500 uppercase">Selected</p>
                  <p className="text-sm text-white font-mono">{customColor}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustom(false)}
                    className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyCustomColor}
                    className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Selected Color Display */}
      <div className="flex items-center gap-2 pt-2">
        <div 
          className="w-4 h-4 rounded-full border border-white/20"
          style={{ 
            backgroundColor: selectedColor?.value || (value.startsWith('#') ? value : '#6B7280'),
            background: selectedColor?.name === "Clear" 
              ? "linear-gradient(45deg, rgba(255,255,255,0.3) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.3) 75%, transparent 75%, transparent)" 
              : selectedColor?.name === "Any"
              ? "linear-gradient(45deg, #4B5563 25%, #374151 25%, #374151 50%, #4B5563 50%, #4B5563 75%, #374151 75%, #374151)"
              : undefined 
          }}
        />
        <span className="text-sm text-zinc-400">
          {selectedColor?.name || value}
        </span>
      </div>
    </div>
  );
}

export default ColorPicker;
