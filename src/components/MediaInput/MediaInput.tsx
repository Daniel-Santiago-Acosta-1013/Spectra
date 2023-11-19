import { useState } from 'react';
import analyzeFile, { FileAnalysis } from '../../utils/fileAnalyzer';

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
        <div>
            <input type="file" onChange={handleFileChange} />
            {fileInfo && <div>File Type: {fileInfo.fileType}, Capacity: {fileInfo.capacity} characters</div>}
        </div>
    );
}

export default MediaInput;
