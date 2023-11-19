import { useState } from 'react';
import MediaInput from '../../components/MediaInput/MediaInput';
import SteganographyForm from '../../components/SteganographyForm/SteganographyForm';
import './SteganographyView.scss';

function SteganographyView() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(0);

  const handleFileChange = (selectedFile: File, type: string, cap: number) => {
    setFile(selectedFile);
    setFileType(type);
    setCapacity(cap);
  };

  return (
    <div className="SteganographyView">
      <h1>Spectra Steganography Suite</h1>
      <MediaInput onFileChange={handleFileChange} />
  
      <SteganographyForm file={file} fileType={fileType} capacity={capacity} />
    </div>
  );
}

export default SteganographyView;

