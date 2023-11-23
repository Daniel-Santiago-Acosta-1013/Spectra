import React, { useState } from 'react';
import analyzeFile, { FileAnalysis } from '../../utils/fileAnalyzer';
import './MediaInput.scss';

function MediaInput({ onFileChange }: { onFileChange: (file: File, fileType: string, capacity: number) => void }) {
    const [fileInfo, setFileInfo] = useState<FileAnalysis | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const analysis = analyzeFile(file);
            setFileInfo(analysis);
            onFileChange(file, analysis.fileType, analysis.capacity);
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
