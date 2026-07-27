import ReactDOM from 'react-dom/client';
import Input from "../src/components/inputs/input/Input";

const App = () => (
  <div>
    <Input label="This" disabled />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
