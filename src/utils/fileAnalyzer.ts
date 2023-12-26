export interface FileAnalysis {
    format: string;
    capacity: number;
}

function analyzeFile(file: File): FileAnalysis {
    const format = file.type.split('/')[1].replace('svg+xml', 'svg');
    let capacity = 0;

    if (['png', 'jpeg', 'jpg', 'svg'].includes(format)) {
        capacity = Math.floor(calculateImageCapacity(file));
    } else {
        console.error('Unsupported file format');
        return { format: 'unsupported', capacity: 0 };
    }

    return { format, capacity };
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
