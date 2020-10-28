let messages = [];

function renderMessage(message) {
  return `
    <li class="message" style="background: ${message.colour || "white"}">
        <span class="message--author" data-userID="${message.userID}" id="${
    message.id
  }">${message.displayName}</span>
        <p class="message--text">${message.text}</p>
    </li>
`;
}

function renderMessages(messages) {
  const container = document.querySelector(".chat");
  const html = messages.map((message) => {
    return renderMessage(message);
  });
  container.innerHTML = html.join("");
}

window.addEventListener("DOMContentLoaded", (e) => {
  fetch("/messages")
    .then((response) => response.json())
    .then((messages) => {
      renderMessages(messages);
    });
});

socket.on("message", (data) => {
  console.log(data.text);
  const container = document.querySelector(".chat");
  const messages = document.querySelectorAll(".message");
  if (messages.length > 150) {
    container.removeChild(messages[0]);
  }

  let html = renderMessage(data);
  container.innerHTML += html;
  container.scrollTo(0, container.scrollHeight);
});
