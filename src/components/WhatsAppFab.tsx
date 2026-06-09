import { MessageCircle } from 'lucide-react';

export function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/50588888888?text=Hola%20C3%20Nicaragua%2C%20necesito%20información%20sobre%20el%20catálogo"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-110"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
    </a>
  );
}
