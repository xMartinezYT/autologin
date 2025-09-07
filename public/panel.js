// panel.js

const TOOLS = [
  {
    name: "30+ Bonus Tools",
    icon: "🛠",
    url: "https://example.com/bonus",
    badge: "Can be unstable",
    siteKey: "bonus"
  },
  {
    name: "GetHookd",
    icon: "🏆",
    url: "https://example.com/gethookd",
    badge: "Newly Added",
    siteKey: "gethookd"
  },
  {
    name: "PipiAds",
    icon: "📊",
    url: "https://example.com/pipiads",
    siteKey: "pipiads"
  },
  {
    name: "Gemini",
    icon: "🔬",
    url: "https://gemini.google.com/",
    badge: "Experimental",
    siteKey: "gemini"
  },
  {
    name: "WinningHunter",
    icon: "🐾",
    url: "https://example.com/winninghunter",
    siteKey: "winninghunter"
  },
  {
    name: "ChatGPT",
    icon: "🧠",
    url: "https://chat.openai.com/",
    siteKey: "chatgpt"
  }
];

// ======= Estilos panel flotante =======
const style = document.createElement('style');
style.textContent = `
#toolsPanelSmart {
  position: fixed;
  top: 84px;
  left: 27px;
  background: linear-gradient(150deg,#182237 70%,#223661 100%);
  border-radius: 26px;
  box-shadow: 0 8px 32px rgba(10,28,42,0.28);
  padding: 22px 11px 28px 11px;
  display: flex;
  flex-direction: column;
  gap: 19px;
  z-index: 999999;
}

.tools-btn {
  font-family: 'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  background: #283042;
  padding: 13px 18px 13px 18px;
  border-radius: 14px;
  border: none;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 3px 12px rgba(0,0,0,0.08);
  transition: background .2s,transform .13s;
}
.tools-btn:hover {
  background: #3b506d;
  transform: scale(1.05);
}
.tools-badge {
  background: #f66e35;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  padding: 2px 10px;
  margin-left: 15px;
  border-radius: 11px;
}
.tools-badge[data-badge='Newly Added'] { background:#45be62;}
.tools-badge[data-badge='Experimental'] { background:#f6af2f;}
.tools-badge[data-badge='Can be unstable'] { background:#d64242;}
`;

document.head.appendChild(style);

// ======= Renderizar panel flotante =======
const panel = document.createElement('div');
panel.id = 'toolsPanelSmart';

TOOLS.forEach(tool => {
  const btn = document.createElement('button');
  btn.className = 'tools-btn';
  btn.innerHTML = `${tool.icon} <span>${tool.name}</span>`;

  // Badge especial según tool
  if (tool.badge) {
    const badge = document.createElement('span');
    badge.className = 'tools-badge';
    badge.setAttribute('data-badge', tool.badge);
    badge.textContent = tool.badge;
    btn.appendChild(badge);
  }

  btn.onclick = () => {
    const win = window.open(tool.url, "_blank");
    if (win) {
      win.postMessage({action:'autologin',siteKey:tool.siteKey},"*");
    }
  };

  panel.appendChild(btn);
});

document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(panel);
});

// ======= Facilmente editable: solo cambia el array TOOLS =======
