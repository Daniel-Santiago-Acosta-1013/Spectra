import React, { useState } from 'react';
import MediaInput from '../../components/MediaInput/MediaInput';
import SteganographyForm from '../../components/SteganographyForm/SteganographyForm';
import './SteganographyView.scss';

function SteganographyView() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('');

  const handleFileChange = (selectedFile: File, type: string) => {
    setFile(selectedFile);
    setFileType(type);
  };

  return (
    <div className="SteganographyView">
      <h1>Spectra Steganography Suite</h1>
      <MediaInput onFileChange={handleFileChange} />
      <SteganographyForm file={file} fileType={fileType} />
    </div>
  );
}

export default SteganographyView;
