(function () {
  const publishableKey = window.MONHOOD_AUTH?.publishableKey || "";
  const basePath = window.MONHOOD_AUTH?.basePath || "";
  const authLinks = document.querySelector("[data-auth-links]");

  function setAuthLinks(clerk) {
    if (!authLinks) return;
    if (clerk.user) {
      authLinks.innerHTML =
        '<a href="' + basePath + '/account">Account</a>' +
        '<a href="#" data-sign-out>Sign out</a>';
      authLinks.querySelector("[data-sign-out]").addEventListener("click", function (event) {
        event.preventDefault();
        clerk.signOut({ redirectUrl: basePath + "/" });
      });
    } else {
      authLinks.innerHTML =
        '<a href="' + basePath + '/login">Log in</a>' +
        '<a class="auth-strong" href="' + basePath + '/signup">Create account</a>';
    }
  }

  function mountAuthPage(clerk) {
    const mount = document.querySelector("[data-clerk-mount]");
    if (!mount) return;
    if (!publishableKey || !window.Clerk) {
      mount.innerHTML = '<div class="auth-fallback">Authentication is not configured yet. Add the Clerk publishable key to enable this page.</div>';
      return;
    }
    const options = {
      appearance: {
        variables: {
          colorPrimary: "#f7931a",
          colorText: "#f3f6fa",
          colorTextSecondary: "#9aa7b8",
          colorBackground: "#131a24",
          colorInputBackground: "#0a0e14",
          colorInputText: "#f3f6fa",
          borderRadius: "10px",
        },
        elements: {
          card: "clerk-card",
          formButtonPrimary: "clerk-primary",
          footerActionLink: "clerk-link",
        },
      },
      afterSignInUrl: basePath + "/account",
      afterSignUpUrl: basePath + "/account",
    };
    if (document.body.dataset.authPage === "signup") {
      clerk.mountSignUp(mount, options);
    } else {
      clerk.mountSignIn(mount, options);
    }
  }

  function renderAccount(clerk) {
    const account = document.querySelector("[data-account]");
    if (!account) return;
    if (!clerk.user) {
      window.location.replace(basePath + "/login");
      return;
    }
    const user = clerk.user;
    const name = user.fullName || user.username || "Monhood user";
    const email = user.primaryEmailAddress?.emailAddress || "Email not available";
    const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    account.querySelector("[data-user-name]").textContent = name;
    account.querySelector("[data-user-email]").textContent = email;
    account.querySelector("[data-avatar]").textContent = initials;
    account.querySelector("[data-account-loading]").setAttribute("data-hidden", "");
    account.querySelector("[data-account-content]").removeAttribute("data-hidden");
    account.querySelector("[data-account-sign-out]").addEventListener("click", function () {
      clerk.signOut({ redirectUrl: basePath + "/" });
    });
  }

  async function start() {
    if (!window.Clerk || !publishableKey) {
      if (authLinks) setAuthLinks({ user: null });
      const account = document.querySelector("[data-account-loading]");
      if (account) account.textContent = "Authentication is not configured.";
      return;
    }
    const clerk = new window.Clerk(publishableKey);
    await clerk.load();
    window.monhoodClerk = clerk;
    setAuthLinks(clerk);
    mountAuthPage(clerk);
    renderAccount(clerk);
    clerk.addListener(function () {
      setAuthLinks(clerk);
    });
  }

  if (window.Clerk) {
    start().catch(function (error) {
      console.error("Monhood authentication failed to load", error);
    });
  } else {
    window.addEventListener("load", function () {
      start().catch(function (error) {
        console.error("Monhood authentication failed to load", error);
      });
    });
  }
})();