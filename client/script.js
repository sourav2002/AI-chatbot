import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval
const loader = (element) => {
  element.textContent = ''
  loadInterval = setInterval(() => {
      // Update the text content of the loading indicator
      element.textContent += '.';

      // If the loading indicator has reached three dots, reset it
      if (element.textContent === '....') {
          element.textContent = '';
      }
  }, 300);
}

const typeText = (element, text) => {
  let index = 0

  let interval = setInterval(() => {
      if (index < text.length) {
          element.innerHTML += text.charAt(index)
          index++
      } else {
          clearInterval(interval)
      }
  }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
const generateUniqueId = () =>{
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

const chatStripe = (isAi, value, uniqueId) => {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" style=${!isAi && "color:white"} id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}


const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt').trim())

  // to clear the textarea input 
  form.reset()

  // bot's chatstripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  // to focus scroll to the bottom 
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div 
  const messageDiv = document.getElementById(uniqueId)

  // messageDiv.innerHTML = "..."
  loader(messageDiv)
  const URL = "http://localhost:5000"
  const URL1 = "https://aieasychatbot.onrender.com"
  let response;
  try{
    response = await fetch(URL1, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })
  }catch(err){
      console.log("we get an error while fetching data from "+ URL +"====>   "+err);
      messageDiv.innerHTML = "Something went wrong"
      messageDiv.style.color = "red";
  }

  // stop loading after getting response
  clearInterval(loadInterval)

  messageDiv.innerHTML = " "

  if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 
      typeText(messageDiv, parsedData)
  } else {
      const err = await response.text()
      messageDiv.innerHTML = "Something went wrong"
      messageDiv.style.color = "red";
      alert(err)
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    const data = new FormData(form)
    if(data.get('prompt').trim().length > 0 ){
      handleSubmit(e)
    }
  }
});