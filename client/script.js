import bot from '../client/assets/bot.svg'
import user from '../client/assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector("#chat_container")

let loadInterval 

function loader (element) {
  element.textContent = " "

  loadInterval = setInterval(() => {
    element.textContent += "."
    //..do this after 300 milli sec 
    if (element.textContent === '...'){
      element.textContent = " "
    }
  
  }, 300)
}

//..handle how the text is typed on the screen when answer is loading
function typeText(element, text){
  let index = 0

  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

//...Generate unique Id for function to map on them 
function generateUniqueId(){
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexaDecimalString = randomNumber.toString(16)

  return `id-${timestamp}-${hexaDecimalString}`
}

//...implementing chat to show AI and Person 
function chatStripe(isAi, value, uniqueId){
  return(
`    
    <div class="wrapper ${isAi && 'ai'}">
     <div class='chat'>
     <div class="profile">
       <img 
          src="${isAi ? bot : user}"
          alt="${isAi ? 'bot' : 'user'}"
       /> 
     </div> 
     <div class="message" id=${uniqueId}> ${value} </div> 
     </div>
    </div>
    
    `
  )
}

//...handle submit to get info form AI 

const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  //..users chat stripe 
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
  form.reset()

  //..bots chat stripe 
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  chatContainer.scrollTop = chatContainer.scrollHeight

  //..fetch the div
  const messageDiv = document.getElementById(uniqueId)

  loader(messageDiv)

  //..https://chatai-nrzl.onrender.com/

  //..fetch data from server -- bot's response 
  const response = await fetch('https://codex-g91f.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }, 
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval)
  messageDiv.innerHTML = ' '

  if (response.ok){
      const data = await response.json()
      const parsedData = data.bot.trim()

      typeText(messageDiv, parsedData)
  } else {
    const err = await response.text()
    messageDiv.innerHTML = "Something went wrong..."
    alert(err)
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if(e.keyCode === 13) {
    handleSubmit(e)
  }
})