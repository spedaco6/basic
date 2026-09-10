"use client"
import ReactDOM from 'react-dom/client';
import { Button, Input, useInput, usePagination, Validator } from '../src';
import "../src/styles/main.css";

const App = () => {
  const password = useInput("password", "", [Validator.MIN(8)]);
  const password2 = useInput("password2*", "", [Validator.EQUALS(password.value)], [password.value]);

  const pagination = usePagination(0);

  return <form className="flex flex-col gap-4 p-8 w-90">
    <p>{pagination.limit}</p>
    <Input options={[1, 5, 10, 20]} label="Limit" onChange={pagination.onChangeLimit} />
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
