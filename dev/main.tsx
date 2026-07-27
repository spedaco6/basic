import React from 'react';
import ReactDOM from 'react-dom/client';
import Input from "../src/components/inputs/input/Input";
const App = () => (
  <div>
    <Input label="Hello" />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
