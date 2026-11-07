const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

/* ---------- Mobile menu ---------- */
const btn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav nav");
btn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  btn.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => { nav.classList.remove("open"); btn.setAttribute("aria-expanded", false); })
);


/* ---------- Fill repeated visual elements (bars, pods) ---------- */
document.querySelectorAll("[data-fill]").forEach((el) => {
  const n = +el.dataset.fill;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const s = document.createElement("i");
    s.style.setProperty("--i", i);
    frag.appendChild(s);
  }
  el.prepend(frag);
});

/* ---------- Terminal: my studies + projects ---------- */
const lines = [
  ["$ ", "whoami"],
  ["", "ashwin-j · intern + team lead @ opsmonsters"],
  ["$ ", "cat ~/studying.txt"],
  ["info", "→ aws · pentesting · node.js · devops · secops"],
  ["$ ", "sudo ./server_audit.sh"],
  ["ok", "[✓] users & permissions checked"],
  ["ok", "[✓] open ports reviewed"],
  ["$ ", "nmap -sV lab.local"],
  ["warn", "22/tcp open ssh · 80/tcp open http"],
  ["$ ", "docker compose up -d"],
  ["ok", "✔ container may-be-api   started"],
  ["$ ", "systemctl status reelsmith"],
  ["ok", "● active (running) · live in production"],
  ["$ ", "systemctl status muse-studio"],
  ["ok", "● active (running) · live in production"],
  ["$ ", "echo $NEXT"],
  ["info", "keep learning."],
];

const term = document.getElementById("term");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const lineHTML = ([p, t]) => (p === "$ " ? `<span class="p">$ </span>${esc(t)}` : `<span class="${p}">${esc(t)}</span>`);

function render(done, partial) {
  let html = done.map(lineHTML).join("\n");
  if (partial) html += (html ? "\n" : "") + `<span class="p">$ </span>${esc(partial)}`;
  term.innerHTML = html + '<span class="cursor">&nbsp;</span>';
  term.scrollTop = term.scrollHeight;
}

if (reduce) {
  render(lines);
} else {
  const run = () => {
    let i = 0, j = 0;
    const done = [];
    (function tick() {
      if (i >= lines.length) { render(done); return setTimeout(run, 4000); }
      const [p, t] = lines[i];
      if (p !== "$ ") { done.push(lines[i++]); render(done); return setTimeout(tick, 160); }
      if (j <= t.length) { render(done, t.slice(0, j++)); return setTimeout(tick, 38 + Math.random() * 40); }
      done.push(lines[i++]); j = 0; render(done); setTimeout(tick, 380);
    })();
  };
  run();
}

/* ---------- Rotating "currently learning" word ---------- */
const words = ["DevOps", "SecOps", "AWS", "Pentesting", "Node.js backend", "Linux"];
const rot = document.getElementById("rotator");
if (!reduce) {
  let w = 0, c = words[0].length, deleting = true;
  (function loop() {
    const word = words[w];
    rot.textContent = word.slice(0, c);
    if (deleting) {
      if (c-- > 0) return setTimeout(loop, 45);
      deleting = false; w = (w + 1) % words.length; c = 0;
      return setTimeout(loop, 250);
    }
    if (c++ < words[w].length) return setTimeout(loop, 85);
    deleting = true; c = words[w].length;
    setTimeout(loop, 1600);
  })();
}

/* ---------- Text scramble on section titles (hacker decode) ---------- */
const glyphs = "!<>-_\\/[]{}—=+*^?#01";
function scramble(el) {
  const target = el.textContent;
  let frame = 0;
  const total = 26;
  (function step() {
    el.textContent = target
      .split("")
      .map((ch, k) => (ch === " " || frame / total > k / target.length ? ch : glyphs[(Math.random() * glyphs.length) | 0]))
      .join("");
    if (frame++ < total) requestAnimationFrame(step);
    else el.textContent = target;
  })();
}

/* ---------- Count-up stats ---------- */
function countUp(el) {
  const end = +el.dataset.count, suf = el.dataset.suffix || "";
  const t0 = performance.now();
  (function f(t) {
    const p = Math.min((t - t0) / 1200, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
    if (p < 1) requestAnimationFrame(f);
  })(t0);
}

/* ---------- Scroll reveal ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    // also reveal anything already scrolled past (nav jumps skip over sections)
    if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
    const el = e.target;
    el.classList.add("show");
    if (el.classList.contains("section-title") && !reduce) scramble(el.querySelector(".t"));
    el.querySelectorAll?.("[data-count]").forEach(countUp);
    io.unobserve(el);
  });
}, { threshold: 0, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".section-title, .card, .timeline li, .about-text, .facts, .pipeline, .contact > p, .il-intro, .il-console, .il-principles li, .il-cta, .ddos, .nc-facts").forEach((el) => {
  // stagger siblings in grids
  const idx = [...el.parentElement.children].indexOf(el);
  el.style.setProperty("--d", `${Math.min(idx, 6) * 0.08}s`);
  el.classList.add("reveal");
  io.observe(el);
});
if (reduce) document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = el.dataset.count + (el.dataset.suffix || "")));

/* ---------- Scroll progress, timeline draw, active nav ---------- */
const progress = document.querySelector(".progress");
const timeline = document.querySelector(".timeline");
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...nav.querySelectorAll("a")];
function onScroll() {
  const h = document.documentElement;
  progress.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;

  const r = timeline.getBoundingClientRect();
  const tl = Math.min(Math.max((innerHeight * 0.8 - r.top) / r.height, 0), 1);
  timeline.style.setProperty("--tl", tl);

  let cur = "";
  sections.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s.id; });
  navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Cursor glow, card tilt + shine, magnetic buttons ---------- */
