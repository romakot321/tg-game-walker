var iframeElement: HTMLIFrameElement = document.getElementById("iframe") as HTMLIFrameElement;

function navigateCallback(event: MessageEvent) {
  switch(event.data[0]) {
    case "game":
      iframeElement.src = "game.html";
      break;
    case "store":
      iframeElement.src = "store.html";
      break;
    default:
      break
  }
}

window.addEventListener('message', navigateCallback, false);
iframeElement.src = "game.html";
