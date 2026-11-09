// "Download PDF" opens the browser's print dialog; choose "Save as PDF".
document.getElementById("print").addEventListener("click", () => window.print());

// "Back to portfolio": return to the same place in the portfolio when we came from it.
document.querySelectorAll("a[data-back]").forEach((a) => {
  a.addEventListener("click", (e) => {
    let fromPortfolio = false;
    try { fromPortfolio = document.referrer && new URL(document.referrer).origin === location.origin; } catch (err) {}
    if (fromPortfolio && history.length > 1) { e.preventDefault(); history.back(); }
  });
});
