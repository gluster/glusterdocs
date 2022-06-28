// Add ability to copy the current URL using vim like shortcuts
// There already exists navigation related shortcuts like
// F/S -- For Searching
// P/N -- For navigating to previous/next pages
// This patch just extends those features

// Expose the internal notification API of mkdocs
// This API isn't exposed publically, IDK why
// They use it internally to show notifications when user copies a code block
// I reverse engineered it for ease of use, takes a string arg `msg`
const notifyDOM = (msg) => {
  if (typeof alert$ === "undefined") {
    console.error("Clipboard notification API not available");
    return;
  }

  alert$.next(msg);
};

// Extend the keyboard shortcut features
keyboard$.subscribe((key) => {
  // We want to allow the user to be able to type our modifiders in search
  // Disallowing that would be hilarious
  if (key.mode === "search") {
    return;
  }

  const keyPressed = key.type.toLowerCase();

  // Y is added to honor vim enthusiasts (yank)
  if (keyPressed === "c" || keyPressed === "y") {
    const currLocation = window.location.href;
    if (currLocation) {
      navigator.clipboard
        .writeText(currLocation)
        .then(() => notifyDOM("Address copied to clipboard"))
        .catch((e) => console.error(e));
    }
  }
});
