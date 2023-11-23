import { useState } from 'react';
import MediaInput from '../../components/MediaInput/MediaInput';
import SteganographyForm from '../../components/SteganographyForm/SteganographyForm';
import './SteganographyView.scss';

function SteganographyView() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(0);
  const [isStegoDetected, setIsStegoDetected] = useState(false);

  const handleFileChange = (selectedFile: File, type: string, cap: number) => {
    setFile(selectedFile);
    setFileType(type);
    setCapacity(cap);
  };

  const handleDecryptAttempt = (isStego: boolean) => {
    setIsStegoDetected(isStego);
  };

  return (
    <div className="SteganographyView">
      <h1>Spectra Steganography Suite</h1>
      <MediaInput onFileChange={handleFileChange} onDecryptAttempt={handleDecryptAttempt} />
      <SteganographyForm file={file} fileType={fileType} capacity={capacity} isPotentialStego={isStegoDetected} />
    </div>
  );
}

export default SteganographyView;
