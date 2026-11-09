// "Back to portfolio": if we came from the portfolio, go back in history (same tab, same scroll position).
// Otherwise the link's normal href (../index.html#projects) is used.
document.querySelectorAll("a[data-back]").forEach((a) => {
  a.addEventListener("click", (e) => {
    let fromPortfolio = false;
    try { fromPortfolio = document.referrer && new URL(document.referrer).origin === location.origin && !/\/demos\//.test(new URL(document.referrer).pathname); } catch (err) {}
    if (fromPortfolio && history.length > 1) { e.preventDefault(); history.back(); }
  });
});
