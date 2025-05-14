import React from "react";
import Modal from "react-modal";

const TuneleModal: React.FC<Modal.Props> = ({
  isOpen,
  onRequestClose,
  children,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="bg-[#131213] text-white border-gray-800 border-2 p-10 mx-auto max-w-xs md:max-w-lg text-center"
      overlayClassName="overlay"
      ariaHideApp={false}
    >
      {children}
    </Modal>
  );
};

export default TuneleModal;
