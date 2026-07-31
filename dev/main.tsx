"use client"
import ReactDOM from 'react-dom/client';
import { Input } from "../src/components/inputs/input/Input";
import { useInput } from '../src';
import { Button } from '../src/components/inputs/button/Button';
import "../src/styles/main.css";
import { useState } from 'react';

const App = () => {
  const hook = useInput("text*", "");
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 2000));
    setLoading(false);
  }

  return <div className="flex flex-col gap-4 p-8 w-90">
    <Input label="Sample input" />
    <Input label="Sample text area" type="textarea" />
    <Input hook={hook} label="Sample text area" type="select" required allowEmpty options={["this", "that", "another"]}/>
    <Input label="This should not be uppercase" type="checkbox" />
    <Button showLoading loading={loading} onClick={onClick}>Test</Button>
  </div>
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
