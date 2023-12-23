import React, { useState } from 'react';
import analyzeFile, { FileAnalysis } from '../../utils/fileAnalyzer';
import { decryptMessageFromImage } from '../../utils/imageSteganography'; 
import Swal from 'sweetalert2';
import './MediaInput.scss';

function MediaInput({ onFileChange, onDecryptAttempt }: { onFileChange: (file: File, fileType: string, capacity: number) => void, onDecryptAttempt: (isStegoDetected: boolean) => void }) {
    const [fileInfo, setFileInfo] = useState<FileAnalysis | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const analysis = analyzeFile(file);

            if (analysis.fileType === 'unsupported') {
                Swal.fire({
                    title: 'Unsupported File Type',
                    text: 'Please select a PNG, JPEG, JPG, or SVG file.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
                return;
            }
            
            setFileInfo(analysis);
            onFileChange(file, analysis.fileType, analysis.capacity);

            if (analysis.fileType === 'image') {
                try {
                    const decryptedMessage = await decryptMessageFromImage(file);
                    onDecryptAttempt(decryptedMessage !== '');
                } catch (error) {
                    onDecryptAttempt(false);
                }
            }
        }
    };

    return (
        <div className="MediaInput">
            <label htmlFor="file-upload" className="file-upload-label">
                Click to select a file
            </label>
            <input id="file-upload" type="file" onChange={handleFileChange} className="file-upload-input" />
            {fileInfo && (
                <div className="file-info">
                    <strong>File Type:</strong> {fileInfo.fileType}, <strong>Capacity:</strong> {fileInfo.capacity} characters
                </div>
            )}
        </div>
    );
}

export default MediaInput;
