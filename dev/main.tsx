"use client"
import ReactDOM from 'react-dom/client';
import { Input } from "../src/components/inputs/input/Input";
import "../src/styles/main.css";
import { useInput } from '../src';
const App = () => {
  const hook = useInput("text*", "");

  return <div className="flex flex-col gap-4 p-8 w-90">
    <Input label="This should not be uppercase" type="checkbox" />
    <Input label="Sample input" />
    <Input hook={hook} label="Sample text area" type="textarea" />
  </div>
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
