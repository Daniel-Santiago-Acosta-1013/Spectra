import MediaInput from '../../components/MediaInput/MediaInput';
import SteganographyForm from '../../components/SteganographyForm/SteganographyForm';
import './SteganographyView.scss';

function SteganographyView() {
  return (
    <div className="SteganographyView">
      <h1>Spectra Steganography Suite</h1>
      <MediaInput />
      <SteganographyForm />
    </div>
  );
}

export default SteganographyView;
