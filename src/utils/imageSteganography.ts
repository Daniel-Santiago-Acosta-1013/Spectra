export function encryptMessageInImage(file: File, message: string): Promise<File> {
    return new Promise((resolve, reject) => {
        // Convertir el mensaje a binario
        const messageBinary = message.split('').map(char => {
            return char.charCodeAt(0).toString(2).padStart(8, '0');
        }).join('') + '00000000'; // Agregar un marcador de finalización

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);

                const imageData = context.getImageData(0, 0, img.width, img.height);
                let data = imageData.data;

                // Incrustar el mensaje en el canal alfa de la imagen
                for (let i = 0; i < messageBinary.length; i++) {
                    // Cambiar el bit menos significativo
                    const bit = parseInt(messageBinary[i]);
                    data[i * 4 + 3] = (data[i * 4 + 3] & 0xFE) | bit;
                }

                context.putImageData(imageData, 0, 0);

                // Convertir el canvas a un archivo
                canvas.toBlob((blob) => {
                    const encryptedFile = new File([blob], file.name, {type: file.type});
                    resolve(encryptedFile);
                }, file.type);
            };
            img.src = event.target.result;
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}


export function decryptMessageFromImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);

                const imageData = context.getImageData(0, 0, img.width, img.height);
                let data = imageData.data;

                let binaryMessage = '';
                for (let i = 0; i < data.length; i += 4) {
                    // Extraer el bit menos significativo del canal alfa
                    binaryMessage += (data[i + 3] & 1).toString();
                }

                // Convertir binario a texto
                const message = binaryMessage.match(/.{1,8}/g).map(byte => {
                    return String.fromCharCode(parseInt(byte, 2));
                }).join('');

                // Detectar el marcador de finalización
                const endIndex = message.indexOf('\0');
                resolve(endIndex !== -1 ? message.substr(0, endIndex) : message);
            };
            img.src = event.target.result;
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

