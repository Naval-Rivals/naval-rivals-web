import Modal from "./Modal";

/**
 * ModalInfo - Modal informativa com ícone, título, descrição e conteúdo extra opcional.
 * Props:
 * - handleClose: função para fechar (opcional, se não passar não fecha ao clicar fora)
 * - icon: elemento React do ícone
 * - title: título da modal
 * - description: descrição/subtítulo
 * - children: conteúdo adicional (botões, contadores, etc)
 */
function ModalInfo({ handleClose, icon, title, description, children }) {
  return (
    <Modal handleClose={handleClose}>
      <div className="flex flex-col gap-3 items-center">
        {icon}
        <h3 className="font-poppins font-semibold text-white text-lg text-center">
          {title}
        </h3>
        {description && (
          <p className="font-poppins text-white/60 text-sm text-center">
            {description}
          </p>
        )}
        {children}
      </div>
    </Modal>
  );
}

export default ModalInfo;
