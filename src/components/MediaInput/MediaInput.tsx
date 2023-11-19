import { useState } from 'react';
import analyzeFile from '../../utils/fileAnalyzer';

function MediaInput() {
    const [fileInfo, setFileInfo] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const analysis = analyzeFile(file);
        setFileInfo(analysis);
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            {fileInfo && <div>File Type: {fileInfo.fileType}, Capacity: {fileInfo.capacity} characters</div>}
        </div>
    );
}

export default MediaInput;
