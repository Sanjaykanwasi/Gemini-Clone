// DOM
const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteButton = document.querySelector("#delete-button");
const suggestions = document.querySelectorAll(".suggestion-list .suggestions");

// Variables
let userMess = null;
let isResponseGenerating = false;

// Google Free API
const API_KEY = "AIzaSyATwfRDFKnK79f-JVm_9Qkb_4LJ_heREyI";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

//To save data in local storage
const loadLocalStorageData = () => {
  const savedChats = localStorage.getItem("savedChats");
  const isLightMode = localStorage.getItem("themeColor") === "light_mode";

  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "light_mode" : "dark_mode";

  chatList.innerHTML = savedChats || ""; //Restore saved chats
  document.body.classList.toggle("hide-header", savedChats);
  chatList.scrollTo(0, chatList.scrollHeight); //Scrolls to bottom
};

loadLocalStorageData();

// Function to create Message
const createMessageElement = (content, ...className) => {
  const div = document.createElement("div");

  div.classList.add("mess", ...className);
  div.innerHTML = content;
  return div;
};

// Function for Typing Effect of AI
const showTypingEffect = (text, textElement) => {
  const words = text.split(" ");

  let currentWorldIndex = 0;
  const typingInterval = setInterval(() => {
    // Appned each word to the text element with a space
    textElement.innerText +=
      (currentWorldIndex === 0 ? "" : " ") + words[currentWorldIndex++];

    // If all words are displayed
    if (currentWorldIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      localStorage.setItem("savedChats", chatList.innerHTML); //Save chats to local storage
    }
    chatList.scrollTo(0, chatList.scrollHeight); //Scrolls to bottom
  }, 75);
};

// Function to generate API Responeses
const generateAPIResponses = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");

  //Send a POST request to the API with message
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userMess }],
          },
        ],
      }),
    });

    const data = await response.json();

    // Get api response text and remove asterisks from it.
    const apiResponse = data?.candidates[0].content.parts[0].text.replace(
      /\*\*(.*?)\*\*/g,
      "$1"
    );
    showTypingEffect(apiResponse, textElement);
  } catch (error) {
    isResponseGenerating = false;
    console.log(error);
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
};

// Function for Loading Animation
const showLoadingAnimation = () => {
  const html = `<div class="message-content">
          <img src="images/gemini.svg" alt="Img" class="user-avatar" />
          <p class="text"> </p>
          <div class="loading-indicator">
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
          </div>
        </div>
        <span onclick="copyMessage(this)" class="icons material-symbols-rounded">content_copy</span>
      </div>`;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatList.appendChild(incomingMessageDiv);

  chatList.scrollTo(0, chatList.scrollHeight); //Scrolls to bottom
  generateAPIResponses(incomingMessageDiv);
};

// Function to copy the message of ai
const copyMessage = (copyIcon) => {
  const messageText = copyIcon.parentElement.querySelector(".text").innerText;

  navigator.clipboard.writeText(messageText);
  copyIcon.innerText = "done"; //Show tick icon
  setTimeout(() => (copyIcon.innerText = "content_copy"), 1000); //Revert icon after 1 second
};

// Function to handle Outgoing chat
const handleOutgoingChat = () => {
  userMess = typingForm.querySelector(".typing-input").value.trim() || userMess;

  if (!userMess || isResponseGenerating) return; //Return from function if there is no message

  isResponseGenerating = true;

  const html = `<div class="message-content">
          <img src="images/user.jpg" alt="Img" class="user-avatar" />
          <p class="text"></p></div>`;

  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMess;
  chatList.appendChild(outgoingMessageDiv);

  typingForm.reset();
  chatList.scrollTo(0, chatList.scrollHeight); //Scrolls to bottom
  document.body.classList.add("hide-header"); //To hide header when chat begins
  setTimeout(showLoadingAnimation, 500);
};

// Suggestion List
suggestions.forEach((suggestions) => {
  suggestions.addEventListener("click", () => {
    userMess = suggestions.querySelector(".txt").innerText;
    handleOutgoingChat();
  });
});

// Delete chat
deleteButton.addEventListener("click", () => {
  if (confirm("Do you want to delete the chat from Local storgae?")) {
    localStorage.removeItem("savedChats");
    loadLocalStorageData();
  }
});

// Changes the mode of dark and light
toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// Added event listner to Typing form
typingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  handleOutgoingChat();
});