if (finePointer && !reduce) {
  const glow = document.querySelector(".cursor-glow");
  addEventListener("pointermove", (e) => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; });

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      if (card.classList.contains("tilt"))
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
      else card.style.transform = "translateY(-4px)";
    });
    card.addEventListener("pointerleave", () => (card.style.transform = ""));
  });

  document.querySelectorAll(".magnetic").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });
}

/* ---------- Background: network topology with travelling packets ---------- */
(function network() {
  if (reduce) return;
  const cv = document.getElementById("net");
  const ctx = cv.getContext("2d");
  const colors = ["232,116,59", "201,198,191"];
  let W, H, nodes, packets = [], dpr;

  function init() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    const count = Math.min(70, Math.floor((innerWidth * innerHeight) / 22000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25 * dpr, vy: (Math.random() - 0.5) * 0.25 * dpr,
      r: (Math.random() * 1.6 + 1) * dpr,
    }));
  }
  const maxD = () => 150 * dpr;

  function frame() {
    ctx.clearRect(0, 0, W, H);
    const md = maxD();
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < md) {
          ctx.strokeStyle = `rgba(150,148,142,${(1 - d / md) * 0.14})`;
          ctx.lineWidth = dpr * 0.8;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          if (packets.length < 18 && Math.random() < 0.0009)
            packets.push({ a, b, t: 0, c: colors[(Math.random() * colors.length) | 0] });
        }
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = "rgba(160,158,152,0.45)";
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }
    packets = packets.filter((p) => {
      p.t += 0.012;
      if (p.t >= 1 || Math.hypot(p.a.x - p.b.x, p.a.y - p.b.y) > md) return false;
      const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.fillStyle = `rgba(${p.c},0.95)`;
      
      ctx.beginPath(); ctx.arc(x, y, 2.4 * dpr, 0, Math.PI * 2); ctx.fill();
            return true;
    });
    requestAnimationFrame(frame);
  }
  init();
  addEventListener("resize", init);
  frame();
})();

