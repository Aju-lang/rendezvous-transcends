const WavePattern = ({ className = "" }) => {
  return (
    <div 
      className={`h-4 bg-gradient-to-r from-red-500 via-red-600 to-red-500 ${className}`}
      style={{
        background: `repeating-linear-gradient(
          90deg,
          transparent 0px,
          hsl(0 100% 50%) 2px,
          hsl(0 100% 50%) 4px,
          transparent 6px,
          transparent 12px
        )`,
        transform: 'skewY(-1deg)',
      }}
    />
  );
};

export default WavePattern;