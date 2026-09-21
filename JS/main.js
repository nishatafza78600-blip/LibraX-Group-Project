



document.addEventListener("DOMContentLoaded", function () {
  // Hero section ke buttons select ho rahe hain
  const signUpBtn = document.querySelector('.hero-content a[href="./ragister.html"]');
  const booksBtn = document.querySelector('.hero-content a[href="./html/admin/books.html"]');

  // Sign Up Button Click Handler
  if (signUpBtn) {
    signUpBtn.addEventListener("click", function (e) {
      e.preventDefault(); // Default instant jump ko rok kar dynamic action
      window.location.href = "./ragister.html"; // Register page redirect
    });
  }

  // Books Button Click Handler
  if (booksBtn) {
    booksBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "./html/admin/books.html"; // Books page redirect
    });
  }

  
});




//========================================================
// =======================================================




document.addEventListener("DOMContentLoaded", function () {
  // Select all flip cards on index.html
  const flipCards = document.querySelectorAll(".flip-card");

  // Page mapping based on card titles/order
  const pageLinks = [
    "./html/admin/books.html", // Card 1: Large Collection
    "./html/member/members.html",        // Card 2: Member Management
    "./html/admin/return-book.html",        // Card 3: Issue and return
   
  ];

  flipCards.forEach((card, index) => {
    card.style.cursor = "pointer";
    
    card.addEventListener("click", function () {
      if (pageLinks[index]) {
        window.location.href = pageLinks[index];
      }
    });
  });
});



function checkDashboardAccess() {
  // Simple check: Kya user logged in hai?
  let userLoggedIn = localStorage.getItem("isLoggedIn");

  if (userLoggedIn === "true") {
    // Agar login hai toh Dashboard par bhej do
    window.location.href = "./html/admin/dashboard.html";
  } else {
    // Agar login nahi hai toh simple message dikhao aur Login page par bhej do
    alert("Pehle login ya register karein!");
    window.location.href = "register.html";
  }
}


// ========================================
// ========================================

// JS/main.js
import { auth, db } from "./firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. HERO SECTION BUTTONS
  const signUpBtn = document.querySelector('.hero-content a[href*="register"]');
  const booksBtn = document.querySelector('.hero-content a[href*="books.html"]');

  if (signUpBtn) {
    signUpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "./register.html";
    });
  }

  if (booksBtn) {
    booksBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "./html/admin/books.html";
    });
  }

  // 2. FLIP CARDS CLICK LOGIC
  const flipCards = document.querySelectorAll(".flip-card");

  flipCards.forEach((card, index) => {
    card.style.cursor = "pointer";

    card.addEventListener("click", (e) => {
      e.preventDefault();

      // Cards 1-3 preserve existing behavior
      if (index === 0) {
        window.location.href = "./html/admin/books.html";
      } else if (index === 1) {
        window.location.href = "./html/member/members.html";
      } else if (index === 2) {
        window.location.href = "./html/admin/return-book.html";
      } 
      // NEW CODE: Card 4 (Smart Dashboard) dynamic flow
      else if (index === 3) {
        handleSmartDashboardClick(card);
      }
    });
  });
});

// NEW CODE: Smart Dashboard Auth Flow
async function handleSmartDashboardClick(cardElement) {
  showCardLoader(cardElement);

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    unsubscribe(); // Unsubscribe immediately after state check

    // CASE 1: Not logged in -> Redirect to Register
    if (!user) {
      window.location.href = "./register.html";
      return;
    }

    // CASE 2: Logged in -> Verify role in Firestore
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        window.location.href = "./register.html";
        return;
      }

      const userData = userSnap.data();
      const role = userData.role ? userData.role.toLowerCase() : "member";

      if (role === "admin") {
        window.location.href = "./html/admin/dashboard.html";
      } else {
        window.location.href = "./html/member/member-dashboard.html";
      }
    } catch (error) {
      console.error("Error retrieving user role:", error);
      hideCardLoader(cardElement);
      window.location.href = "./login.html";
    }
  });
}

function showCardLoader(card) {
  if (!card) return;
  card.style.pointerEvents = "none";
  card.style.opacity = "0.7";

  if (!card.querySelector(".card-loader")) {
    const loader = document.createElement("div");
    loader.className = "card-loader";
    loader.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 100;
    `;
    loader.innerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    `;
    card.appendChild(loader);
  }
}

function hideCardLoader(card) {
  if (!card) return;
  card.style.pointerEvents = "auto";
  card.style.opacity = "1";
  const loader = card.querySelector(".card-loader");
  if (loader) loader.remove();
}





// NEW CODE: Role Validation & Registration Processing
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const contact = document.getElementById("contact")?.value.trim() || "";
  const roleSelect = document.getElementById("role");
  const role = roleSelect ? roleSelect.value : "";

  // NEW CODE: Enforce mandatory role selection
  if (!role || (role !== "admin" && role !== "member")) {
    alert("Please select a valid role (Admin or Member) before registering.");
    return;
  }

  try {
    const result = await registerUser(email, password, name, contact, role);
    if (result.success) {
      alert("Registration successful! Please log in.");
      window.location.href = "./login.html";
    } else {
      alert("Registration Error: " + result.error);
    }
  } catch (err) {
    alert("Error during registration: " + err.message);
  }
});

// NEW CODE: Login Processing & Role-based Redirection
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const result = await loginUser(email, password);
    if (result.success) {
      // NEW CODE: Fetch role securely from response or Firestore and redirect
      if (result.user && result.user.role === "admin") {
        window.location.href = "./html/admin/dashboard.html";
      } else {
        window.location.href = "./html/member/member-dashboard.html";
      }
    } else {
      alert("Login Failed: " + result.error);
    }
  } catch (err) {
    alert("Error during login: " + err.message);
  }
});