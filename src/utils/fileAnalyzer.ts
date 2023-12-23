type FileType = 'image' | 'unsupported';

export interface FileAnalysis {
    fileType: FileType;
    capacity: number;
}

function analyzeFile(file: File): FileAnalysis {
    const fileType = determineFileType(file);
    let capacity = 0;

    if (fileType === 'image') {
        capacity = calculateImageCapacity(file);
    } else {
        console.error('Unsupported file type');
    }

    return { fileType, capacity };
}

function determineFileType(file: File): FileType {
    const type = file.type.split('/')[1];
    if (type === 'png' || type === 'jpeg' || type === 'jpg' || type === 'svg+xml') return 'image';
    return 'unsupported';
}

function calculateImageCapacity(file: File): number {
    const isPng = file.type.includes('png');
    const isJpeg = file.type.includes('jpeg') || file.type.includes('jpg');
    const isSvg = file.type.includes('svg+xml');

    if (isPng || isJpeg) {
        return file.size * 8 / 24;
    } else if (isSvg) {
        return file.size * 8 / 32;
    } else {
        return 0;
    }
}

export default analyzeFile;
