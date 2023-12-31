import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EncryptView from './views/EncryptView/EncryptView';
import DecryptView from './views/DecryptView/DecryptView';
import Navbar from './components/Navbar/Navbar';
import './styles/App.scss';

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<EncryptView />} />
                <Route path="/decrypt" element={<DecryptView />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
