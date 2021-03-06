// imports
import { useEffect, useState } from 'react';
import { getDatabase, ref, push, onValue } from 'firebase/database';
import firebase from './firebase';
import './styles/sass/App.scss';

function App() {

  // Initializing states and other variables
  const [apiGeneratedText, setApiGeneratedText] = useState("");
  const [promptValue, setPromptValue] = useState("");
  const [responseArray, setResponseArray] = useState([]);
  let tempResponseArray = [];

  // Function to render prompts and responses stored in firebase 
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

  // Call function to render prompts on page load
  useEffect(() => {
    renderPromptList();
  }, [])

  // Function to update database with prompt and response retrieved from API
  const updateDatabase = () => {
    const database = getDatabase(firebase);
    const dbRef = ref(database);
    const dataObj = {
      prompt: `${promptValue}`,
      response: `${apiGeneratedText}`
    }
    push(dbRef, dataObj);
    setPromptValue(() => {
      return "";
    })
    renderPromptList();
  }

  // Update database whenever the API generates text (as long as it is not empty)
  useEffect(() => {
    if (apiGeneratedText !== "") {
      updateDatabase();
    }
  }, [apiGeneratedText])

  // Function to call API and retrieve response based on user prompt
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
        Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`
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

  // Function to call another function that will execute the API call once submit button is clicked
  const handleSubmit = (event) => {
    event.preventDefault();
    handleApiCall();
  }

  // Function to save user input value as they type into state
  const capturePromptInput = (event) => {
    setPromptValue(() => {
      return event.target.value;
    })
  }

  return (
    <div className="App">
        <header>
          <div className="wrapper">
            <h1>Fun with AI</h1>
          </div>
        </header>
        <main>
          <div className="wrapper">
            <form className="generateTextForm">
              <label htmlFor='textfield'>Enter Prompt in Box Below</label>
              <textarea
                id='textfield'
                onChange={(event) => { capturePromptInput(event) }}
                value={promptValue}
              />
              <button onClick={handleSubmit}>Submit</button>
            </form>
            <div className="responses-container">
              {/* Conditionally render "Responses" title if there is at least once response */}
              {
                responseArray.length > 1 ? <h2>Responses</h2> : null
              }
              <ul>
              {/* Loop through responseArray which is an array of data objects stored in firebase and display data in list format accordingly */}
                {
                  responseArray.slice(0).reverse().map((item, index) => {
                    return (
                      <li key={index}>
                        <div className="response-container">
                          <div className="prompt-row">
                            <p className="prompt-title">Prompt:</p>
                            <p className="prompt-text">{item.prompt}</p>
                          </div>
                          <div className="response-row">
                            <p className="response-title">Response:</p>
                            <p className="response-text">{item.response}</p>
                          </div>
                        </div>
                      </li>
                    )
                  })
                }
              </ul>
            </div>
          </div>
        </main>
      <footer>
        <p>Designed and Built by <a href="https://www.mwazir.com" target="_blank" rel="noreferrer">Muhammad Wazir</a></p>          
      </footer>
    </div>
  );
}

export default App;