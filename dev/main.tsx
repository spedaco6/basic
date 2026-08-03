"use client"
import ReactDOM from 'react-dom/client';
import { Button, Input } from '../src';
import "../src/styles/main.css";

const App = () => {


  return <form className="flex flex-col gap-4 p-8 w-90">
    <Input name="one" label="Sample input" type="password" allowShow />
    <Input name="two" label="Sample text area" type="textarea" />
    <Input name="three" label="Sample text area" type="select" required allowEmpty options={["this", "that", "another"]}/>
    <Input name="four" label="This should not be uppercase" type="checkbox" />
    <Button>Cancel</Button>
    <Button>Submit</Button>
  </form>
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
