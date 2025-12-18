const form = document.getElementById("login-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = { password: document.getElementById("password").value };

  const res = await fetch(window.location.pathname, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(password),
  });

  if (res.ok) {
    window.location.href = "control";
  } else {
    alert("パスワードが違います");
  }
});
