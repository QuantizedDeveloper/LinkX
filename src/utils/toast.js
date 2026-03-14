let toastContainer = null;

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toast-root";
  document.body.appendChild(container);
  return container;
}

export function showToast(message, type = "info") {
  if (!toastContainer) {
    toastContainer = document.getElementById("toast-root") || createToastContainer();
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerText = message;

  toastContainer.appendChild(toast);

  // animate in
  setTimeout(() => toast.classList.add("show"), 10);

  // remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
