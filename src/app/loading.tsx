export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative h-20 w-20">
        {/* Glass background */}
        <div className="absolute inset-0 rounded-2xl backdrop-blur-xl bg-white/5 shadow-xl ring-1 ring-white/10"></div>

        {/* Gradient spinning ring */}
        <div
          className="absolute inset-2 rounded-full border-4 border-t-transparent animate-spin"
          style={{
            borderLeftColor: "#1d6b78",
            borderRightColor: "#3b82f6",
            borderBottomColor: "#1d6b78",
          }}
        />

        {/* Glow */}
        <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-[#1d6b78] to-[#3b82f6] opacity-20 rounded-full"></div>
      </div>
    </div>
  );
}
