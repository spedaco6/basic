import ReactDOM from 'react-dom/client';
import { Input } from "../src/components/inputs/input/Input";
import "../src/styles/main.css";
const App = () => (
  <div>
    <Input label="This should not be uppercase" type="checkbox" errors="Trouble" />
    <Input label="This should be uppercase" errors="Trouble" />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
