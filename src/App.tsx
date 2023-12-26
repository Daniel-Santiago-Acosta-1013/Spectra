import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EncryptView from './views/EncryptView/EncryptView';
import DecryptView from './views/DecryptView/DecryptView';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<EncryptView />} />
                <Route path="/decrypt" element={<DecryptView />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
