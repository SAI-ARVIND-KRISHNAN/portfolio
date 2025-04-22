gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.create({
  trigger: "#terminal-section",
  start: "top bottom", // when terminal hits bottom of screen
  once: true,
  onEnter: async () => {
    await neofetch(); // from terminal.js
    createLine();     // from terminal.js
  }
});
