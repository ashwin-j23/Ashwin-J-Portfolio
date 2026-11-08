// Runs before the page paints: skip the opening scan if it was already shown in this tab.
try { if (sessionStorage.getItem("introSeen") && !/[?&]intro\b/.test(location.search)) document.documentElement.classList.add("intro-done"); } catch (e) { document.documentElement.classList.add("intro-done"); }
