/**
 * Embed functionality for the Assignment Planner
 * This script handles behavior specific to embedded views
 */

/**
 * Initializes embed-specific functionality
 */
export function initializeEmbedFunctionality() {
  const isEmbedded = window.self !== window.top ||
                     new URLSearchParams(window.location.search).has('embed') ||
                     new URLSearchParams(window.location.search).has('iframe');

  if (isEmbedded) {
    // Add the hide-in-iframe class to the print button
    const pdfButtons = document.querySelectorAll('.btn-pdf');
    pdfButtons.forEach(button => {
      button.classList.add('hide-in-iframe');
    });

    // Also set a flag in the HTML to block printing via CSS
    document.documentElement.setAttribute('data-embedded', 'true');

    // Log that print is disabled in embedded mode
    console.log('Print functionality is disabled in embedded mode');

    // Override the window.print function as an additional safeguard
    const originalPrint = window.print;
    window.print = function() {
      console.log('Print functionality is disabled in embedded mode');
      return false;
    };
  }
}

// Initialize when the DOM is fully loaded
if (typeof document !== 'undefined') {
  // Try to initialize as early as possible
  initializeEmbedFunctionality();

  // Also ensure it runs when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEmbedFunctionality);
  } else {
    initializeEmbedFunctionality();
  }
}
