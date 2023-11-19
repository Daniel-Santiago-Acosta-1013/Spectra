import './EncryptButton.scss';

function EncryptButton({ onEncrypt }: { onEncrypt: () => void }) {
  return (
    <button className="EncryptButton" onClick={onEncrypt}>
      Encrypt
    </button>
  );
}

export default EncryptButton;
