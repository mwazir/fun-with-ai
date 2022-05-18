import './styles/sass/App.scss';

import { getDatabase, ref, push, onValue } from 'firebase/database';
import firebase from './firebase';
import { useEffect, useState } from 'react';
import { OpenAIApi } from 'openai';
import { render } from '@testing-library/react';

function App() {

  const apiKey = "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"
  const [apiGeneratedText, setApiGeneratedText] = useState("");
  const [promptValue, setPromptValue] = useState("");
  const [responseArray, setResponseArray] = useState([]);
  let tempResponseArray = [];

  const renderPromptList = () => {
    const database = getDatabase(firebase);
    const dbRef = ref(database);
    onValue(dbRef, (response) => {
      const dbRespObj = response.val();
      for (let item in dbRespObj) {
        tempResponseArray.push(dbRespObj[item])
        setResponseArray(() => {
          return tempResponseArray;
        })
      }
    })
  }

  useEffect(() => {
    renderPromptList();
  }, [])

  const updateResponseArray = () => {
    console.log(promptValue);
    console.log(apiGeneratedText);
    const database = getDatabase(firebase);
    const dbRef = ref(database);
    const dataObj = {
      prompt: `${promptValue}`,
      response: `${apiGeneratedText}`
    }
    const addData = push(dbRef, dataObj);
    setPromptValue(() => {
      return "";
    })
    renderPromptList();
  }

  useEffect(() => {
    if (apiGeneratedText != "") {
      updateResponseArray();
    }
  }, [apiGeneratedText])

  const handleApiCall = () => {
    const data = {
      prompt: `${promptValue}`,
      temperature: 0.5,
      max_tokens: 64,
    }
    fetch("https://api.openai.com/v1/engines/text-curie-001/completions", {
      method: "POST",
      headers: {
        'Content-Type': "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(data),
    })
    .then((response) => {
        return response.json();
    })
    .then((response) => {
      const apiResponse = response.choices[0].text
      setApiGeneratedText(() => {
        return apiResponse;
      })
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    handleApiCall();
  }

  const capturePromptInput = (event) => {
    setPromptValue(() => {
      return event.target.value;
    })
  }

  return (
    <div className="App">
      <h1>Fun with AI</h1>
      <form className="generateTextForm">
        <label htmlFor='textfield'></label>
        <input
          type='text'
          id='textfield'
          placeholder='Enter prompt'
          onChange={(event) => {capturePromptInput(event)}}
          value={promptValue}
        />
        <button onClick={handleSubmit}>Submit</button>
      </form>
      <div className="responses-container">
        <h2>Responses</h2>
        <ul>
          {
            responseArray.map((item, index) => {
              return (
                <li key={index}>
                  <div className="response-container">
                    <p>Prompt</p>
                    <p>{item.prompt}</p>
                    <p>Response</p>
                    <p>{item.response}</p>
                  </div>
                </li>
              )
            })
          }
          
        </ul>
      </div>
    </div>
  );
}

export default App;

// function App() {

//   const apiKey = "sk-ISZ2aZniJtrwIDHDvDwAT3BlbkFJLdHuHT1WZE0Mvfl6q6W"

//   const data = {
//     prompt: "Say this is a test",
//     temperature: 0.5,
//     max_tokens: 64,
//     top_p: 1.0,
//     frequency_penalty: 0.0,
//     presence_penalty: 0.0,
//   };

//   fetch("https://api.openai.com/v1/engines/text-curie-001/completions", {
//     method: "POST",
//     headers: {
//       'Content-Type': "application/json",
//       Authorization: `Bearer ${apiKey}`,
//     },
//     body: JSON.stringify(data)
//   })

//   return (
//     <div className="App">
//       <h1>Intern Challenge</h1>
//     </div>
//   );
// }

// export default App;
