import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserChat from "./components/UserChat";
import AdminDashboard from "./components/AdminDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<UserChat />} />
      </Routes>
    </Router>
  );
};

export default App;
