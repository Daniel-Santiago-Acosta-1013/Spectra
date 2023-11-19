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
    const type = file.type.split('/')[0];
    if (type === 'image') return 'image';
    return 'unsupported';
}

function calculateImageCapacity(file: File): number {
    const isPng = file.type.includes('png');
    const isJpeg = file.type.includes('jpeg') || file.type.includes('jpg');

    if (isPng) {
        return file.size * 8 / 24; // 1 bit por píxel para PNG
    } else if (isJpeg) {
        return file.size / 64; // 1 bit por bloque de DCT para JPEG
    } else {
        return 0; // Formato no soportado
    }
}

export default analyzeFile;
