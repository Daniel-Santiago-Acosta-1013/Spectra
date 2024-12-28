import React, { useState, useRef } from 'react';
import { Download, Lock, FileImage, MessageSquare } from 'lucide-react';
import { SteganoAnimation } from './components/SteganoAnimation/SteganoAnimation';
import { SteganoGuide } from './components/SteganoGuide/SteganoGuide';
import { encodeMessage, decodeMessage } from './utils/steganography';
import { translations } from './translations/es';

function App() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    try {
      if (mode === 'encode') {
        if (!message.trim()) {
          setError(translations.errors.noMessage);
          return;
        }
        const encodedImage = await encodeMessage(file, message);
        setResult(encodedImage);
        setMessage('');
      } else {
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
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetState = () => {
    setMessage('');
    setError(null);
    setResult(null);
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

          <div className="mb-6">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={mode === 'encode' ? translations.encode.placeholder : translations.decode.placeholder}
              className="w-full h-24 md:h-32 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
              readOnly={mode === 'decode'}
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <FileImage size={18} />
              {mode === 'encode' ? translations.encode.selectImage : translations.decode.selectImage}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {error && (
            <div className="mt-4 text-red-400 text-center text-sm md:text-base">
              {error}
            </div>
          )}

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