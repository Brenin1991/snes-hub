import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaImage, FaGamepad, FaArrowLeft } from 'react-icons/fa';
import { createGame } from '../services/api';
import toast from 'react-hot-toast';

const Container = styled(motion.div)`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 30px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 16px;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const Title = styled.h1`
  color: white;
  font-size: 32px;
  font-weight: bold;
  margin: 0;
`;

const FormContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  overflow: hidden;
`;

const Content = styled.div`
  padding: 40px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  color: white;
  font-weight: 500;
  font-size: 16px;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 15px 20px;
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
  padding: 15px 20px;
  color: white;
  font-size: 16px;
  min-height: 100px;
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
  padding: 15px;
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
  font-size: 16px;
  
  &:hover {
    color: #ff6b6b;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 30px;
`;

const Button = styled.button`
  flex: 1;
  padding: 18px;
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

const AddGame = () => {
  const navigate = useNavigate();
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
      navigate('/library');
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

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <BackButton onClick={handleBack}>
          <FaArrowLeft />
          Voltar
        </BackButton>
        <Title>Adicionar Novo Jogo</Title>
      </Header>

      <FormContainer
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
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
                    ×
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
                    ×
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
                    ×
                  </RemoveFileButton>
                </FilePreview>
              ))}
            </FormGroup>

            <ButtonGroup>
              <CancelButton type="button" onClick={handleBack}>
                Cancelar
              </CancelButton>
              <SubmitButton type="submit" disabled={loading}>
                {loading ? 'Adicionando...' : 'Adicionar Jogo'}
              </SubmitButton>
            </ButtonGroup>
          </Form>
        </Content>
      </FormContainer>
    </Container>
  );
};

export default AddGame;
