"use client"
import ReactDOM from 'react-dom/client';
import { Input } from "../src/components/inputs/input/Input";
import { useInput } from '../src';
import { Button } from '../src/components/inputs/button/Button';
import "../src/styles/main.css";
import { useState } from 'react';
import { Form } from '../src/components/form/Form';

const App = () => {
  const hook = useInput("text*", "");
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 2000));
    setLoading(false);
  }

  return <Form url=""inputs={{
    one: useInput("one*", "")
  }} className="flex flex-col gap-4 p-8 w-90" loading={loading}>
    <Form.Input name="one" label="Sample input" />
    <Form.Input label="Sample text area" type="textarea" />
    <Form.Input hook={hook} label="Sample text area" type="select" required allowEmpty options={["this", "that", "another"]}/>
    <Form.Input label="This should not be uppercase" type="checkbox" />
    <Form.Button action="" onClick={onClick}>Cancel</Form.Button>
    <Form.Button action="submit" onClick={onClick}>Submit</Form.Button>
  </Form>
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
