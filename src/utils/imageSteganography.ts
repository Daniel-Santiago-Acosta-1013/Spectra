export function encryptMessageInImage(file: File, message: string): Promise<File> {
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

                // Convertir el mensaje a binario
                const messageBinary = message.split('').map(char => 
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
                        resolve(encryptedFile);
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

export function decryptMessageFromImage(file: File): Promise<string> {
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

                const message = binaryMessage.match(/.{1,8}/g)?.map(byte => 
                    String.fromCharCode(parseInt(byte, 2))
                ).join('').replace(/\0/g, '') || '';

                resolve(message);
            };

            img.src = event.target.result.toString();
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}