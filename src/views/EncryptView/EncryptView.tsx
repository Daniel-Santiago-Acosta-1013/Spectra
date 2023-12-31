import React, { useState } from 'react';
import SteganographyForm from '../../components/SteganographyForm/SteganographyForm';
import MediaInput from '../../components/MediaInput/MediaInput';
import './EncryptView.scss';

const EncryptView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<string>('');
    const [capacity, setCapacity] = useState<number>(0);

    const handleFileChange = (selectedFile: File, type: string, cap: number) => {
        setFile(selectedFile);
        setFileType(type);
        setCapacity(cap);
    };

    return (
        <div className='EncryptView'>
            <h1>Image Data Encryption</h1>
            <MediaInput onFileChange={handleFileChange} />
            {file && <SteganographyForm file={file} fileType={fileType} capacity={capacity} mode="encrypt" isPotentialStego={false} />}
        </div>
    );
}

export default EncryptView;
