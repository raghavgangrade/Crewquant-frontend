import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import WorkPolicyForm from './components/WorkPolicyForm';
import TimeEvents from './components/TImeEvent';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/work-policy" element={<WorkPolicyForm />} />
        <Route path="/time-events" element={<TimeEvents />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}
