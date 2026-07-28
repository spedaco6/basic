import ReactDOM from 'react-dom/client';
import Input from "../src/components/inputs/input/Input";
import "../src/styles/main.css";
const App = () => (
  <div>
    <Input label="This"/>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
