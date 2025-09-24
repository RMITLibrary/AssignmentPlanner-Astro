import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { createShareableLink } from '../../utils/url-params';

/**
 * Button component that creates and copies a shareable link
 */
const ShareLinkButton = ({ planDetails, isGroup }) => {
  const [shareableLink, setShareableLink] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const messageTimeoutRef = useRef(null);

  // Generate the shareable link when component mounts or planDetails changes
  useEffect(() => {
    if (planDetails && planDetails.projectID) {
      const link = createShareableLink(
        planDetails.name,
        planDetails.projectID,
        planDetails.startDate,
        planDetails.endDate,
        planDetails.assignmentName,
        isGroup
      );
      setShareableLink(link);
    }
  }, [planDetails, isGroup]);

  const showConfirmationMessage = (message) => {
    setConfirmationMessage(message);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setConfirmationMessage('');
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const handleOpenLink = () => {
    try {
      if (typeof window !== 'undefined') {
        window.open(shareableLink, '_blank', 'noopener');
        showConfirmationMessage('Share link opened in a new tab');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      showConfirmationMessage('Unable to open share link');
    }
  };

  const handleCopyLink = async () => {
    if (!shareableLink) {
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareableLink);

        // Data layer tracking for analytics
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'share_link_copied',
            formType: 'assignment_planner',
            assignmentType: planDetails?.name,
          });
        }

        showConfirmationMessage('Share link copied to clipboard');
        return;
      }

      throw new Error('Clipboard API not available');
    } catch (error) {
      console.error('Failed to copy link: ', error);
      handleOpenLink();
    }
  };

  return (
    <div className="btn-share-wrapper hide-in-iframe">
      <button
        className="btn btn-share"
        onClick={handleCopyLink}
        aria-label="Copy shareable link to clipboard"
        type="button"
        disabled={!shareableLink}
      >
        Share
      </button>
      {confirmationMessage && (
        <span className="btn-share-message" role="status" aria-live="polite">
          {confirmationMessage}
        </span>
      )}
    </div>
  );
};

export default ShareLinkButton;
