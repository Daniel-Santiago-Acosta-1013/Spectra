import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Download, Lock, FileImage, MessageSquare, ArrowRight } from 'lucide-react';
import { encodeMessage, decodeMessage, getImageCapacity } from '../utils/steganography';
import { translations } from '../translations/es';
import * as anime from 'animejs';

// Renamed component to SteganographyPage
export const SteganographyPage: React.FC = () => {
  // All state and refs moved here
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [encodeStep, setEncodeStep] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  // All handlers and effects moved here
  useEffect(() => {
    const animateStep = (step: number) => {
      const currentStepRef = [step1Ref, step2Ref, step3Ref][step - 1];
      const otherStepRefs = [step1Ref, step2Ref, step3Ref].filter((_, i) => i !== step - 1);

      otherStepRefs.forEach(ref => {
        if (ref.current) ref.current.style.display = 'none';
      });

      if (currentStepRef.current) {
        currentStepRef.current.style.display = 'block';
        anime.waapi.animate(currentStepRef.current, {
          opacity: [0, 1],
          translateY: ['15px', '0px'],
          duration: 500,
          ease: 'out',
        });
      }
    };

    if (mode === 'encode') {
      animateStep(encodeStep);
    } else {
       [step1Ref, step2Ref, step3Ref].forEach(ref => {
         if(ref.current) ref.current.style.display = 'none';
       });
    }
  }, [encodeStep, mode]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const fileUrl = URL.createObjectURL(file);
    setSelectedFileUrl(fileUrl);

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
         setError(translations.errors.invalidLength);
       } else {
         setError(translations.errors.processingError);
       }
      setSelectedFile(null);
      setSelectedFileUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setEncodeStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToStep3 = () => {
    if (!message.trim()) {
      setError(translations.errors.noMessage);
      return;
    }
    setError(null);
    setEncodeStep(3);
  }

  const handleEncode = async () => {
    if (!selectedFile || capacity === null || !message.trim()) {
      setError('Error inesperado. Intenta recargar la imagen.');
      setEncodeStep(1);
      return;
    }

    if (message.length > capacity) {
      setError(
        `La imagen solo puede almacenar ${capacity} caracteres. Tu mensaje tiene ${message.length}.`
      );
       setEncodeStep(2);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const encodedImage = await encodeMessage(selectedFile, message);
      setResult(encodedImage);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('too large')) {
        setError(translations.errors.messageTooLarge);
      } else if (errorMessage.includes('invalid length')) {
        setError(translations.errors.invalidLength);
      } else {
        setError(translations.errors.processingError);
      }
       setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (capacity !== null && newValue.length > capacity) {
      setMessage(newValue.slice(0, capacity));
    } else {
      setMessage(newValue);
    }
  };

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

  // JSX structure moved here
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Removed Header and outer divs, only the main card and below */}
      <div className="text-center mb-8 md:mb-12">
          {/* This subtitle might be better placed outside the page component */}
          <p className="text-gray-400 text-sm md:text-base">
            {translations.subtitle}
          </p>
      </div>
      <div className="max-w-xl mx-auto bg-gray-800 rounded-lg p-4 md:p-8 shadow-xl relative overflow-hidden">
         {/* Mode Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 md:mb-8">
            <button
              onClick={() => {
                setMode('encode');
                resetState();
              }}
              className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${mode === 'encode' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              <Lock size={18} />
              <span className="text-sm md:text-base">{translations.encode.button}</span>
            </button>
            <button
              onClick={() => {
                setMode('decode');
                resetState();
              }}
              className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${mode === 'decode' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              <MessageSquare size={18} />
              <span className="text-sm md:text-base">{translations.decode.button}</span>
            </button>
          </div>

          {/* Encode Steps Container */}
          {mode === 'encode' && (
            <div className="encode-steps-container">
               {/* Step 1 */}
              <div ref={step1Ref} style={{ display: encodeStep === 1 ? 'block' : 'none' }}>
                 <h3 className="text-lg font-semibold mb-4 text-center text-purple-300">Paso 1: Selecciona tu imagen</h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}>
                    <FileImage size={18} />
                    {isLoading ? 'Analizando...' : translations.encode.selectImageButton}
                  </button>
                  <input type="file" accept="image/png" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  <p className="text-xs text-gray-400 mt-3 text-center">{translations.encode.imageRequirement}</p>
              </div>
               {/* Step 2 */}
              <div ref={step2Ref} style={{ display: encodeStep === 2 ? 'block' : 'none' }}>
                 <h3 className="text-lg font-semibold mb-4 text-center text-purple-300">Paso 2: Escribe tu mensaje secreto</h3>
                  <div className="mb-4">
                     <textarea
                        value={message}
                        onChange={handleMessageChange}
                        placeholder={translations.encode.placeholder}
                        disabled={isLoading}
                        className="w-full h-24 md:h-32 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"/>
                    {capacity !== null && (
                        <div className="text-gray-400 text-right text-xs mt-1">
                        {`${message.length}/${capacity} caracteres`}
                        </div>
                    )}
                 </div>
                 <button
                    onClick={handleProceedToStep3}
                    className="w-full py-2 md:py-3 px-3 md:px-4 rounded-lg flex items-center justify-center gap-2 transition-colors bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !message.trim()}>
                   <span>Siguiente</span>
                   <ArrowRight size={18} />
                 </button>
              </div>
               {/* Step 3 */}
               <div ref={step3Ref} style={{ display: encodeStep === 3 ? 'block' : 'none' }}>
                 <h3 className="text-lg font-semibold mb-4 text-center text-purple-300">Paso 3: Previsualiza y Codifica</h3>
                 {selectedFileUrl && (
                    <div className='mb-4 flex justify-center'>
                      <img src={selectedFileUrl} alt="Selected Preview" className="max-w-full h-auto max-h-48 rounded-md border border-gray-600"/>
                    </div>
                 )}
                 {!result && (
                    <button onClick={handleEncode} disabled={isLoading} className="w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed">
                      <Lock size={18} />
                      {isLoading ? 'Codificando...' : translations.encode.encodeButton}
                    </button>
                 )}
                 {result && !isLoading && (
                    <div className="mt-6 text-center">
                      <p className="text-green-400 mb-3">¡Mensaje codificado con éxito!</p>
                      <a href={result} download={`${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'encoded'}_stegano.png`} className="inline-flex items-center justify-center gap-2 py-2 md:py-3 px-4 md:px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base">
                        <Download size={18} />
                        {translations.encode.downloadButton}
                      </a>
                    </div>
                 )}
               </div>
            </div>
          )}

          {/* Decode Mode UI */}
          {mode === 'decode' && (
            <div>
              <div className="mb-6">
                 <h3 className="text-lg font-semibold mb-4 text-center text-purple-300">Decodificar Mensaje</h3>
                 {message && !isLoading && !error && (
                    <textarea value={message} placeholder={translations.decode.placeholder} readOnly className="w-full h-24 md:h-32 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base mb-4"/>
                 )}
                  {!selectedFile && !isLoading && (
                     <p className="text-center text-gray-400 mb-4">{translations.decode.instruction}</p>
                  )}
              </div>
              <div className="flex flex-col items-center gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
                  <FileImage size={18} />
                  {isLoading ? 'Decodificando...' : selectedFile ? translations.decode.selectAnotherImageButton : translations.decode.selectImageButton}
                </button>
                <input type="file" accept="image/png" ref={fileInputRef} onChange={handleImageUpload} className="hidden"/>
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
    </div>
  );
}; 