interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="absolute bottom-6 left-6 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 px-6 py-3 rounded-xl shadow-lg font-medium transition-all animate-fade-in z-40">
      {message}
    </div>
  );
}
