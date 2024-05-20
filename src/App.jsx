import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import React from 'react';

if (process.env.NODE_ENV !== 'production') {
  React.StrictMode = ({ children }) => <>{children}</>;
}
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react"

let API_KEY;

if (import.meta.env.MODE === 'production') {
  API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
} else {
  import('/env.js').then((module) => {
    API_KEY = module.default.OPENAI_API_KEY;
  });
}

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am a client which specialises in your passion, let's build something great together!",
      sender: "ChatGPT"
    }

  ]

  )

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages, newMessage]; // all the old messages plus the new message
      //update our messages state
    setMessages(newMessages);

      // set a typing indicator (chatgpt is typing)
      setTyping(true);
      //process message to chatGPT (send it over and see the response.)
      await processMessagetoChatGPT(newMessages);
  }

async function processMessagetoChatGPT(chatMessages) {

  let apiMessages = chatMessages.map((messageObject) => {

    let role = "";
    if(messageObject.sender === "ChatGPT") {
      role="assistant"
    } else {
      role="user"
    }
    return { role: role, content: messageObject.message};
  });

  //role: "user" -> a message from the user, "assistant" -> a response from ChatGPT
  //"system" -> generally one initial message defining how we want CHAT gpt to talk

  const systemMessage = {
    role: "system",
    content: "You are Jon. Jon acts as a client providing information to a consultant based on a statement of work. Jon starts by asking the consultant about their area of business or passion and configures himself based on that answer, becoming a subject matter expert in that field. Jon then immediately creates a fictional company based on the consultant's passion, inventing challenges and issues that can be solved using the Power Platform toolset, especially focusing on Dataverse, but without explicitly mentioning the technologies. Jon provides insights to help the consultant make a plan to solve these problems. Jon is very casual, humorous, and sometimes sarcastic, but passionate about his family-owned business, which has been running for 15 years. Jon is overworked and handles most business processes himself, which should be evident when speaking to the consultant. Building rapport is crucial, and Jon becomes warmer and more engaged when the consultant uncovers crucial information through specific questions. Jon does not volunteer information without being asked specific questions and gives minimal information in initial greetings, waiting for the consultant's questions. Jon reminds the consultant to focus on understanding the project's purpose first if asked for test data early. Jon provides minimal information in initial greetings and waits for the consultant's questions to offer more detailed responses. Jon does not make assumptions and will ask for specifics when missing information or needing clarification. Periodically, Jon will ask for feedback using the URL: https://forms.office.com/e/hgX0m05r9e. Jon has access to the Design thinking process guide and the PL-200T00 course materials and should lead the consultant toward some of these best practices without quoting directly from them. If the consultant asks about the heritage of the company, Jon should give a really warm answer and show his passion for the business, as this is gold star rapport building. Jon never asks the consultant about the challenges in the business. Jon, as the client, has the challenges."

  }

  const apiRequestBody = {
    "model": "gpt-4o-2024-05-13",
    "messages": [
      systemMessage,
      ...apiMessages // [message1,message2,message3]
    ]

  }
  await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(apiRequestBody)
   
  }).then((data) => {
    return data.json();
  }).then((data) => {
    console.log(data);
    console.log(data.choices[0].message.content);
    setMessages (
      [
        ...chatMessages,
        {
          message: data.choices[0].message.content,
          sender: "ChatGPT",
          direction: "incoming"
        }
      ]

    );
    setTyping(false);
  })
}

return (
  <>
    <div classname="App">
      <div style = {{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            
            <MessageList
            scrollBehavior='smooth'
            typingIndicator ={typing ? <TypingIndicator content="ChatGPT is typing"/> : null}
            >
              {messages.map((message, i) => {
                     return <Message key={i} model={message} />
                })}
            </MessageList>
            <MessageInput placeholder='Type message here' onSend={handleSend}/>
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
    <p className="read-the-docs">
      Click on the Vite and React logos to learn more
    </p>
  </>
)
}

export default App
