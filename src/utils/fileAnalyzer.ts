type FileType = 'image' | 'audio' | 'video' | 'unsupported';

interface FileAnalysis {
    fileType: FileType;
    capacity: number;
}

function analyzeFile(file: File): FileAnalysis {
    const fileType = determineFileType(file);
    let capacity = 0;

    switch (fileType) {
        case 'image':
            capacity = calculateImageCapacity(file);
            break;
        case 'audio':
            capacity = calculateAudioCapacity(file);
            break;
        case 'video':
            capacity = calculateVideoCapacity(file);
            break;
        default:
            console.error('Unsupported file type');
            break;
    }

    return { fileType, capacity };
}

function determineFileType(file: File): FileType {
    const type = file.type.split('/')[0];
    if (type === 'image') return 'image';
    if (type === 'audio') return 'audio';
    if (type === 'video') return 'video';
    return 'unsupported';
}

function calculateImageCapacity(file: File): number {
    const isPng = file.type.includes('png');
    const isJpeg = file.type.includes('jpeg') || file.type.includes('jpg');

    if (isPng) {
        // Supongamos que el PNG es de 24 bits (8 bits por canal).
        return file.size * 8 / 24; // 1 bit por píxel
    } else if (isJpeg) {
        // Supongamos un bloque DCT de 8x8, con 1 bit por bloque.
        return file.size / 64; // 1 bit por bloque de DCT
    } else {
        return 0; // Formato no soportado
    }
}


function calculateAudioCapacity(file: File): number {
    const bitRate = 256000; // Supongamos una tasa de bits de 256 kbps para MP3
    const sampleRate = 44100; // Supongamos una tasa de muestreo estándar de 44.1 kHz
    const channels = 2; // Supongamos audio estéreo

    // Calculamos la duración del archivo en segundos
    const fileSizeInBytes = file.size;
    const fileSizeInBits = fileSizeInBytes * 8;
    const durationInSeconds = fileSizeInBits / bitRate;

    const capacity = sampleRate * durationInSeconds * channels;

    return capacity;
}



function calculateVideoCapacity(file: File): number {
    const bitRate = 5000000;

    const fileSizeInBits = file.size * 8;
    const durationInSeconds = fileSizeInBits / bitRate;

    // Supongamos una resolución común y una tasa de cuadros estándar
    const frameRate = 30; // 30 cuadros por segundo
    const resolution = 1920 * 1080; // Resolución Full HD (1080p)

    const capacity = frameRate * durationInSeconds * resolution;

    return capacity;
}


export default analyzeFile;
