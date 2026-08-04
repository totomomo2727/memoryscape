const VARIANTS = {
  solid: 'border border-black bg-black text-white hover:bg-white hover:text-black',
  outline: 'border border-black bg-transparent text-black hover:bg-black hover:text-white',
};

export default function Button({ children, variant = 'outline', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`font-mono inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-100 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
