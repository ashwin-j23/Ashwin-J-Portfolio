document.getElementById("print").addEventListener("click", () => window.print());

document.querySelectorAll("a[data-back]").forEach((a) => {
  a.addEventListener("click", (e) => {
    let fromPortfolio = false;
    try { fromPortfolio = document.referrer && new URL(document.referrer).origin === location.origin; } catch (err) {}
    if (fromPortfolio && history.length > 1) { e.preventDefault(); history.back(); }
  });
});
