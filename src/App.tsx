import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Download, Lock, FileImage, MessageSquare, ArrowRight } from 'lucide-react';
import { SteganoAnimation } from './components/SteganoAnimation/SteganoAnimation';
import { SteganoGuide } from './components/SteganoGuide/SteganoGuide';
import { encodeMessage, decodeMessage, getImageCapacity } from './utils/steganography';
import { translations } from './translations/es';
import * as anime from 'animejs';

function App() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estado que guarda el File seleccionado (para no perderlo al limpiar el input)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);

  // Estado que guarda la capacidad en caracteres
  const [capacity, setCapacity] = useState<number | null>(null);

  // Control del loader
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for encode steps
  const [encodeStep, setEncodeStep] = useState<number>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  /**
   * Animate step transitions
   */
  useEffect(() => {
    const animateStep = (step: number) => {
      const currentStepRef = [step1Ref, step2Ref, step3Ref][step - 1];
      const otherStepRefs = [step1Ref, step2Ref, step3Ref].filter((_, i) => i !== step - 1);

      // Hide others instantly
      otherStepRefs.forEach(ref => {
        if (ref.current) ref.current.style.display = 'none';
      });

      // Animate in current step
      if (currentStepRef.current) {
        currentStepRef.current.style.display = 'block'; // Or 'flex'/'grid' if needed
        anime.waapi.animate(currentStepRef.current, {
          opacity: [0, 1],
          translateY: ['15px', '0px'],
          duration: 500,
          ease: 'out', // Use default ease-out from waapi sensible defaults
        });
      }
    };

    if (mode === 'encode') {
      animateStep(encodeStep);
    } else {
       // Ensure all encode steps are hidden if switching to decode mode
       [step1Ref, step2Ref, step3Ref].forEach(ref => {
         if(ref.current) ref.current.style.display = 'none';
       });
    }
  }, [encodeStep, mode]);

  /**
   * Manejador cuando el usuario elige un archivo.
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Guardamos el File en el estado
    setSelectedFile(file);
    // Create object URL for preview (only needed for encode mode, but harmless here for now)
    const fileUrl = URL.createObjectURL(file);
    setSelectedFileUrl(fileUrl);

    // Reset de errores y resultados previos
    setError(null);
    setResult(null);
    setMessage('');
    setIsLoading(true);

    try {
      if (mode === 'encode') {
        const capacityInChars = await getImageCapacity(file);
        setCapacity(capacityInChars);
        setEncodeStep(2);
      } else {
        // Decode Mode: Attempt to decode the message directly
        const decodedMessage = await decodeMessage(file);
        if (!decodedMessage) {
           setMessage('');
        } else {
          setMessage(decodedMessage);
        }
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
       if (errorMessage.includes('invalid length')) {
         setError(translations.errors.invalidLength); // More specific error?
       } else {
         setError(translations.errors.processingError);
       }
      // Si hay error, limpiamos el archivo y volvemos al paso 1
      setSelectedFile(null);
      setSelectedFileUrl(null); // Clean URL too
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setEncodeStep(1); // Go back to step 1 on error
    } finally {
      setIsLoading(false);
    }
  };

  /**
  * Handle proceeding to step 3 from step 2
  */
  const handleProceedToStep3 = () => {
    if (!message.trim()) {
      setError(translations.errors.noMessage);
      return;
    }
    setError(null); // Clear error if message is now provided
    setEncodeStep(3);
  }

  /**
   * Manejador para codificar el mensaje una vez escrito.
   */
  const handleEncode = async () => {
    // Validations are mostly done implicitly by reaching this step, but double-check
    if (!selectedFile || capacity === null || !message.trim()) {
      setError('Error inesperado. Intenta recargar la imagen.');
      setEncodeStep(1); // Reset to step 1 if something is wrong
      return;
    }

    if (message.length > capacity) {
      setError(
        `La imagen solo puede almacenar ${capacity} caracteres. Tu mensaje tiene ${message.length}.`
      );
       setEncodeStep(2); // Go back to step 2 to fix message
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const encodedImage = await encodeMessage(selectedFile, message);
      setResult(encodedImage);
      // Don't reset message here, keep it for potential reuse? Or clear? Let's clear for now.
      // setMessage('');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('too large')) {
        setError(translations.errors.messageTooLarge);
      } else if (errorMessage.includes('invalid length')) {
        setError(translations.errors.invalidLength);
      } else {
        setError(translations.errors.processingError);
      }
       // If encoding fails, maybe go back to step 2 or 3? Let's stay on 3 but show error.
       setResult(null); // Ensure no stale result is shown
    } finally {
      setIsLoading(false);
      // Don't reset everything automatically, wait for user action or mode change
      // if (fileInputRef.current) {
      //   fileInputRef.current.value = '';
      // }
      // setSelectedFile(null);
      // setCapacity(null);
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
    setSelectedFileUrl(null);
    setEncodeStep(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Clean up object URL if it exists
    if (selectedFileUrl) {
       URL.revokeObjectURL(selectedFileUrl);
    }
  };

  useEffect(() => {
     return () => {
       if (selectedFileUrl) {
         URL.revokeObjectURL(selectedFileUrl);
       }
     };
   }, [selectedFileUrl]);

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

        <div className="max-w-xl mx-auto bg-gray-800 rounded-lg p-4 md:p-8 shadow-xl mb-8 md:mb-12 relative overflow-hidden">
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

          {/* Encode Steps Container */}
          {mode === 'encode' && (
            <div className="encode-steps-container">

              {/* Step 1: Upload Image */}
              <div ref={step1Ref} style={{ display: encodeStep === 1 ? 'block' : 'none' }}>
                <h3 className="text-lg font-semibold mb-4 text-center text-purple-300">Paso 1: Selecciona tu imagen</h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <FileImage size={18} />
                  {isLoading ? 'Analizando...' : translations.encode.selectImageButton}
                </button>
                <input
                  type="file"
                  accept="image/png"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-400 mt-3 text-center">{translations.encode.imageRequirement}</p>
              </div>

              {/* Step 2: Enter Message */}
              <div ref={step2Ref} style={{ display: encodeStep === 2 ? 'block' : 'none' }}>
                 <h3 className="text-lg font-semibold mb-4 text-center text-purple-300">Paso 2: Escribe tu mensaje secreto</h3>
                 <div className="mb-4">
                    <textarea
                        value={message}
                        onChange={handleMessageChange}
                        placeholder={translations.encode.placeholder}
                        disabled={isLoading}
                        className="w-full h-24 md:h-32 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {/* Contador de caracteres */}
                    {capacity !== null && (
                        <div className="text-gray-400 text-right text-xs mt-1">
                        {`${message.length}/${capacity} caracteres`}
                        </div>
                    )}
                 </div>
                 <button
                    onClick={handleProceedToStep3}
                    className="w-full py-2 md:py-3 px-3 md:px-4 rounded-lg flex items-center justify-center gap-2 transition-colors bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !message.trim()}
                 >
                   <span>Siguiente</span>
                   <ArrowRight size={18} />
                 </button>
              </div>

              {/* Step 3: Preview & Encode/Download */}
               <div ref={step3Ref} style={{ display: encodeStep === 3 ? 'block' : 'none' }}>
                 <h3 className="text-lg font-semibold mb-4 text-center text-purple-300">Paso 3: Previsualiza y Codifica</h3>

                 {/* Image Preview */}
                 {selectedFileUrl && (
                    <div className='mb-4 flex justify-center'>
                      <img
                        src={selectedFileUrl}
                        alt="Selected Preview"
                        className="max-w-full h-auto max-h-48 rounded-md border border-gray-600"
                      />
                    </div>
                 )}

                 {/* Encode Button */}
                 {!result && (
                    <button
                        onClick={handleEncode}
                        disabled={isLoading}
                        className="w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Lock size={18} />
                      {isLoading ? 'Codificando...' : translations.encode.encodeButton}
                    </button>
                 )}

                 {/* Result / Download Button */}
                 {result && !isLoading && (
                    <div className="mt-6 text-center">
                      <p className="text-green-400 mb-3">¡Mensaje codificado con éxito!</p>
                      <a
                        href={result}
                        download={`${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'encoded'}_stegano.png`}
                        className="inline-flex items-center justify-center gap-2 py-2 md:py-3 px-4 md:px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                      >
                        <Download size={18} />
                        {translations.encode.downloadButton}
                      </a>
                    </div>
                 )}
               </div>
            </div>
          )}

          {/* --- DECODE MODE UI --- */}
          {mode === 'decode' && (
            <div>
              {/* Mostrar el mensaje decodificado (solo decode) */}
              <div className="mb-6">
                 <h3 className="text-lg font-semibold mb-4 text-center text-purple-300">Decodificar Mensaje</h3>
                 {/* Only show textarea if a message has been decoded */}
                 {message && !isLoading && !error && (
                    <textarea
                        value={message}
                        placeholder={translations.decode.placeholder}
                        readOnly
                        className="w-full h-24 md:h-32 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base mb-4"
                    />
                 )}
                 {/* Show placeholder/instruction if no message yet */}
                  {!selectedFile && !isLoading && (
                     <p className="text-center text-gray-400 mb-4">{translations.decode.instruction}</p>
                  )}
              </div>

              {/* Botón para subir imagen (Decode) */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <FileImage size={18} />
                  {isLoading
                    ? 'Decodificando...'
                    : selectedFile
                    ? translations.decode.selectAnotherImageButton
                    : translations.decode.selectImageButton}
                </button>
                <input
                  type="file"
                  accept="image/png"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                 {/* Show decoded message placeholder/result area */}
                  {isLoading && <p className="text-center text-gray-400 mt-2">Procesando imagen...</p>}
                  {!isLoading && mode === 'decode' && selectedFile && !message && !error && (
                    <p className="text-center text-yellow-400 mt-2">{translations.errors.noHiddenMessage}</p>
                  )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-300 text-center text-sm">
              {error}
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
