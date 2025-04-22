const terminal = document.getElementById("terminal");

let currentLine = null;
let lineSpan = null;
let cursorSpan = null;
let booted = false;

const fileSystem = {
  "/": {
    type: "dir",
    children: {
      projects: {
        type: "dir",
        children: {
          "zen-productivity.txt": "A React Native productivity app that blocks distractions and tracks usage. ML-enhanced insights.",
          "twitter-stance-detector.txt": "Twitter clone with stance classification. Fullstack MERN app using ML and Redis.",
          "smartinternz-chatapp.txt": "Realtime chat application made during internship. Built with Node.js and MongoDB.",
          "vit-iot-assistant.txt": "Research assistant project: IoT data parser and dashboard integration with NLP capabilities.",
          "ecommerce-platform.txt": "A dynamic e-commerce website with secure checkout and admin dashboard.",
        }
      },
      experience: {
        type: "dir",
        children: {
          "techhub.txt": "Part-time role at TechHub: Troubleshooting software and building internal automation tools.",
          "smartinternz.txt": "Intern at SmartInternz, worked on backend APIs and real-time chat systems.",
          "vit-research.txt": "Research Assistant at VIT. Worked on data analytics and IoT infrastructure for academic publication."
        }
      },
      filmclub: {
        type: "dir",
        children: {
          "screenplay.txt": "Experimental short screenplays and mood-driven scenes. Role: Writer & Creative Director."
        }
      },
      "about.txt": "Sai Arvind Krishnan | Software Engineer | CRT Terminal Enthusiast\nPortfolio hosted on sai.vercel.app"
    }
  }
};

let currentPath = ["/"];



function resolvePath() {
  let ref = fileSystem["/"];
  for (let i = 1; i < currentPath.length; i++) {
    const part = currentPath[i];
    if (ref.children[part]) {
      ref = ref.children[part];
    } else {
      return null;
    }
  }
  return ref;
}

function createLine() {
  const line = document.createElement("div");
  line.className = "line";

  lineSpan = document.createElement("span");
  lineSpan.className = "full-line";
  lineSpan.textContent = `user@host:${currentPath.join("/")}$ `;

  cursorSpan = document.createElement("span");
  cursorSpan.className = "cursor";

  lineSpan.appendChild(cursorSpan);
  line.appendChild(lineSpan);
  terminal.appendChild(line);

  currentLine = line;

  scrollToBottom();
}

function scrollToBottom() {
  terminal.scrollTop = terminal.scrollHeight;
}

function printOutput(output) {
  const line = document.createElement("div");
  line.className = "line output-line";
  line.textContent = output;
  terminal.appendChild(line);
}

async function executeCommand(text) {
  const args = text.trim().split(" ");
  const command = args[0];
  const param = args[1];
  const location = resolvePath();

  if (!location) {
    printOutput("Path error.");
    return;
  }

  switch (command) {
    case "clear":
      terminal.innerHTML = "";
      break;

    case "ls":
      if (location.type !== "dir") {
        printOutput("Not a directory.");
        break;
      }
      printOutput(Object.keys(location.children).join("    "));
      break;

    case "cd":
      if (!param) {
        printOutput("Usage: cd [folder]");
        break;
      }
      if (param === "..") {
        if (currentPath.length > 1) currentPath.pop();
        break;
      }
      if (location.children[param] && location.children[param].type === "dir") {
        currentPath.push(param);
      } else {
        printOutput("No such directory.");
      }
      break;

    case "cat":
      if (!param) {
        printOutput("Usage: cat [file.txt]");
        break;
      }
      if (location.children[param] && typeof location.children[param] === "string") {
        printOutput(location.children[param]);
      } else {
        printOutput("File not found.");
      }
      break;

    case "help":
      printOutput("Available commands: ls, cd, cat, clear, help, neofetch");
      break;

    case "neofetch":
      await neofetch();
      break;

    case "":
      break;

    default:
      printOutput(`command not found: ${command}`);
  }
}

function leaveCursorTrail() {
  if (!cursorSpan) return;
  const trail = document.createElement("div");
  trail.className = "trail";
  const rect = cursorSpan.getBoundingClientRect();
  trail.style.left = `${rect.left + window.scrollX}px`;
  trail.style.top = `${rect.top + window.scrollY}px`;
  document.body.appendChild(trail);
  setTimeout(() => trail.remove(), 1600);
}

function neofetch() {
  return new Promise((resolve) => {
    const bootLines = [
      "         *         *                         Sai Arvind Krishnan",
      "             *                               Web Terminal Portfolio",
      "    *             γ                          -----------------------",
      "                   *                         Host:    sai.vercel.app",
      "          *         *                        OS:      CRT-Linux",
      "*                                            Kernel:  bitcount-glow",
      "                                             Uptime:  always online",
      "A beacon drifting in the void                Shell:   /welcome.sh",
      ""
    ];

    const terminalWrapper = document.querySelector(".terminal-wrapper");
    const bootOverlay = document.getElementById("crt-boot");
    terminalWrapper.classList.add("boot-disabled");

    let i = 0;

    function printBootLine() {
      if (i < bootLines.length) {
        const line = document.createElement("div");
        line.className = "line";
        const span = document.createElement("span");
        span.className = "full-line glow";
        span.textContent = bootLines[i++];
        line.appendChild(span);
        terminal.appendChild(line);
        scrollToBottom();
        setTimeout(printBootLine, 350);
      } else {
        if (bootOverlay) bootOverlay.remove();
        terminalWrapper.classList.remove("boot-disabled");
        resolve();
      }
    }

    printBootLine();
  });
}

document.addEventListener("keydown", async (e) => {
  const booting = document.getElementById("crt-boot");
  if (booting) return;
  

  if (!currentLine && e.key === "Enter") {
    e.preventDefault();
    createLine();
    return;
  }

  if (!currentLine) return;

  cursorSpan.classList.remove("cursor");
  void cursorSpan.offsetWidth;
  cursorSpan.classList.add("cursor");

  if (e.key === "Backspace") {
    leaveCursorTrail();
    e.preventDefault();
    const text = lineSpan.textContent;
    if (text.length > `user@host:${currentPath.join("/")}$ `.length) {
      lineSpan.textContent = text.slice(0, -1);
      lineSpan.appendChild(cursorSpan);
    }
  } else if (e.key === "Enter") {
    e.preventDefault();
    const input = lineSpan.textContent.replace(`user@host:${currentPath.join("/")}$ `, "").trim();
    cursorSpan.remove();
    await executeCommand(input);
    createLine();
  } else if (e.key.length === 1) {
    e.preventDefault();
    leaveCursorTrail();
    lineSpan.textContent += e.key;
    lineSpan.appendChild(cursorSpan);
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  
  await neofetch();
  executeCommand("help");
  createLine();
});


