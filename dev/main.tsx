"use client"
import ReactDOM from 'react-dom/client';
import { Button, Input, useInput, Validator } from '../src';
import "../src/styles/main.css";

const App = () => {
  const password = useInput("password", "", [Validator.MIN(8)]);
  const password2 = useInput("password2*", "", [Validator.EQUALS(password.value)], [password.value]);

  return <form className="flex flex-col gap-4 p-8 w-90">
    <Input label="Password" type="password" hook={password} allowShow />
    <Input label="Confirm Password" type="email" hook={password2} />
    <Input name="one" label="Sample input" type="password" allowShow />
    <Input name="two" label="Sample text area" type="textarea" />
    <Input labelPosition="left" name="three" label="Sample select" type="select" required allowEmpty options={["this", "that", "another"]}/>
    <Input disabled name="four" label="This should not be uppercase" type="checkbox" />
    <Button disabled>Cancel</Button>
    <Button>Submit</Button>
  </form>
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
