import { CircleAlert } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

/**
 * ModalConfirmation - Modal de confirmação com botões Cancelar/Confirmar.
 * Props:
 * - handleConfirm: função executada ao confirmar
 * - handleCancel: função executada ao cancelar (e fechar)
 * - title: título da modal
 * - description: descrição/subtítulo
 * - confirmText: texto do botão de confirmar (default: "Confirmar")
 * - cancelText: texto do botão de cancelar (default: "Cancelar")
 * - variant: "danger" | "warning" | "default" (cor do ícone e botão)
 */
function ModalConfirmation({
  handleConfirm,
  handleCancel,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "warning",
}) {
  const iconColors = {
    danger: "text-red-400",
    warning: "text-yellow-400",
    default: "text-orange-400",
  };

  return (
    <Modal handleClose={handleCancel}>
      <div className="flex flex-col gap-3 items-center">
        <CircleAlert className={`w-10 h-10 ${iconColors[variant]}`} />
        <h3 className="font-poppins font-semibold text-white text-lg text-center">
          {title}
        </h3>
        {description && (
          <p className="font-poppins text-white/60 text-sm text-center">
            {description}
          </p>
        )}
        <div className="border-t border-white/10 pt-4 mt-1 flex w-full gap-3">
          <Button variant="secondary" onClick={handleCancel} className="flex-1">
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={handleConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ModalConfirmation;