/* ---------- Role fit scanner (honest, client-side) ---------- */
(function roleFit() {
  // level weights: prod = used in a live production app, proj = built in a project, learn = studying now
  const W = { prod: 1, proj: 0.85, learn: 0.6 };
  const LABEL = { prod: "In production", proj: "Built in project", learn: "Learning" };
  // [display name, level, evidence, aliases (regex sources)]
  const SKILLS = [
    ["Linux", "prod", "Daily-driver OS (Arch Linux) · bootcamp Linux labs", ["linux", "unix", "arch linux", "ubuntu", "centos", "rhel", "debian"]],
    ["Bash / shell scripting", "proj", "server_audit.sh · daily bootcamp shell labs", ["bash", "shell scripting", "shell", "scripting"]],
    ["Git & GitHub", "prod", "All projects version-controlled on GitHub", ["git", "github", "version control", "gitlab"]],
    ["Docker", "prod", "Dockerfiles for Reelsmith, Muse Studio, May~be", ["docker", "container", "containers", "containerization", "containerisation"]],
    ["Docker Compose", "proj", "May~be multi-service setup", ["docker compose", "docker-compose", "compose"]],
    ["Kubernetes", "learn", "Studying on the DevSecOps roadmap: pods, deployments, services, ingress", ["kubernetes", "k8s", "kubectl", "pods"]],
    ["CI/CD", "prod", "Reelsmith uses GitHub Actions as its render pipeline", ["ci/cd", "ci cd", "cicd", "continuous integration", "continuous delivery", "continuous deployment", "pipelines?"]],
    ["GitHub Actions", "prod", "Reelsmith v2 render farm runs on GitHub Actions", ["github actions"]],
    ["Cloud deployment (Vercel / Render)", "prod", "Reelsmith v2 & Muse Studio live on Vercel; Render blueprints", ["vercel", "render", "paas", "deployment", "deploy"]],
    ["Supabase / BaaS", "prod", "Reelsmith & AnizOoal database + storage, row-level security", ["supabase", "firebase", "baas"]],
    ["AWS", "learn", "Studying EC2, S3, IAM, VPC, Security Groups at OpsMonsters", ["aws", "amazon web services", "ec2", "s3", "iam", "vpc", "cloudwatch", "lambda", "cloud"]],
    ["Node.js", "proj", "Project Management API, AnizOoal API, May~be backend", ["node", "node\\.js", "nodejs"]],
    ["Express", "proj", "Project Management API (Express 5)", ["express", "express\\.js", "expressjs"]],
    ["REST APIs", "prod", "36-endpoint PM API · FastAPI backend for Muse Studio", ["rest", "restful", "rest api", "apis?", "backend", "back-end", "microservices?"]],
    ["MongoDB", "proj", "Project Management API with Mongoose", ["mongodb", "mongo", "mongoose", "nosql"]],
    ["PostgreSQL / SQL", "proj", "Prisma + PostgreSQL in May~be", ["postgres", "postgresql", "sql", "mysql", "database", "databases", "prisma"]],
    ["Auth (JWT / OAuth)", "prod", "JWT auth in PM API & Muse Studio · OAuth 2.0 PKCE in May~be", ["jwt", "oauth", "authentication", "authorization", "auth"]],
    ["Python", "prod", "Muse Studio (FastAPI), Reelsmith, Tempest toolkit", ["python"]],
    ["FastAPI", "prod", "Muse Studio backend with a 64-test suite", ["fastapi"]],
    ["JavaScript / TypeScript", "proj", "Node.js APIs, React + TypeScript frontends", ["javascript", "typescript", "js", "ts"]],
    ["React", "proj", "Reelsmith v2 dashboard (React + Vite)", ["react", "reactjs"]],
    ["HTML & CSS", "proj", "This portfolio and its 8 demo pages — hand-written, no framework", ["html", "html5", "css", "css3", "sass", "scss"]],
    ["Responsive UI", "proj", "This portfolio works from phone to desktop · Muse & Reelsmith dashboards", ["responsive", "responsive design", "mobile-first", "cross-browser", "ui"]],
    ["Accessibility basics", "proj", "Reduced-motion support, semantic HTML and ARIA labels in this portfolio", ["accessibility", "a11y", "wcag"]],
    ["Flutter / mobile", "proj", "May~be cross-platform music app (Flutter + Dart)", ["flutter", "dart", "mobile", "android", "ios", "cross-platform"]],
    ["Testing", "prod", "Muse Studio pytest suite (64 tests)", ["testing", "unit tests?", "pytest", "jest", "test automation"]],
    ["DevSecOps / SAST", "learn", "DevSecOps roadmap · security gates built into Muse Studio and Reelsmith", ["devsecops", "sast", "sonarqube", "secure sdlc", "shift left", "code scanning"]],
    ["Security operations", "proj", "Daily cybersecurity audit logs · log review · file integrity checks", ["secops", "security operations", "soc", "monitoring", "incident response", "log analysis", "auditing", "audit", "hardening"]],
    ["Network security", "proj", "Tempest: port scanner, packet sniffer, SSH brute-force detector, firewall manager", ["network security", "networking", "tcp/ip", "firewall", "firewalls", "port scanning", "packet", "ids", "ips"]],
    ["Penetration testing", "learn", "Bootcamp pentest track · Tempest SQLi/XSS/SSL/header scanners on lab targets", ["penetration testing", "pentest", "pentesting", "ethical hacking", "vulnerability assessment", "vapt", "red team"]],
    ["Web app security (OWASP)", "proj", "Tempest web scanners: SQLi, XSS, SSL/TLS, security headers, subdomains", ["owasp", "web security", "application security", "appsec", "xss", "sql injection", "burp", "burp suite"]],
    ["Security tools (Nmap, Kali)", "learn", "Lab practice with Nmap, Burp Suite, Kali Linux", ["nmap", "kali", "metasploit", "wireshark"]],
    ["Cryptography basics", "proj", "Tempest: AES, RSA, hashing modules", ["cryptography", "encryption", "aes", "rsa", "hashing", "pki", "tls", "ssl"]],
    ["Machine learning", "proj", "Tenseigan deepfake detector (PyTorch) · ML phishing/malware detection", ["machine learning", "ml", "pytorch", "deep learning", "ai"]],
    ["Team leadership", "prod", "Team Lead of the intern cohort at OpsMonsters", ["lead", "leadership", "team lead", "mentoring", "mentor"]],
    ["Documentation", "prod", "Daily written study reports and audit logs", ["documentation", "technical writing", "reports?", "runbooks?"]],
    ["Communication & teamwork", "prod", "Coordinating the OpsMonsters intern team", ["communication", "teamwork", "collaboration", "team player"]],
  ];
  // Skills recruiters may ask for that I don't claim yet — reported honestly as gaps.
  const GAPS = [
    ["Terraform", ["terraform", "infrastructure as code", "iac"]], ["Ansible", ["ansible"]], ["Jenkins", ["jenkins"]],
    ["Azure", ["azure"]], ["Google Cloud", ["gcp", "google cloud"]], ["Prometheus / Grafana", ["prometheus", "grafana"]],
    ["ELK / Splunk / SIEM", ["elk", "elasticsearch", "splunk", "siem", "kibana"]], ["Helm / Argo CD", ["helm", "argo ?cd", "gitops"]],
    ["Java", ["java", "spring"]], ["Figma / UI design", ["figma", "ui/ux", "ux", "wireframes?", "prototyp\\w*"]],
    ["Next.js", ["next\\.js", "nextjs"]], ["Tailwind CSS", ["tailwind"]], ["Angular", ["angular"]], ["Vue", ["vue", "vue\\.js", "nuxt"]],
    ["Redux / state management", ["redux", "zustand", "state management"]], ["Swift / Kotlin (native mobile)", ["swift", "kotlin"]],
    ["Data analysis (Excel / Power BI / Tableau)", ["excel", "power ?bi", "tableau", "data analysis", "pandas"]],
    ["Manual / Selenium QA", ["selenium", "cypress", "playwright", "manual testing", "qa"]], ["CCNA / routing & switching", ["ccna", "routing", "switching", "cisco"]], ["Go", ["golang", "go lang"]], ["C# / .NET", ["c#", "\\.net"]], ["PHP", ["php"]],
    ["Kafka", ["kafka"]], ["Redis", ["redis"]], ["Nginx", ["nginx"]], ["Security certifications (CEH / OSCP / Security+)", ["ceh", "oscp", "security\\+", "cissp", "comptia"]],
    ["Professional experience 3+ years", ["[3-9]\\+? years", "senior"]],
  ];
  // If one of these is required and missing, it is a core gap — cap the score.
  const CORE = new Set(["Java", "Go", "C# / .NET", "PHP", "Angular", "Vue"]);
  const ROLES = {
    devops: "DevOps Engineer: Linux, Bash scripting, Git, Docker, Kubernetes, CI/CD pipelines with GitHub Actions, cloud deployment on AWS, monitoring, documentation, teamwork.",
    secops: "SecOps / DevSecOps Engineer: Linux hardening, security operations, log analysis and auditing, SAST with SonarQube, OWASP web security, network security and firewalls, Docker, CI/CD, Python scripting.",
    backend: "Node.js Backend Developer: Node.js, Express, REST APIs, MongoDB, PostgreSQL, JWT authentication, testing, Git, Docker, deployment.",
    cloud: "Cloud Engineer (AWS): AWS EC2, S3, IAM, VPC, Linux, Docker, CI/CD, scripting with Bash or Python, deployment, monitoring.",
    pentest: "Junior Penetration Tester: penetration testing, OWASP Top 10, Burp Suite, Nmap, Kali Linux, network security, cryptography basics, Python scripting, report writing.",
    linux: "Linux System Administrator: Linux, Bash shell scripting, users and permissions, networking, firewalls, auditing and hardening, log analysis, Git, documentation.",
  };

  // A bare job title lists few skills, so expand recognised titles into their usual requirements.
  const TITLES = [
    [["front[- ]?end", "ui developer", "web developer", "web designer"], "Front-End Developer", "HTML, CSS, JavaScript, TypeScript, React, responsive design, accessibility, Git, REST APIs, testing, Figma, Next.js, Tailwind"],
    [["full[- ]?stack", "mern"], "Full-Stack Developer", "HTML, CSS, JavaScript, TypeScript, React, Node.js, Express, REST APIs, MongoDB, SQL, JWT authentication, Git, Docker, deployment, testing, Next.js"],
    [["back[- ]?end", "api developer", "node\\.?js developer"], "Backend Developer", ROLES.backend],
    [["devops", "site reliability", "sre", "platform engineer", "build engineer", "release engineer"], "DevOps / SRE", ROLES.devops + " Terraform, Prometheus"],
    [["devsecops", "secops", "security engineer", "security analyst", "soc analyst", "cyber ?security", "information security", "infosec"], "Security Engineer / Analyst", ROLES.secops + " incident response, SIEM"],
    [["penetration tester", "pen ?tester", "ethical hacker", "red team", "vapt"], "Penetration Tester", ROLES.pentest],
    [["cloud engineer", "cloud architect", "aws engineer", "cloud"], "Cloud Engineer", ROLES.cloud + " Terraform"],
    [["linux admin", "system admin", "sysadmin", "systems administrator", "linux engineer"], "Linux / System Administrator", ROLES.linux],
    [["mobile developer", "flutter developer", "android developer", "ios developer", "app developer"], "Mobile Developer", "Flutter, Dart, mobile, REST APIs, OAuth authentication, Git, testing, Swift, Kotlin"],
    [["python developer", "django developer"], "Python Developer", "Python, FastAPI, REST APIs, SQL, testing, Git, Docker, Linux"],
    [["machine learning", "ml engineer", "ai engineer", "data scientist"], "ML / AI Engineer", "Python, machine learning, PyTorch, SQL, Git, Docker, pandas, data analysis"],
    [["network engineer", "network administrator"], "Network Engineer", "networking, TCP/IP, firewalls, network security, Linux, CCNA, routing, switching, documentation"],
    [["qa engineer", "test engineer", "tester", "sdet"], "QA / Test Engineer", "testing, test automation, Selenium, Python, JavaScript, Git, CI/CD, documentation"],
    [["data analyst", "business analyst"], "Data Analyst", "SQL, Excel, Power BI, Tableau, Python, data analysis, communication, documentation"],
    [["java developer", "spring developer"], "Java Developer", "Java, Spring, REST APIs, SQL, Git, Docker, testing"],
  ];
  const titleRx = (a) => new RegExp("(^|[^a-z0-9])(" + a.join("|") + ")(?![a-z0-9])", "i");
  function expandTitles(text) {
    const hits = TITLES.filter(([a]) => titleRx(a).test(text));
    return { names: hits.map((h) => h[1]), extra: hits.map((h) => h[2]).join(" ") };
  }

  const $ = (id) => document.getElementById(id);
  const jd = $("rf-jd"); if (!jd) return;
  const chips = [...document.querySelectorAll(".rf-chip")];
  const rx = (aliases) => new RegExp("(^|[^a-z0-9+#.])(" + aliases.join("|") + ")(?![a-z0-9+#])", "i");
  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  chips.forEach((c) => c.addEventListener("click", () => {
    chips.forEach((x) => x.classList.toggle("on", x === c));
    jd.value = ROLES[c.dataset.role];
    run();
  }));
  $("rf-run").addEventListener("click", run);
  jd.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey || (!e.shiftKey && !jd.value.includes("\n") && jd.value.length < 60))) { e.preventDefault(); run(); }
  });
  $("rf-clear").addEventListener("click", () => {
    jd.value = ""; chips.forEach((x) => x.classList.remove("on"));
    $("rf-idle").hidden = false; $("rf-scan").hidden = true; $("rf-result").hidden = true;
  });

  function analyse(text) {
    const t = " " + text.toLowerCase() + " ";
    const matched = SKILLS.filter(([, , , a]) => rx(a).test(t));
    const gaps = GAPS.filter(([, a]) => rx(a).test(t)).map(([n]) => n);
    const total = matched.length + gaps.length;
    let score = total ? Math.round((matched.reduce((s, m) => s + W[m[1]], 0) / total) * 100) : null;
    const core = gaps.filter((g) => CORE.has(g));
    if (core.length && score !== null) score = Math.min(score, 40);
    return { matched, gaps, score, core, total };
  }

  let timer;
  function run() {
    const text = jd.value.trim();
    clearTimeout(timer);
    if (text.length < 3) { jd.focus(); return; }
    const titles = expandTitles(text);
    const res = analyse(text + " " + titles.extra);
    $("rf-idle").hidden = true; $("rf-result").hidden = true; $("rf-scan").hidden = false;
    const log = $("rf-log"), bar = $("rf-progress");
    const steps = [
      `<span class="ac">$</span> rolefit --candidate "Ashwin J"`,
      `reading job description… <span class="hl">${text.split(/\s+/).length} words</span>`,
      titles.names.length ? `recognised job title: <span class="hl">${esc(titles.names.join(", "))}</span> → adding typical requirements` : `no job title recognised — using listed skills only`,
      `extracting required skills… <span class="hl">${res.matched.length + res.gaps.length} found</span>`,
      `scanning 8 projects · 2 live in production…`,
      `checking OpsMonsters studies: AWS · pentesting · Node.js · DevOps · SecOps…`,
      `matching evidence… <span class="ok">${res.matched.length} matched</span> · <span class="hl">${res.gaps.length} gaps</span>`,
      `<span class="ok">✓ analysis complete</span>`,
    ];
    const delay = reduce ? 0 : 380;
    log.innerHTML = ""; bar.style.width = "0";
    steps.forEach((line, i) => {
      timer = setTimeout(() => {
        log.innerHTML += line + "\n";
        bar.style.width = ((i + 1) / steps.length) * 100 + "%";
        if (i === steps.length - 1) timer = setTimeout(() => show(res), delay ? 450 : 0);
      }, i * delay);
    });
  }

  function show({ matched, gaps, score, core, total }) {
    $("rf-scan").hidden = true; $("rf-result").hidden = false;
    const ring = $("rf-ring"), num = $("rf-score");
    let verdict, summary, color = "var(--accent)";
    if (score === null) {
      verdict = "No technical skills recognised";
      summary = "Try a quick role above, or paste a job description that lists tools and skills.";
      score = 0;
    } else if (score >= 85) { verdict = "Strong fit for this role"; color = "var(--lime)";
      summary = "Most requirements are backed by real projects — several already running in production.";
    } else if (score >= 65) { verdict = "Good fit — ready to contribute";
      summary = "Core skills are covered with project evidence; the rest are being studied right now.";
    } else if (score >= 45) { verdict = "Partial fit — growing into it"; color = "var(--amber)";
      summary = "Some foundations are in place; the gaps below are honest and on the learning list.";
    } else { verdict = "Not a close fit yet"; color = "var(--red)";
      summary = "This role leans on skills outside my current stack. Happy to talk about adjacent roles.";
    }
    if (core.length) summary = `This role's core requirement (${core.join(", ")}) is not in my stack yet, so the score is capped. ` + (score >= 45 ? summary : "");
    if (total > 0 && total < 4) summary += ` Only ${total} requirement${total > 1 ? "s" : ""} detected — paste the full job description for a more reliable score.`;
    document.querySelector(".rf-status").textContent = total > 0 && total < 4 ? "Analysis complete · limited detail" : "Analysis complete";
    ring.style.setProperty("--rf-c", color);
    $("rf-verdict").textContent = verdict;
    $("rf-summary").textContent = summary;

    const order = { prod: 0, proj: 1, learn: 2 };
    $("rf-matched").innerHTML = matched.length
      ? [...matched].sort((a, b) => order[a[1]] - order[b[1]]).map(([n, l, e], i) =>
          `<li style="--i:${i}"><span class="rf-lvl ${l}">${LABEL[l]}</span><span><b>${esc(n)}</b><small>${esc(e)}</small></span></li>`).join("")
      : `<li style="--i:0"><span></span><span class="rf-muted">No direct matches.</span></li>`;
    $("rf-gaps").innerHTML = gaps.length
      ? gaps.map((g, i) => `<li style="--i:${i}">${esc(g)} — not in my portfolio yet</li>`).join("")
      : `<li style="--i:0">None found for this description.</li>`;

    const t0 = performance.now(), dur = reduce ? 0 : 1100;
    (function tick(t) {
      const p = dur ? Math.min((t - t0) / dur, 1) : 1;
      const v = Math.round(score * (1 - Math.pow(1 - p, 3)));
      ring.style.setProperty("--p", v); num.textContent = v + "%";
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
})();

/* ---------- "Send with" mail chooser for every email link ---------- */
(function mailChooser() {
  const pop = document.getElementById("mail-pop");
  if (!pop) return;
  const TO = "ashwin.j200423@gmail.com";
  let lastTrigger = null;

  // Subject/body: the role-fit button includes the scan result so the message has context.
  function draft(trigger) {
    if (trigger && trigger.dataset.mail === "rolefit") {
      const score = document.getElementById("rf-score")?.textContent || "";
      const verdict = document.getElementById("rf-verdict")?.textContent || "";
      const role = document.querySelector(".rf-chip.on")?.textContent
        || (document.getElementById("rf-jd")?.value || "").trim().split("\n")[0].slice(0, 80) || "a role";
      return {
        su: `Role opportunity: ${role}`,
        body: `Hi Ashwin,\n\nI ran the role-fit scan on your portfolio for "${role}" — ${score} (${verdict}).\n\nI'd like to talk with you about this opportunity.\n\nRegards,\n`,
      };
    }
    return { su: "Hello Ashwin", body: "Hi Ashwin,\n\n" };
  }

  function links({ su, body }) {
    const e = encodeURIComponent;
    return {
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${e(TO)}&su=${e(su)}&body=${e(body)}`,
      outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=${e(TO)}&subject=${e(su)}&body=${e(body)}`,
      yahoo: `https://compose.mail.yahoo.com/?to=${e(TO)}&subject=${e(su)}&body=${e(body)}`,
      default: `mailto:${TO}?subject=${e(su)}&body=${e(body)}`,
    };
  }

  function open(trigger) {
    lastTrigger = trigger;
    const l = links(draft(trigger));
    pop.querySelectorAll("a[data-svc]").forEach((a) => (a.href = l[a.dataset.svc]));
    const copyBtn = pop.querySelector('[data-svc="copy"]');
    copyBtn.classList.remove("copied"); copyBtn.querySelector("span").textContent = "Copy address";
    pop.hidden = false;
    const r = trigger.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
    let left = Math.min(Math.max(8, r.left), innerWidth - pw - 8);
    let top = r.bottom + 8;
    if (top + ph > innerHeight - 8) top = Math.max(8, r.top - ph - 8);
    pop.style.left = left + "px"; pop.style.top = top + "px";
    trigger.setAttribute("aria-expanded", "true");
    pop.querySelector("a,button").focus({ preventScroll: true });
  }
  function close(refocus) {
    if (pop.hidden) return;
    pop.hidden = true;
    if (lastTrigger) { lastTrigger.setAttribute("aria-expanded", "false"); if (refocus) lastTrigger.focus(); }
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest('a[href^="mailto:"]');
    if (trigger && !pop.contains(trigger)) {
      e.preventDefault();
      if (!pop.hidden && lastTrigger === trigger) return close();
      return open(trigger);
    }
    if (!pop.contains(e.target)) close();
  });
  pop.addEventListener("click", async (e) => {
    const item = e.target.closest("[data-svc]");
    if (!item) return;
    if (item.dataset.svc === "copy") {
      try { await navigator.clipboard.writeText(TO); } catch {
        const t = document.createElement("textarea"); t.value = TO; document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); } catch {} t.remove();
      }
      item.classList.add("copied"); item.querySelector("span").textContent = "Copied ✓";
      return setTimeout(() => close(), 900);
    }
    setTimeout(() => close(), 50); // let the link open first
  });
  document.addEventListener("keydown", (e) => {
    if (pop.hidden) return;
    if (e.key === "Escape") close(true);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const items = [...pop.querySelectorAll("a,button")];
      const i = items.indexOf(document.activeElement);
      items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus();
      e.preventDefault();
    }
  });
  addEventListener("scroll", () => close(), { passive: true });
  addEventListener("resize", () => close());
})();

