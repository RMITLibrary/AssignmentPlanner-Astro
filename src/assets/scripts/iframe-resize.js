(function () {
  'use strict';

  // Function to check if page is embedded
  const isEmbedded = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('iframe') === 'true' || urlParams.get('embed') === 'true';
  };

  // Function to send the iframe height to the parent window
  const sendResizeMessage = () => {
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage(
      {
        subject: 'lti.frameResize',
        height: height,
      },
      '*',
    );
  };

  // Function to handle embedded view
  const handleEmbeddedView = () => {
    if (isEmbedded()) {
      // Hide header and footer
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      if (header) header.style.display = 'none';
      if (footer) footer.style.display = 'none';

      // Adjust main content padding/margin since we removed header/footer
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.style.paddingTop = '0';
        mainContent.style.marginBottom = '0';
      }
    }
  };

  // Send the initial height on page load and handle embedded view
  window.addEventListener('load', () => {
    handleEmbeddedView();
    sendResizeMessage();
  });

  // Send the height whenever the window is resized
  window.addEventListener('resize', sendResizeMessage);

  // Optional: Observe DOM changes to dynamically adjust height
  const observer = new MutationObserver(sendResizeMessage);
  observer.observe(document.body, { childList: true, subtree: true });
})();
