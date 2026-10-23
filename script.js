/* ============================================================
   TYPHOON GO — script.js
   Navigation, page transitions, and interactive logic
   ============================================================ */

'use strict';

// ── Leaflet Map Initialization ────────────────────────────────

let map;

/**
 * Initialize the Leaflet map for the Safe Routes page.
 * Uses OpenStreetMap tiles and centers on MSU-IIT, Iligan City, Philippines.
 */
function initFreeMap() {
  // Initialize the map with MSU-IIT coordinates
  map = L.map('map-container').setView([8.2411, 124.2439], 15);

  // Load free map tiles from OpenStreetMap
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Add marker for MSU-IIT
  let marker = L.marker([8.2411, 124.2439]).addTo(map);
  marker.bindPopup("<b>MSU-IIT</b><br>Iligan City, Lanao del Norte.").openPopup();
}

const pages = document.querySelectorAll('.page');

/**
 * Navigate to a page by its ID string.
 * Adds a slide-in animation class for visual polish.
 * Updates navbar active states based on current page.
 */
function navigateTo(targetId) {
  const currentActive = document.querySelector('.page.active');
  const target = document.getElementById(targetId);

  if (!target || target === currentActive) return;

  // Remove active from current
  if (currentActive) {
    currentActive.classList.remove('active');
  }

  // Activate target with animation
  target.classList.add('active');
  target.classList.add('slide-in');

  // Clean up animation class after it finishes
  target.addEventListener('animationend', () => {
    target.classList.remove('slide-in');
  }, { once: true });

  // Scroll target to top
  target.scrollTop = 0;

  // Update navbar active states
  updateNavbarActive(targetId);

  // Initialize map if navigating to Safe Routes page
  if (targetId === 'page-safe-routes') {
    setTimeout(() => {
      if (!map) {
        initFreeMap();
      } else {
        map.invalidateSize();
      }
    }, 100);
  }
}

/**
 * Update which navbar button is active based on current page
 */
function updateNavbarActive(pageId) {
  // Get all navbar buttons
  const navBtns = document.querySelectorAll('.nav-btn');
  
  // Remove active class from all
  navBtns.forEach(btn => btn.classList.remove('nav-active'));
  
  // Add active class to relevant button
  navBtns.forEach(btn => {
    const target = btn.getAttribute('data-target');
    if (target === pageId) {
      btn.classList.add('nav-active');
    }
  });
}

// ── Login Page Wiring ─────────────────────────────────────────

document.getElementById('btn-login').addEventListener('click', () => {
  navigateTo('page-dashboard');
});

document.getElementById('link-forgot').addEventListener('click', (e) => {
  e.preventDefault();
  navigateTo('page-forgot');
});

document.getElementById('btn-create-account').addEventListener('click', () => {
  navigateTo('page-register');
});

// ── Forgot Password Page ──────────────────────────────────────

document.getElementById('btn-reset-password').addEventListener('click', () => {
  const emailField = document.getElementById('forgot-email');
  const newPass = document.getElementById('forgot-new-pass');
  const confirmPass = document.getElementById('forgot-confirm-pass');

  if (!emailField.value.trim()) {
    showToast('Please enter your email.');
    return;
  }
  if (!newPass.value || newPass.value.length < 6) {
    showToast('Password must be at least 6 characters.');
    return;
  }
  if (newPass.value !== confirmPass.value) {
    showToast('Passwords do not match.');
    return;
  }

  showToast('Password reset successful!', true);
  setTimeout(() => navigateTo('page-login'), 1200);
});

document.getElementById('link-back-login-forgot').addEventListener('click', (e) => {
  e.preventDefault();
  navigateTo('page-login');
});

// ── Registration Page Wiring ──────────────────────────────────

document.getElementById('link-already-signed').addEventListener('click', (e) => {
  e.preventDefault();
  navigateTo('page-login');
});

document.getElementById('btn-register-submit').addEventListener('click', () => {
  navigateTo('page-login');
});

// ── Dashboard Wiring ──────────────────────────────────────────

document.getElementById('btn-tap-sos').addEventListener('click', () => {
  showToast('Emergency SOS activated! Help is being dispatched.');
});

