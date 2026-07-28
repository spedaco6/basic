"use client"
import ReactDOM from 'react-dom/client';
import { Input } from "../src/components/inputs/input/Input";
import { useInput } from '../src';
import Button from '../src/components/inputs/button/Button';
import "../src/styles/main.css";

const App = () => {
  const hook = useInput("text*", "");

  return <div className="flex flex-col gap-4 p-8 w-90">
    <Input label="Sample input" />
    <Input label="Sample text area" type="textarea" />
    <Input hook={hook} label="Sample text area" type="select" required allowEmpty options={["this", "that", "another"]}/>
    <Input label="This should not be uppercase" type="checkbox" />
    <Button showLoadingSpinner>Test</Button>
  </div>
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
