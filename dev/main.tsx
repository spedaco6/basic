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
    <Input label="Sample text area" type="textarea" />
    <Input hook={hook} label="Sample text area" type="select" required allowEmpty options={["this", "that", "another"]}/>
  </div>
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