document.getElementById('btn-evac-centers').addEventListener('click', () => {
  navigateTo('page-evac-centers');
});

document.getElementById('btn-safe-routes').addEventListener('click', () => {
  navigateTo('page-safe-routes');
});

document.getElementById('btn-emergency-updates').addEventListener('click', () => {
  navigateTo('page-emergency-updates');
});

// ── Back Buttons (generic) ────────────────────────────────────

// All elements with data-target attribute (nav buttons and back buttons)
document.querySelectorAll('[data-target]').forEach(el => {
  el.addEventListener('click', () => {
    const target = el.getAttribute('data-target');
    if (target) navigateTo(target);
  });
});

// ── Carousel Functionality ────────────────────────────────────

let currentSlide = 0;
const carousel = document.getElementById('featured-carousel');
const carouselDots = document.querySelectorAll('.carousel-dot');

function showSlide(index) {
  const slides = document.querySelectorAll('.carousel-slide:not(.carousel-slide-btn)');

  // Update slide position using scrollLeft
  const slideWidth = carousel.clientWidth;
  carousel.scrollLeft = index * slideWidth;

  // Update dots
  carouselDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  currentSlide = index;
}

// Handle carousel slide button navigation (click to go to page)
document.querySelectorAll('.carousel-slide-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const target = btn.getAttribute('data-target');
    if (target) {
      navigateTo(target);
    }
  });
});

// Handle image load errors
document.querySelectorAll('.carousel-img').forEach((img, index) => {
  img.onerror = function() {
    console.warn(`Carousel image ${index} failed to load: ${this.src}`);
    this.parentElement.style.background = 'linear-gradient(135deg, #ddd 0%, #999 100%)';
    this.style.display = 'none';
  };
});

// Add click listeners to carousel dots
carouselDots.forEach(dot => {
  dot.addEventListener('click', () => {
    const index = parseInt(dot.getAttribute('data-index'));
    showSlide(index);
  });
});

// Auto-rotate carousel every 5 seconds
setInterval(() => {
  const nextSlide = (currentSlide + 1) % 2;
  showSlide(nextSlide);
}, 5000);

// Add swipe/touch functionality for carousel
let touchStartX = 0;
let touchEndX = 0;

carousel.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

carousel.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  if (touchStartX - touchEndX > 50) {
    // Swiped left, go to next slide
    const nextSlide = (currentSlide + 1) % 2;
    showSlide(nextSlide);
  } else if (touchEndX - touchStartX > 50) {
    // Swiped right, go to previous slide
    const prevSlide = (currentSlide - 1 + 2) % 2;
    showSlide(prevSlide);
  }
}

// ── Safe Routes — Destination Dropdown ───────────────────────

const destinationToggle  = document.getElementById('destination-toggle');
const destinationDropdown = document.getElementById('destination-dropdown');
const destChevron         = document.getElementById('dest-chevron');
const travelInfoCard      = document.getElementById('travel-info-card');

destinationToggle.addEventListener('click', () => {
  const isOpen = destinationDropdown.style.display !== 'none';

  if (isOpen) {
    destinationDropdown.style.display = 'none';
    destChevron.classList.remove('open');
  } else {
    destinationDropdown.style.display = 'block';
    destChevron.classList.add('open');
  }
});

// Clicking a destination option shows travel info
document.querySelectorAll('.dest-option').forEach(option => {
  option.addEventListener('click', () => {
    const selectedName = option.querySelector('span').textContent.trim();
    document.querySelector('.dest-name').textContent = selectedName;
    document.querySelector('.dest-address').textContent = 'Iligan City, Lanao Del Norte, Philippines';

    // Close dropdown
    destinationDropdown.style.display = 'none';
    destChevron.classList.remove('open');

    // Show travel info
    travelInfoCard.style.display = 'block';
  });
});

// ── Evacuation Centers Search ──────────────────────────────────

document.getElementById('evac-search').addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const cards = document.querySelectorAll('.evac-card');

  cards.forEach(card => {
    const name = card.querySelector('.evac-name').textContent.toLowerCase();
    const desc = card.querySelector('.evac-desc').textContent.toLowerCase();
    card.style.display = (name.includes(query) || desc.includes(query)) ? '' : 'none';
  });
});

