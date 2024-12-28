import React, { useState, useRef, ChangeEvent } from 'react';
import { Download, Lock, FileImage, MessageSquare } from 'lucide-react';
import { SteganoAnimation } from './components/SteganoAnimation/SteganoAnimation';
import { SteganoGuide } from './components/SteganoGuide/SteganoGuide';
import { encodeMessage, decodeMessage, getImageCapacity } from './utils/steganography';
import { translations } from './translations/es';

function App() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estado que guarda el File seleccionado (para no perderlo al limpiar el input)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Estado que guarda la capacidad en caracteres
  const [capacity, setCapacity] = useState<number | null>(null);

  // Control del loader
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Manejador cuando el usuario elige un archivo.
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Guardamos el File en el estado
    setSelectedFile(file);

    // Reset de errores y resultados previos
    setError(null);
    setResult(null);
    setMessage('');
    setIsLoading(true);

    try {
      if (mode === 'encode') {
        // 1) Primero calculamos la capacidad
        const capacityInChars = await getImageCapacity(file);
        setCapacity(capacityInChars);
        // No codificamos aquí, solo calculamos la capacidad y esperamos a que el usuario escriba el mensaje
      } else {
        // En modo decode, decodificamos directamente
        const decodedMessage = await decodeMessage(file);
        if (!decodedMessage) {
          throw new Error(translations.errors.noHiddenMessage);
        }
        setMessage(decodedMessage);
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('too large')) {
        setError(translations.errors.messageTooLarge);
      } else if (errorMessage.includes('invalid length')) {
        setError(translations.errors.invalidLength);
      } else {
        setError(translations.errors.processingError);
      }
      if (mode === 'decode') {
        setMessage('');
      }

      // Si hay error, limpiamos el archivo
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manejador para codificar el mensaje una vez escrito.
   */
  const handleEncode = async () => {
    // Validamos que haya capacidad calculada
    if (capacity === null) {
      setError('Primero sube una imagen para calcular la capacidad.');
      return;
    }

    // Validamos que haya un mensaje
    if (!message.trim()) {
      setError(translations.errors.noMessage);
      return;
    }

    // Validamos que no supere la capacidad
    if (message.length > capacity) {
      setError(
        `La imagen solo puede almacenar ${capacity} caracteres. Tu mensaje tiene ${message.length}.`
      );
      return;
    }

    // Validamos que haya un archivo
    if (!selectedFile) {
      setError('No se encontró la imagen. Sube una imagen antes de codificar.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const encodedImage = await encodeMessage(selectedFile, message);
      setResult(encodedImage);
      setMessage('');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('too large')) {
        setError(translations.errors.messageTooLarge);
      } else if (errorMessage.includes('invalid length')) {
        setError(translations.errors.invalidLength);
      } else {
        setError(translations.errors.processingError);
      }
    } finally {
      setIsLoading(false);
      // Limpiamos el input y el archivo si deseas
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
      setCapacity(null);
    }
  };

  /**
   * Manejador para cambiar el valor del textarea,
   * limitando el máximo de caracteres según la capacidad.
   */
  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (capacity !== null && newValue.length > capacity) {
      setMessage(newValue.slice(0, capacity));
    } else {
      setMessage(newValue);
    }
  };

  /**
   * Restablece el estado cuando cambie de modo.
   */
  const resetState = () => {
    setMessage('');
    setError(null);
    setResult(null);
    setCapacity(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            {translations.title}
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            {translations.subtitle}
          </p>
        </header>

        <div className="max-w-xl mx-auto bg-gray-800 rounded-lg p-4 md:p-8 shadow-xl mb-8 md:mb-12">
          {/* Botones de modo */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 md:mb-8">
            <button
              onClick={() => {
                setMode('encode');
                resetState();
              }}
              className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                mode === 'encode'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Lock size={18} />
              <span className="text-sm md:text-base">{translations.encode.button}</span>
            </button>
            <button
              onClick={() => {
                setMode('decode');
                resetState();
              }}
              className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                mode === 'decode'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <MessageSquare size={18} />
              <span className="text-sm md:text-base">{translations.decode.button}</span>
            </button>
          </div>

          {/* Textarea para escribir el mensaje (solo encode) */}
          {mode === 'encode' && (
            <div className="mb-4">
              <textarea
                value={message}
                onChange={handleMessageChange}
                placeholder={translations.encode.placeholder}
                // Deshabilitado si aún no hay capacidad (no se ha subido imagen) o si está cargando
                disabled={capacity === null || isLoading}
                className="w-full h-24 md:h-32 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {/* Contador de caracteres */}
              {capacity !== null && (
                <div className="text-gray-400 text-right text-xs mt-1">
                  {`${message.length}/${capacity} caracteres`}
                </div>
              )}
            </div>
          )}

          {/* Mostrar el mensaje decodificado (solo decode) */}
          {mode === 'decode' && (
            <div className="mb-6">
              <textarea
                value={message}
                onChange={() => {}}
                placeholder={translations.decode.placeholder}
                readOnly
                className="w-full h-24 md:h-32 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
              />
            </div>
          )}

          {/* Botón para subir imagen */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <FileImage size={18} />
              {isLoading
                ? 'Cargando...'
                : mode === 'encode'
                ? translations.encode.selectImage
                : translations.decode.selectImage}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Botón para codificar (solo encode) */}
          {mode === 'encode' && (
            <div className="mt-4 text-center">
              <button
                onClick={handleEncode}
                disabled={isLoading || capacity === null}
                className="inline-flex items-center gap-2 py-2 px-4 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Codificando...' : 'Codificar mensaje'}
              </button>
            </div>
          )}

          {/* Mensajes de error */}
          {error && (
            <div className="mt-4 text-red-400 text-center text-sm md:text-base">
              {error}
            </div>
          )}

          {/* Enlace para descargar la imagen codificada */}
          {result && mode === 'encode' && (
            <div className="mt-6 text-center">
              <a
                href={result}
                download="stegano-image.png"
                className="inline-flex items-center gap-2 py-2 px-4 bg-green-600 rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
              >
                <Download size={18} />
                {translations.encode.download}
              </a>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">
            {translations.howItWorks}
          </h2>
          <SteganoGuide />
          <SteganoAnimation />
        </div>
      </div>
    </div>
  );
}

export default App;
