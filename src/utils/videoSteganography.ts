export function encryptMessageInVideo(file: File, message: string): Promise<File> {
    // Lógica para incrustar un mensaje en un video
    return Promise.resolve(file);
}

export function decryptMessageFromVideo(file: File): Promise<string> {
    // Lógica para extraer un mensaje de un video
    return Promise.resolve("Decrypted message from video");
}
