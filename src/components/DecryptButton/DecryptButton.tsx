import './DecryptButton.scss';

function DecryptButton({ onDecrypt }: { onDecrypt: () => void }) {
  return (
    <button className="DecryptButton" onClick={onDecrypt}>
      Decrypt
    </button>
  );
}

export default DecryptButton;
