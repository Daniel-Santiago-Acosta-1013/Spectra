export async function encryptMessageInAudio(file: File, message: string): Promise<File> {
    const messageBinary = stringToBinary(message);
    const audioBuffer = await readFileAsArrayBuffer(file);
    const modifiedBuffer = embedMessageInAudioBuffer(audioBuffer, messageBinary);
    const modifiedFile = new File([modifiedBuffer], file.name, { type: file.type });
    return modifiedFile;
}

export async function decryptMessageFromAudio(file: File): Promise<string> {
    const audioBuffer = await readFileAsArrayBuffer(file);
    const messageBinary = extractMessageFromAudioBuffer(audioBuffer);
    const message = binaryToString(messageBinary);
    return message;
}

function stringToBinary(str: string): string {
    return str.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');
}

function binaryToString(binary: string): string {
    return binary.match(/.{1,8}/g)?.map(byte => {
        return String.fromCharCode(parseInt(byte, 2));
    }).join('') ?? '';
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function embedMessageInAudioBuffer(audioBuffer: ArrayBuffer, messageBinary: string): ArrayBuffer {
    const audioData = new Uint8Array(audioBuffer);
    const messageLength = messageBinary.length;
    let messageIndex = 0;

    if (messageLength * 8 > audioData.length) {
        throw new Error("El mensaje es demasiado largo para ser incrustado en este archivo de audio.");
    }

    for (let i = 0; i < audioData.length; i++) {
        if (messageIndex < messageLength) {
            const audioByte = audioData[i];
            const messageBit = parseInt(messageBinary[messageIndex], 2);
            audioData[i] = (audioByte & 0xFE) | messageBit;
            messageIndex++;
        } else {
            break;
        }
    }

    return audioData.buffer;
}

function extractMessageFromAudioBuffer(audioBuffer: ArrayBuffer): string {
    const audioData = new Uint8Array(audioBuffer);
    let messageBinary = '';
    let currentByte = '';

    for (let i = 0; i < audioData.length; i++) {
        const audioByte = audioData[i];
        const messageBit = audioByte & 0x01;
        currentByte += messageBit.toString();

        if (currentByte.length === 8) {
            messageBinary += currentByte;
            currentByte = '';
        }
    }

    return messageBinary;
}
