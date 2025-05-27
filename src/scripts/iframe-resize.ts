/**
 * Simple iframe resize script
 */

// Function to get actual content height
const getContentHeight = (): number => {
  const allElements = document.getElementsByTagName('*');
  let maxBottom = 0;

  for (const element of allElements) {
    const rect = element.getBoundingClientRect();
    const bottom = rect.bottom + window.pageYOffset;
    maxBottom = Math.max(maxBottom, bottom);
  }

  return maxBottom;
};

// Function to send the iframe height to the parent window
const sendResizeMessage = (): void => {
  // Only run if we're in an iframe
  if (window.self === window.top) {
    return;
  }

  const height = getContentHeight();
  window.parent.postMessage(
    {
      subject: 'lti.frameResize',
      height: height,
    },
    '*'
  );
};

// Create a debounced version for resize events
const debouncedSendResize = (function() {
  let timeout: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(sendResizeMessage, 100);
  };
})();

// Export for manual triggers if needed
export const triggerResize = debouncedSendResize;

// Add to window for access from inline scripts
if (typeof window !== 'undefined') {
  (window as any).triggerIframeResize = triggerResize;
}

export function initializeIframeResize(): void {
  // Only run if we're in an iframe
  if (window.self === window.top) {
    return;
  }

  // Send the initial height on page load
  sendResizeMessage();
  window.addEventListener('load', sendResizeMessage);

  // Send the height whenever the window is resized
  window.addEventListener('resize', debouncedSendResize);

  // Observe DOM changes to dynamically adjust height
  const observer = new MutationObserver(debouncedSendResize);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Clean up on page unload
  window.addEventListener('unload', () => {
    observer.disconnect();
    window.removeEventListener('resize', debouncedSendResize);
    window.removeEventListener('load', sendResizeMessage);
  });
}