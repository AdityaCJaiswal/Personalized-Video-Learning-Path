import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfileForm from './pages/ProfileForm';
import Layout from './components/layout';
import Roadmap from './components/Roadmap';

function App() {
  return (
    <Router>
      <Layout roadmap={<Roadmap />}>
        <Routes>
          <Route path="/" element={<ProfileForm />} />
          {/* You can add more pages later */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
