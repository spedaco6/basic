"use client"
import ReactDOM from 'react-dom/client';
import { useInput } from '../src';
import { useState } from 'react';
import { Form } from '../src/components/form/Form';
import "../src/styles/main.css";

const App = () => {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 2000));
    setLoading(false);
  }

  return <Form url=""inputs={{
    one: useInput("one*", ""),
    two: useInput("two", ''),
    three: useInput("three*", 'another'),
    four: useInput("four", false),
  }} className="flex flex-col gap-4 p-8 w-90" loading={loading}>
    <Form.Input name="one" label="Sample input" type="password" allowShow />
    <Form.Input name="two" label="Sample text area" type="textarea" />
    <Form.Input name="three" label="Sample text area" type="select" required allowEmpty options={["this", "that", "another"]}/>
    <Form.Input name="four" label="This should not be uppercase" type="checkbox" />
    <Form.Button action="cancel" onClick={(data) => console.log(data)}>Cancel</Form.Button>
    <Form.Button action="submit" onClick={onClick}>Submit</Form.Button>
  </Form>
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
