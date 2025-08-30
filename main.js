// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// DOM Ready state
function ready(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

// Safe element selector
function safeSelect(selector) {
  try {
    return document.querySelector(selector);
  } catch (e) {
    console.warn(`Invalid selector: ${selector}`);
    return null;
  }
}

// Safe element selector all
function safeSelectAll(selector) {
  try {
    return document.querySelectorAll(selector);
  } catch (e) {
    console.warn(`Invalid selector: ${selector}`);
    return [];
  }
}

// Initialize when DOM is ready
ready(function () {
  // Smooth scrolling for anchor links
  const anchorLinks = safeSelectAll('a[href^="#"]');
  anchorLinks.forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const href = this.getAttribute("href");
      const target = safeSelect(href);

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Header and scroll effects - throttled for performance
  const header = safeSelect("header");
  const scrollTopBtn = safeSelect(".scroll-top");

  const handleScroll = throttle(function () {
    const scrollY = window.scrollY || window.pageYOffset;

    if (header) {
      if (scrollY > 100) {
        header.style.background =
          "linear-gradient(90deg, rgba(242, 145, 182, 0.95), rgba(228, 183, 207, 0.95))";
        header.style.backdropFilter = "blur(10px)";
        header.style.webkitBackdropFilter = "blur(10px)"; // Safari support
      } else {
        header.style.background = "linear-gradient(90deg, #f291b6, #e4b7cf)";
        header.style.backdropFilter = "none";
        header.style.webkitBackdropFilter = "none";
      }
    }

    if (scrollTopBtn) {
      if (scrollY > 500) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    }
  }, 16); // ~60fps

  window.addEventListener("scroll", handleScroll, { passive: true });

  // Mobile menu functions
  const mobileMenu = safeSelect("#mobileMenu");
  const menuToggle = safeSelect(".mobile-menu-toggle");

  if (menuToggle && mobileMenu) {
    // Close mobile menu on outside click
    document.addEventListener("click", function (event) {
      if (
        !mobileMenu.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        mobileMenu.classList.remove("active");
      }
    });

    // Close menu when clicking on menu links
    const mobileMenuLinks = mobileMenu.querySelectorAll("a");
    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("active");
      });
    });
  }

  // Set initial viewport height for mobile browsers
  function setViewportHeight() {
    try {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    } catch (e) {
      console.warn("Could not set viewport height:", e);
    }
  }

  // Handle orientation changes
  function handleOrientationChange() {
    setTimeout(setViewportHeight, 100);
  }

  // Initialize viewport height
  setViewportHeight();

  // Event listeners for viewport changes
  window.addEventListener("resize", debounce(setViewportHeight, 100));
  window.addEventListener("orientationchange", handleOrientationChange);

  // Lazy loading for images (if data-src attribute is used)
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;

            if (src) {
              img.src = src;
              img.classList.remove("lazy");
              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    const lazyImages = safeSelectAll("img[data-src]");
    lazyImages.forEach((img) => {
      imageObserver.observe(img);
    });
  }

  // Form validation and error handling (if forms exist)
  const forms = safeSelectAll("form");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      // Add any form validation here if needed
      console.log("Form submitted");
    });
  });

  // Enhanced accessibility
  function handleKeyboardNavigation(e) {
    // Escape key closes mobile menu
    if (
      e.key === "Escape" &&
      mobileMenu &&
      mobileMenu.classList.contains("active")
    ) {
      mobileMenu.classList.remove("active");
      if (menuToggle) {
        menuToggle.focus();
      }
    }
  }

  document.addEventListener("keydown", handleKeyboardNavigation);

  // Error handling for any failed operations
  window.addEventListener("error", function (e) {
    console.warn("JavaScript error caught:", e.message);
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", function (e) {
    console.warn("Unhandled promise rejection:", e.reason);
  });
});

// Global functions that need to be accessible from HTML
window.toggleMobileMenu = function () {
  const mobileMenu = safeSelect("#mobileMenu");
  if (mobileMenu) {
    mobileMenu.classList.toggle("active");
  }
};

window.closeMobileMenu = function () {
  const mobileMenu = safeSelect("#mobileMenu");
  if (mobileMenu) {
    mobileMenu.classList.remove("active");
  }
};

window.scrollToTop = function () {
  try {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch (e) {
    // Fallback for older browsers
    window.scrollTo(0, 0);
  }
};

// Utility function to get screen size
window.getScreenSize = function () {
  const width = window.innerWidth;
  if (width < 576) return "xs";
  if (width < 768) return "sm";
  if (width < 992) return "md";
  if (width < 1200) return "lg";
  return "xl";
};

// Check if browser supports modern features
function checkBrowserSupport() {
  const support = {
    flexbox: CSS.supports("display", "flex"),
    grid: CSS.supports("display", "grid"),
    customProperties: CSS.supports("--test", "test"),
    intersectionObserver: "IntersectionObserver" in window,
    backdropFilter: CSS.supports("backdrop-filter", "blur(1px)"),
  };

  // Log any missing features (for debugging)
  Object.entries(support).forEach(([feature, isSupported]) => {
    if (!isSupported) {
      console.info(`Browser does not support: ${feature}`);
    }
  });

  return support;
}

// Initialize browser support check
ready(checkBrowserSupport);

// Polyfill for older browsers
if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    var el = this;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}
