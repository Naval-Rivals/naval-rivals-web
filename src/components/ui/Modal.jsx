import Box from "@mui/material/Box";
import MuiModal from "@mui/material/Modal";

/**
 * Modal - Componente base de modal usando MUI.
 * Props:
 * - handleClose: função para fechar a modal (opcional)
 * - children: conteúdo da modal
 */
function Modal({ handleClose, children }) {
  return (
    <MuiModal open={true} onClose={handleClose}>
      <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-dark-900 border border-blue-300/20 shadow-2xl p-6 rounded-2xl outline-none w-80 sm:w-96 max-w-[90vw]">
        {children}
      </Box>
    </MuiModal>
  );
}

export default Modal;
