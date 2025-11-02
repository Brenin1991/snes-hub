import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FaTimes, FaUpload, FaImage, FaGamepad } from 'react-icons/fa';
import { createGame } from '../services/api';
import toast from 'react-hot-toast';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  color: white;
  font-size: 24px;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Content = styled.div`
  padding: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: white;
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 12px 16px;
  color: white;
  font-size: 16px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #ff6b6b;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
  }
`;

const TextArea = styled.textarea`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 12px 16px;
  color: white;
  font-size: 16px;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #ff6b6b;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
  }
`;

const Dropzone = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  
  &:hover {
    border-color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
  }
  
  &.active {
    border-color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
  }
`;

const DropzoneIcon = styled.div`
  font-size: 48px;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.5);
`;

const DropzoneText = styled.div`
  color: white;
  font-size: 16px;
  margin-bottom: 5px;
`;

const DropzoneSubtext = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-top: 10px;
`;

const FileIcon = styled.div`
  font-size: 20px;
  color: #ff6b6b;
`;

const FileName = styled.span`
  color: white;
  font-size: 14px;
  flex: 1;
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: #ff6b6b;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const SubmitButton = styled(Button)`
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }
`;

const AddGameModal = ({ isOpen, onClose, onGameAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rom: null,
    image: null,
    screenshots: []
  });
  const [loading, setLoading] = useState(false);

  const onDropRom = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFormData(prev => ({ ...prev, rom: acceptedFiles[0] }));
    }
  };

  const onDropImage = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFormData(prev => ({ ...prev, image: acceptedFiles[0] }));
    }
  };

  const onDropScreenshots = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const newScreenshots = [...formData.screenshots, ...acceptedFiles].slice(0, 3); // Máximo 3 screenshots
      setFormData(prev => ({ ...prev, screenshots: newScreenshots }));
    }
  };

  const { getRootProps: getRomRootProps, getInputProps: getRomInputProps, isDragActive: isRomDragActive } = useDropzone({
    onDrop: onDropRom,
    accept: {
      'application/octet-stream': ['.smc', '.sfc', '.fig']
    },
    multiple: false
  });

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    onDrop: onDropImage,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    multiple: false
  });

  const { getRootProps: getScreenshotsRootProps, getInputProps: getScreenshotsInputProps, isDragActive: isScreenshotsDragActive } = useDropzone({
    onDrop: onDropScreenshots,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.rom) {
      toast.error('Nome e ROM são obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('rom', formData.rom);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      formData.screenshots.forEach((screenshot, index) => {
        formDataToSend.append(`screenshots`, screenshot);
      });

      await createGame(formDataToSend);
      toast.success('Jogo adicionado com sucesso!');
      onGameAdded();
      onClose();
      setFormData({ name: '', description: '', rom: null, image: null, screenshots: [] });
    } catch (error) {
      toast.error('Erro ao adicionar jogo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (type) => {
    setFormData(prev => ({ ...prev, [type]: null }));
  };

  const removeScreenshot = (index) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Modal
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <Title>Adicionar Novo Jogo</Title>
              <CloseButton onClick={onClose}>
                <FaTimes />
              </CloseButton>
            </Header>
            
            <Content>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Nome do Jogo *</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Super Mario World"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Descrição</Label>
                  <TextArea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o jogo..."
                  />
                </FormGroup>

                <FormGroup>
                  <Label>ROM do SNES *</Label>
                  <Dropzone
                    {...getRomRootProps()}
                    className={isRomDragActive ? 'active' : ''}
                  >
                    <input {...getRomInputProps()} />
                    <DropzoneIcon>
                      <FaGamepad />
                    </DropzoneIcon>
                    <DropzoneText>
                      {isRomDragActive ? 'Solte o arquivo aqui' : 'Arraste a ROM aqui ou clique para selecionar'}
                    </DropzoneText>
                    <DropzoneSubtext>
                      Formatos aceitos: .smc, .sfc, .fig
                    </DropzoneSubtext>
                  </Dropzone>
                  {formData.rom && (
                    <FilePreview>
                      <FileIcon><FaGamepad /></FileIcon>
                      <FileName>{formData.rom.name}</FileName>
                      <RemoveFileButton onClick={() => removeFile('rom')}>
                        <FaTimes />
                      </RemoveFileButton>
                    </FilePreview>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Imagem do Jogo (Opcional)</Label>
                  <Dropzone
                    {...getImageRootProps()}
                    className={isImageDragActive ? 'active' : ''}
                  >
                    <input {...getImageInputProps()} />
                    <DropzoneIcon>
                      <FaImage />
                    </DropzoneIcon>
                    <DropzoneText>
                      {isImageDragActive ? 'Solte a imagem aqui' : 'Arraste a imagem aqui ou clique para selecionar'}
                    </DropzoneText>
                    <DropzoneSubtext>
                      Formatos aceitos: .jpg, .png, .gif, .webp
                    </DropzoneSubtext>
                  </Dropzone>
                  {formData.image && (
                    <FilePreview>
                      <FileIcon><FaImage /></FileIcon>
                      <FileName>{formData.image.name}</FileName>
                      <RemoveFileButton onClick={() => removeFile('image')}>
                        <FaTimes />
                      </RemoveFileButton>
                    </FilePreview>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Screenshots do Jogo (Máximo 3)</Label>
                  <Dropzone
                    {...getScreenshotsRootProps()}
                    className={isScreenshotsDragActive ? 'active' : ''}
                  >
                    <input {...getScreenshotsInputProps()} />
                    <DropzoneIcon>
                      <FaImage />
                    </DropzoneIcon>
                    <DropzoneText>
                      {isScreenshotsDragActive ? 'Solte as imagens aqui' : 'Arraste as screenshots aqui ou clique para selecionar'}
                    </DropzoneText>
                    <DropzoneSubtext>
                      Máximo 3 imagens. Formatos: .jpg, .png, .gif, .webp
                    </DropzoneSubtext>
                  </Dropzone>
                  {formData.screenshots.map((screenshot, index) => (
                    <FilePreview key={index}>
                      <FileIcon><FaImage /></FileIcon>
                      <FileName>{screenshot.name}</FileName>
                      <RemoveFileButton onClick={() => removeScreenshot(index)}>
                        <FaTimes />
                      </RemoveFileButton>
                    </FilePreview>
                  ))}
                </FormGroup>

                <ButtonGroup>
                  <CancelButton type="button" onClick={onClose}>
                    Cancelar
                  </CancelButton>
                  <SubmitButton type="submit" disabled={loading}>
                    {loading ? 'Adicionando...' : 'Adicionar Jogo'}
                  </SubmitButton>
                </ButtonGroup>
              </Form>
            </Content>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default AddGameModal;
