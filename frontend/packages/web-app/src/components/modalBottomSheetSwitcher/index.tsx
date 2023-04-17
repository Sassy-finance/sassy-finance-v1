import React from 'react';
import {Modal, ModalProps} from '@aragon/ui-components';
import BottomSheet, {BottomSheetProps} from 'components/bottomSheet';
import useScreen from 'hooks/useScreen';

const ModalBottomSheetSwitcher: React.FC<ModalProps & BottomSheetProps> = ({
  title,
  subtitle,
  isOpen,
  onClose,
  children,
  closeOnDrag,
  onOpenAutoFocus,
}) => {
  const {isDesktop} = useScreen();

  return (
    <>
      {isDesktop ? (
        <Modal
          isOpen={isOpen}
          onClose={() => onClose && onClose()}
          title={title}
          subtitle={subtitle}
          onOpenAutoFocus={onOpenAutoFocus}
        >
          {children}
        </Modal>
      ) : (
        <BottomSheet
          isOpen={isOpen || false}
          onClose={() => onClose?.()}
          title={title}
          subtitle={subtitle}
          closeOnDrag={closeOnDrag}
        >
          {children}
        </BottomSheet>
      )}
    </>
  );
};

export default ModalBottomSheetSwitcher;
