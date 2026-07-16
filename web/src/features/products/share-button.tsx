import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link2, MessageCircle, QrCode, Share2 } from 'lucide-react';
import { toast } from '@/stores/toast-store';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { Modal } from '@/components/ui/modal';

export function ShareButton({ title }: { title: string }) {
  const [qrOpen, setQrOpen] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    toast.success('Link copiado!', 'Cole onde quiser para compartilhar.');
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(`Olha o que eu achei na ShopSphere: ${title}\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
  }

  return (
    <>
      <Dropdown
        trigger={
          <span
            aria-label="Compartilhar produto"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border transition-colors hover:bg-muted"
          >
            <Share2 className="h-4 w-4" />
          </span>
        }
      >
        <DropdownItem onClick={shareWhatsApp}>
          <MessageCircle className="h-4 w-4 text-emerald-500" /> WhatsApp
        </DropdownItem>
        <DropdownItem onClick={copyLink}>
          <Link2 className="h-4 w-4" /> Copiar link
        </DropdownItem>
        <DropdownItem onClick={() => setQrOpen(true)}>
          <QrCode className="h-4 w-4" /> QR Code
        </DropdownItem>
      </Dropdown>

      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="Compartilhar por QR Code" className="max-w-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl bg-white p-4 shadow-soft">
            <QRCodeSVG value={url} size={196} level="M" aria-label={`QR Code para ${title}`} />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Aponte a câmera do celular para abrir <strong className="text-foreground">{title}</strong>.
          </p>
        </div>
      </Modal>
    </>
  );
}
