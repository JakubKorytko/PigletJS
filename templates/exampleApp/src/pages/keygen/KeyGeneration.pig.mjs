import animations from "/modules/animations.pig";

const hashButton = $element("button");
const hashResult = $element("textarea", HTMLInputElement.prototype);
const textInput = $element("input", HTMLInputElement.prototype);
const clipboardIcon = $element(".fa-clipboard");

$element("form").on("submit", (event) => {
  event.preventDefault();
});

$B.firstRender = $$(true);

if ($B.firstRender) {
  const { frames, options } = animations.fadeIn;
  $B.animation = $$(clipboardIcon.animate(frames, options), true);
  $B.firstRender = false;
}

const toggleClipboardClass = () => {
  clipboardIcon.classList.toggle("fa-clipboard");
  clipboardIcon.classList.toggle("fa-check");
};

const toggleClipboardIcon = async () => {
  if ($B.animation.currentTime) {
    $B.animation.pause();
    $B.animation.currentTime = 0;
  }
  $B.animation.reverse();
  await $B.animation.finished;
  toggleClipboardClass();
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
  $B.animation.play();
  await $B.animation.finished;
  toggleClipboardClass();
  $B.animation.playbackRate = 1;
};

if (!navigator.clipboard) {
  clipboardIcon.remove();
} else {
  clipboardIcon.on("click", () => {
    navigator.clipboard
      .writeText(hashResult.value.trim())
      .then(toggleClipboardIcon);
  });
}

const options = (text) => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ text }),
});

const onClick = async () => {
  hashResult.innerText = await $api(
    "/crypto",
    options(textInput.value),
    "text",
  );
};

textInput.on("keypress", (event) => {
  if (event.key === "Enter" || event.keyCode === 13) {
    event.preventDefault();
    onClick();
  }
});

hashButton.on("click", onClick);