/* ---------- Live GitHub repositories (public API, no key) ---------- */
(function github() {
  const grid = document.getElementById("gh-grid");
  if (!grid) return;
  const USER = "ashwin-j23", KEY = "gh-repos-v1", TTL = 3600e3;
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ago = (iso) => {
    const d = Math.floor((Date.now() - new Date(iso)) / 864e5);
    return d < 1 ? "today" : d === 1 ? "yesterday" : d < 30 ? `${d} days ago` : d < 365 ? `${Math.floor(d / 30)} mo ago` : `${Math.floor(d / 365)} yr ago`;
  };
  function render(repos) {
    const own = repos.filter((r) => !r.fork).slice(0, 6);
    if (!own.length) return fail();
    grid.innerHTML = own.map((r) => `
      <a class="gh-repo" href="${esc(r.html_url)}" target="_blank" rel="noopener">
        <b>${esc(r.name)}</b>
        <p>${esc(r.description || "No description yet.")}</p>
        <span class="gh-meta">${r.language ? `<span class="gh-lang">${esc(r.language)}</span>` : ""}<span>★ ${r.stargazers_count}</span><span>updated ${ago(r.pushed_at)}</span></span>
      </a>`).join("");
  }
  function fail() {
    grid.innerHTML = `<p class="gh-note">Couldn't load repositories right now — see them on <a href="https://github.com/${USER}" target="_blank" rel="noopener">github.com/${USER}</a>.</p>`;
  }
  try {
    const c = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (c && Date.now() - c.t < TTL) return render(c.d);
  } catch {}
  if (typeof fetch !== "function") return fail();
  fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=12`, { headers: { Accept: "application/vnd.github+json" } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => { try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d })); } catch {} render(d); })
    .catch(fail);
})();

/* ---------- Ideas lab tabs ---------- */
(function ideasLab() {
  const list = document.querySelector(".il-tabs");
  if (!list) return;
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const rail = () => {
    const panel = document.querySelector(".il-panel:not([hidden]) .il-rail");
    if (panel) panel.style.setProperty("--rail-w", panel.offsetWidth + "px");
  };
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: "nearest", inline: "nearest" });
    rail();
  };
  tabs.forEach((t) => t.addEventListener("click", () => select(t)));
  list.addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
    if (e.key === "Home") { e.preventDefault(); select(tabs[0], true); }
    if (e.key === "End") { e.preventDefault(); select(tabs[tabs.length - 1], true); }
  });
  addEventListener("resize", rail);
  rail();
})();

/* ---------- Binary rain (hero background, subtle) ---------- */
(function binaryRain() {
  const cv = document.getElementById("rain");
  if (!cv || reduce) return;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const SIZE = 15, TRAIL = 14;
  let W = 0, H = 0, cols = [], dpr = 1, on = true, last = 0;
  const bit = () => (Math.random() < 0.5 ? "0" : "1");
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.ceil(W / (SIZE * 1.4));
    cols = Array.from({ length: n }, () => ({
      y: Math.random() * (H / SIZE + TRAIL), v: 0.16 + Math.random() * 0.26,
      chars: Array.from({ length: TRAIL }, bit), hot: Math.random() < 0.12,
    }));
  }
  function frame(t) {
    requestAnimationFrame(frame);
    if (!on || t - last < 50) return; // ~20 fps is plenty
    last = t;
    ctx.clearRect(0, 0, W, H);
    ctx.font = `${SIZE}px "IBM Plex Mono", monospace`;
    cols.forEach((c, i) => {
      c.y += c.v;
      if ((c.y - TRAIL) * SIZE > H) { c.y = Math.random() * -12; c.v = 0.12 + Math.random() * 0.22; c.hot = Math.random() < 0.12; }
      if (Math.random() < 0.08) c.chars[(Math.random() * TRAIL) | 0] = bit();
      const x = i * SIZE * 1.4;
      for (let k = 0; k < TRAIL; k++) {
        const y = (Math.floor(c.y) - k) * SIZE;
        if (y < -SIZE || y > H) continue;
        const a = (1 - k / TRAIL) * (k === 0 ? 0.55 : 0.22);
        ctx.fillStyle = k === 0 && c.hot ? `rgba(232,116,59,${a + 0.2})` : `rgba(236,236,234,${a})`;
        ctx.fillText(c.chars[k], x, y);
      }
    });
  }
  size();
  addEventListener("resize", size);
  new IntersectionObserver(([e]) => (on = e.isIntersecting && !document.hidden)).observe(cv);
  document.addEventListener("visibilitychange", () => (on = !document.hidden));
  requestAnimationFrame(frame);
})();

/* ---------- DDoS defence simulation ---------- */
(function ddosSim() {
  const box = document.getElementById("ddos");
  const cv = document.getElementById("dd-canvas");
  if (!box || !cv) return;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const sp = document.getElementById("dd-spark"), sctx = sp.getContext("2d");
  const $ = (id) => document.getElementById(id);
  const btn = $("dd-launch"), elRps = $("dd-rps"), elBl = $("dd-blocked"), elSv = $("dd-served"), elSt = $("dd-status");
  const C = { user: "#6fae75", bot: "#d0644f", text: "#9a9893", line: "#333333", accent: "#e8743b", srv: "#ececea" };
  let W = 0, H = 0, dpr = 1, on = true, attackUntil = 0, packets = [], bursts = [];
  let blocked = 0, served = 0, secCount = 0, secBlocked = 0, rps = 0, lastSec = performance.now(), last = 0;
  const hist = Array.from({ length: 40 }, () => ({ ok: 0, bad: 0 }));
  const sources = [];

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sp.width = sp.clientWidth * dpr; sp.height = sp.clientHeight * dpr; sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sources.length = 0;
    const n = W < 600 ? 7 : 11;
    for (let i = 0; i < n; i++) sources.push({ x: 26 + (i % 2) * 22, y: 30 + (i * (H - 70)) / (n - 1), bot: i % 3 !== 0 });
  }
  const shieldX = () => W * 0.58, serverX = () => W - (W < 600 ? 54 : 90);

  function spawn(now) {
    const attacking = now < attackUntil;
    const userRate = 0.5, botRate = attacking ? 9 : 0.35; // per frame-ish
    const add = (bot) => {
      const pool = sources.filter((s) => s.bot === bot);
      const s = pool[(Math.random() * pool.length) | 0];
      packets.push({ x: s.x, y: s.y, ty: H / 2 + (Math.random() - 0.5) * 60, bot, v: (bot ? 3.2 : 2.4) + Math.random() * 1.6, sy: s.y });
      secCount++;
    };
    if (Math.random() < userRate) add(false);
    for (let r = botRate; r > 0; r--) if (Math.random() < Math.min(r, 1)) add(true);
  }

  function drawScene(now) {
    const attacking = now < attackUntil, sx = shieldX(), vx = serverX();
    ctx.clearRect(0, 0, W, H);
    // sources
    sources.forEach((s) => {
      ctx.fillStyle = s.bot ? (attacking ? C.bot : "#5a2f27") : C.user;
      ctx.globalAlpha = s.bot && !attacking ? 0.7 : 1;
      ctx.fillRect(s.x - 5, s.y - 5, 10, 10);
      ctx.globalAlpha = 1;
    });
    ctx.fillStyle = C.text; ctx.font = '11px "IBM Plex Mono", monospace';
    ctx.fillText("internet", 14, 16);
    // shield
    const pulse = attacking ? 0.5 + 0.5 * Math.sin(now / 90) : 0.3;
    ctx.strokeStyle = attacking ? `rgba(232,116,59,${0.5 + pulse * 0.5})` : C.line;
    ctx.lineWidth = attacking ? 3 : 2;
    ctx.beginPath(); ctx.moveTo(sx, 24); ctx.lineTo(sx, H - 34); ctx.stroke();
    ctx.fillStyle = attacking ? C.accent : C.text;
    ctx.fillText("rate limit + WAF", sx - 52, 16);
    // server
    const sh = 74, sy = H / 2 - sh / 2;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.strokeRect(vx, sy, 44, sh);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = "#222"; ctx.fillRect(vx + 6, sy + 10 + i * 20, 32, 10); ctx.fillStyle = C.user; ctx.fillRect(vx + 32, sy + 13 + i * 20, 3, 3); }
    ctx.fillStyle = C.text; ctx.fillText("api", vx + 11, sy - 8);
    // packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.x += p.v;
      const t = Math.min(1, p.x / sx);
      p.y = p.sy + (p.ty - p.sy) * t;
      if (p.bot && p.x >= sx - 2) {
        blocked++; secBlocked++;
        bursts.push({ x: sx - 4, y: p.y, r: 2, a: 1 });
        packets.splice(i, 1); continue;
      }
      if (!p.bot && p.x >= vx) { served++; packets.splice(i, 1); continue; }
      ctx.fillStyle = p.bot ? C.bot : C.user;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.bot ? 2.4 : 3, 0, 6.283); ctx.fill();
    }
    // blocked bursts
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i]; b.r += 0.9; b.a -= 0.06;
      if (b.a <= 0) { bursts.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(208,100,79,${b.a})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.stroke();
    }
    if (packets.length > 900) packets.splice(0, packets.length - 900);
  }

  function drawSpark() {
    const w = sp.clientWidth, h = sp.clientHeight, bw = w / hist.length;
    const max = Math.max(10, ...hist.map((x) => x.ok + x.bad));
    sctx.clearRect(0, 0, w, h);
    hist.forEach((x, i) => {
      const hb = (x.bad / max) * h, ho = (x.ok / max) * h;
      sctx.fillStyle = C.bot; sctx.fillRect(i * bw + 1, h - hb - ho, bw - 2, hb);
      sctx.fillStyle = C.user; sctx.fillRect(i * bw + 1, h - ho, bw - 2, ho);
    });
  }

  function tick(now) {
    requestAnimationFrame(tick);
    if (!on || now - last < 16) return;
    last = now;
    spawn(now);
    drawScene(now);
    if (now - lastSec >= 1000) {
      rps = Math.round(secCount * (1000 / (now - lastSec)) * 0.6 + rps * 0.4);
      hist.shift(); hist.push({ ok: secCount - secBlocked, bad: secBlocked });
      secCount = 0; secBlocked = 0; lastSec = now;
      const attacking = now < attackUntil;
      elRps.textContent = rps.toLocaleString();
      elBl.textContent = blocked.toLocaleString();
      elSv.textContent = served.toLocaleString();
      document.getElementById("dd-st-label").textContent = attacking ? "status · mitigating" : "status · normal";
      elSt.className = attacking ? "a" : "g";
      elRps.className = attacking ? "r" : "";
      if (!attacking && box.classList.contains("attack")) { box.classList.remove("attack"); btn.textContent = "Launch attack"; btn.setAttribute("aria-pressed", "false"); }
      drawSpark();
    }
  }

  btn.addEventListener("click", () => {
    const now = performance.now();
    if (now < attackUntil) { attackUntil = 0; return; }
    attackUntil = now + 9000;
    box.classList.add("attack"); btn.textContent = "Stop attack"; btn.setAttribute("aria-pressed", "true");
  });

  size();
  addEventListener("resize", size);
  if (reduce) { drawScene(0); drawSpark(); return; } // static picture, no motion
  new IntersectionObserver(([e]) => (on = e.isIntersecting && !document.hidden)).observe(cv);
  document.addEventListener("visibilitychange", () => (on = !document.hidden && cv.getBoundingClientRect().bottom > 0));
  requestAnimationFrame(tick);
})();
