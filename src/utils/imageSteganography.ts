import CryptoJS from 'crypto-js';

export function encryptMessageInImage(file: File, message: string): Promise<{ encryptedFile: File, key: string }> {
    return new Promise((resolve, reject) => {
        // Genera una clave AES aleatoria
        const key = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
        const encryptedMessage = CryptoJS.AES.encrypt(message, key).toString();

        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target || !event.target.result) {
                reject(new Error("Fallo al obtener el resultado del FileReader"));
                return;
            }

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const context = canvas.getContext('2d');
                if (!context) {
                    reject(new Error("No se pudo obtener el contexto del canvas"));
                    return;
                }

                context.drawImage(img, 0, 0);
                const imageData = context.getImageData(0, 0, img.width, img.height);
                const data = imageData.data;

                // Convertir el mensaje encriptado a binario
                const messageBinary = encryptedMessage.split('').map(char => 
                    char.charCodeAt(0).toString(2).padStart(8, '0')
                ).join('') + '00000000';

                for (let i = 0; i < messageBinary.length; i++) {
                    const bit = parseInt(messageBinary[i]);
                    data[i * 4 + 3] = (data[i * 4 + 3] & 0xFE) | bit;
                }

                context.putImageData(imageData, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const encryptedFile = new File([blob], file.name, {type: file.type});
                        resolve({ encryptedFile, key });
                    } else {
                        reject(new Error("Fallo al convertir el canvas a Blob"));
                    }
                }, file.type);
            };

            img.src = event.target.result.toString();
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

export function decryptMessageFromImage(file: File, key: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target || !event.target.result) {
                reject(new Error("Fallo al obtener el resultado del FileReader"));
                return;
            }

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const context = canvas.getContext('2d');
                if (!context) {
                    reject(new Error("No se pudo obtener el contexto del canvas"));
                    return;
                }

                context.drawImage(img, 0, 0);
                const imageData = context.getImageData(0, 0, img.width, img.height);
                const data = imageData.data;

                let binaryMessage = '';
                for (let i = 0; i < data.length; i += 4) {
                    binaryMessage += (data[i + 3] & 1).toString();
                }

                try {
                    // Decodifica el mensaje utilizando la clave AES proporcionada
                    const decryptedBytes = CryptoJS.AES.decrypt(binaryMessage, key);
                    const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
                    if (!decryptedMessage) {
                        throw new Error();
                    }
                    resolve(decryptedMessage);
                } catch (e) {
                    reject(new Error("Fallo al desencriptar el mensaje"));
                }
            };

            img.src = event.target.result.toString();
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}