// ── Emergency Updates Search ───────────────────────────────────

document.getElementById('alert-search').addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const cards = document.querySelectorAll('.alert-card');

  cards.forEach(card => {
    const body = card.querySelector('.alert-body').textContent.toLowerCase();
    card.style.display = body.includes(query) ? '' : 'none';
  });
});

// ── Toast Notification ────────────────────────────────────────

/**
 * Shows a small non-intrusive toast notification inside the app wrapper.
 * @param {string} message - The message to display.
 * @param {boolean} [success=false] - Green for success, red for error.
 */
function showToast(message, success = false) {
  // Remove existing toast
  const existing = document.getElementById('app-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'app-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: absolute;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%);
    background: ${success ? '#2ECC40' : '#FF2323'};
    color: #fff;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 700;
    padding: 10px 22px;
    border-radius: 24px;
    white-space: nowrap;
    z-index: 9999;
    box-shadow: 0 4px 18px rgba(0,0,0,0.2);
    animation: toastIn 0.25s ease both;
    pointer-events: none;
  `;

  // Inject keyframes if not already there
  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
      @keyframes toastIn {
        from { opacity: 0; transform: translateX(-50%) translateY(10px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  document.getElementById('app-wrapper').appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 320);
  }, 2200);
}



// ── Account Page Logout ──────────────────────────────────────

document.getElementById('btn-logout').addEventListener('click', () => {
  showToast('Logged out successfully!', true);
  setTimeout(() => navigateTo('page-login'), 1200);
});

// ── Add Contact Modal ────────────────────────────────────────

const addContactModal = document.getElementById('add-contact-modal-overlay');
const btnAddContact = document.getElementById('btn-add-contact');
const btnCloseAddContact = document.getElementById('btn-close-add-contact');
const addContactForm = document.getElementById('add-contact-form');

// Open modal
btnAddContact.addEventListener('click', () => {
  addContactModal.classList.add('active');
});

// Close modal
btnCloseAddContact.addEventListener('click', () => {
  addContactModal.classList.remove('active');
});

// Close modal when clicking overlay
addContactModal.addEventListener('click', (e) => {
  if (e.target === addContactModal) {
    addContactModal.classList.remove('active');
  }
});

// Handle form submission
addContactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('new-contact-name').value.trim();
  const phone = document.getElementById('new-contact-phone').value.trim();

  if (!name || !phone) {
    showToast('Please fill in all fields.');
    return;
  }

  // Create contact object (you can save to localStorage or send to backend)
  const newContact = {
    name: name,
    phone: '+63' + phone,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  // For now, just show a success toast
  showToast(`Contact "${name}" added successfully!`, true);

  // Reset form
  addContactForm.reset();

  // Close modal
  addContactModal.classList.remove('active');

  // Optional: Add contact to recent calls carousel
  addContactToCarousel(newContact);
});

// Helper function to add contact to recent calls carousel
function addContactToCarousel(contact) {
  const carousel = document.getElementById('recent-calls-carousel');
  if (!carousel) return;

  // Create avatar color (random or based on name)
  const colors = ['#e74c3c', '#2980b9', '#8e44ad', '#e67e22', '#27ae60', '#1abc9c'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const initials = contact.name.charAt(0).toUpperCase();

  const newCard = document.createElement('div');
  newCard.className = 'recent-call-card';
  newCard.innerHTML = `
    <div class="recent-call-avatar" style="background: ${randomColor};">${initials}</div>
    <span class="recent-call-name">${contact.name.split(' ')[0]}</span>
    <span class="recent-call-time">just now</span>
  `;

  carousel.insertBefore(newCard, carousel.firstChild);
}

// ── Go-Bag Checklist — Gamified Logic ────────────────────────

(function initGoBagChecklist() {
  const checkboxes     = document.querySelectorAll('.gobag-checkbox');
  const progressFill   = document.getElementById('gobag-progress-fill');
  const percentText    = document.getElementById('gobag-percent');
  const itemsCountText = document.getElementById('gobag-items-count');
  const statusLabel    = document.getElementById('gobag-status-label');
  const statusText     = document.getElementById('gobag-status-text');
  const overlay        = document.getElementById('gobag-milestone-overlay');
  const milestoneIcon  = document.getElementById('gobag-milestone-icon');
  const milestoneTitle = document.getElementById('gobag-milestone-title');
  const milestoneMsg   = document.getElementById('gobag-milestone-msg');
  const milestoneBtn   = document.getElementById('gobag-milestone-btn');

  if (!checkboxes.length) return;

  const TOTAL = checkboxes.length; // 15 items

  // Track which milestones have already triggered
  const triggered = { 25: false, 50: false, 75: false, 100: false };

  const MILESTONES = {
    25: {
      icon: '🎒',
      title: 'Off to a great start!',
      msg: 'You\'ve packed 25% of your go-bag. Keep it up — every item could save your life.'
    },
    50: {
      icon: '⚡',
      title: 'Halfway there!',
      msg: 'Your bag is half-full. You\'re more prepared than most. Don\'t stop now!'
    },
    75: {
      icon: '🔥',
      title: 'Almost ready!',
      msg: 'Just a few more items and your go-bag will be storm-ready. You\'ve got this!'
    },
    100: {
      icon: '🏅',
      title: 'FULLY PACKED!',
      msg: 'Your go-bag is 100% complete. You are prepared and ready for any emergency. Stay safe!'
    }
  };

  function updateChecklist() {
    const checked = document.querySelectorAll('.gobag-checkbox:checked').length;
    const pct     = Math.round((checked / TOTAL) * 100);

    // Update progress bar
    progressFill.style.width = pct + '%';
    percentText.textContent  = pct + '%';
    itemsCountText.textContent = `${checked} / ${TOTAL} items packed`;


    // Update status label
    statusLabel.className = 'gobag-status-label';
    if (pct === 0) {
      statusText.textContent = 'Not Started';
    } else if (pct < 50) {
      statusLabel.classList.add('status-in-progress');
      statusText.textContent = 'In Progress';
    } else if (pct < 100) {
      statusLabel.classList.add('status-almost');
      statusText.textContent = 'Almost Ready!';
    } else {
      statusLabel.classList.add('status-ready');
      statusText.textContent = '✓ Fully Packed!';
    }

    // Check milestones
    [25, 50, 75, 100].forEach(threshold => {
      if (pct >= threshold && !triggered[threshold]) {
        triggered[threshold] = true;
        showMilestone(threshold);
      }
      // Reset trigger if user un-checks below threshold
      if (pct < threshold) {
        triggered[threshold] = false;
      }
    });
  }

  function showMilestone(threshold) {
    const m = MILESTONES[threshold];
    milestoneIcon.textContent  = m.icon;
    milestoneTitle.textContent = m.title;
    milestoneMsg.textContent   = m.msg;
    overlay.classList.add('active');
  }

  // Dismiss milestone popup
  milestoneBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
  });

  // Wire each checkbox
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      // Toggle checked visual on the parent label
      const label = cb.closest('.check-item');
      if (label) {
        label.classList.toggle('item-checked', cb.checked);
      }
      updateChecklist();
    });
  });
})();



// Ensure only login page shows on load (already set via .active in HTML)
// Verify correct initial state
window.addEventListener('DOMContentLoaded', () => {
  // If no active page found, default to login
  const hasActive = document.querySelector('.page.active');
  if (!hasActive) {
    document.getElementById('page-login').classList.add('active');
  } else {
    // Set navbar active state if active page has navbar
    const activePage = document.querySelector('.page.active');
    if (activePage.id) {
      updateNavbarActive(activePage.id);
    }
  }
});

// ============================================================
// CHAT & MESSAGING LOGIC
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Smart Routing to Chat Page (Updates Header & Avatar dynamically)
  document.addEventListener('click', (e) => {
    
    // Check if we clicked an SMS button OR a Recent Call card
    const smsBtn = e.target.closest('.contact-sms');
    const callCard = e.target.closest('.recent-call-card');
    
    let targetName = null;
    let targetBgColor = 'var(--red)'; // default fallback

    // If we clicked the SMS button in the contact list
    if (smsBtn) {
      targetName = smsBtn.getAttribute('data-contact');
      // Try to get the avatar color from the same row
      const row = smsBtn.closest('.contact-row');
      if (row) {
        const avatar = row.querySelector('.contact-avatar');
        if (avatar) targetBgColor = avatar.style.backgroundColor || targetBgColor;
      }
    } 
    // If we clicked the Recent Call card at the top
    else if (callCard) {
      targetName = callCard.getAttribute('data-contact');
      const avatar = callCard.querySelector('.recent-call-avatar');
      if (avatar) targetBgColor = avatar.style.backgroundColor || targetBgColor;
    }

    // If a valid contact was clicked, update the UI and navigate
    if (targetName) {
      // 1. Update the Header Name and Empty State Name
      document.getElementById('msg-header-name').textContent = targetName;
      document.getElementById('msg-empty-name').textContent = targetName;

      // 2. Update the Avatars (Initial letter + Background Color)
      const initial = targetName.charAt(0).toUpperCase();
      const headerAvatar = document.getElementById('msg-header-avatar');
      const emptyAvatar = document.getElementById('msg-empty-avatar');

      headerAvatar.textContent = initial;
      headerAvatar.style.backgroundColor = targetBgColor;
      
      emptyAvatar.textContent = initial;
      // Optional: Give the empty state avatar a faded version of the color or keep it default

      // 3. Reset the chat layout so it's clean for the new contact
      document.getElementById('msg-chat-list').innerHTML = ''; // Clear old messages
      
      const emptyState = document.getElementById('msg-empty-state');
      const quickChats = document.getElementById('msg-quick-chats');
      
      if (emptyState) emptyState.style.display = 'flex'; // Show empty state
      if (quickChats) quickChats.style.display = 'flex'; // Show quick actions

      // 4. Finally, navigate to the page
      if (typeof navigateTo === 'function') {
        navigateTo('page-message');
      }
    }
  });

  // 2. Chat Mechanics
  const msgInput = document.getElementById('msg-input');
  const msgSendBtn = document.getElementById('msg-send-btn');
  const msgChatList = document.getElementById('msg-chat-list');
  const msgBody = document.getElementById('msg-body');
  const emptyState = document.getElementById('msg-empty-state');
  const quickChats = document.getElementById('msg-quick-chats');

  // Function to create and append a chat bubble
  function addMessage(text, isOutgoing = true, isUrgent = false) {
    if (!text.trim()) return; // Don't send empty messages

    // Hide empty states on first message
    if (emptyState) emptyState.style.display = 'none';
    if (quickChats) quickChats.style.display = 'none';

    // Create message wrapper
    const wrap = document.createElement('div');
    wrap.className = `msg-bubble-wrap ${isOutgoing ? 'outgoing' : 'incoming'}`;
    
    // Create bubble
    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${isUrgent ? 'urgent' : ''}`;
    bubble.textContent = text;

    wrap.appendChild(bubble);
    msgChatList.appendChild(wrap);

    // Auto-scroll to the bottom of the chat
    msgBody.scrollTop = msgBody.scrollHeight;
  }

  // Send via the Send Button
  if (msgSendBtn && msgInput) {
    msgSendBtn.addEventListener('click', () => {
      addMessage(msgInput.value);
      msgInput.value = ''; // Clear input
    });

    // Send via the Enter Key
    msgInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addMessage(msgInput.value);
        msgInput.value = '';
      }
    });
  }

  // Send via Quick Chat Buttons
  const quickBtns = document.querySelectorAll('.msg-quick-btn');
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isUrgent = btn.classList.contains('msg-quick-urgent');
      addMessage(btn.getAttribute('data-msg'), true, isUrgent);
    });
  });

  // 3. Header Dropdown Menu Toggle
  const menuToggle = document.getElementById('msg-menu-toggle');
  const msgDropdown = document.getElementById('msg-dropdown');
  
  if (menuToggle && msgDropdown) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent closing immediately
      msgDropdown.style.display = msgDropdown.style.display === 'none' ? 'block' : 'none';
    });

    // Close dropdown when clicking anywhere else on the screen
    document.addEventListener('click', () => {
      msgDropdown.style.display = 'none';
    });
  }

});