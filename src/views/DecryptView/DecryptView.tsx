import React, { useState } from 'react';
import SteganographyForm from '../../components/SteganographyForm/SteganographyForm';
import MediaInput from '../../components/MediaInput/MediaInput';
import './DecryptView.scss';

const DecryptView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<string>('');
    const [capacity, setCapacity] = useState<number>(0);
    const [key, setKey] = useState<string>('');

    const handleFileChange = (selectedFile: File, type: string, cap: number) => {
        setFile(selectedFile);
        setFileType(type);
        setCapacity(cap);
    };

    return (
        <div className="DecryptView">
            <h1>Decrypt Image Information</h1>
            <MediaInput onFileChange={handleFileChange} />
            {file && <SteganographyForm file={file} fileType={fileType} capacity={capacity} mode="decrypt" isPotentialStego={false} />}
            <input type="text" value={key} onChange={e => setKey(e.target.value)} placeholder="Enter decryption key" className='input-key'/>
        </div>
    );
}

export default DecryptView;
