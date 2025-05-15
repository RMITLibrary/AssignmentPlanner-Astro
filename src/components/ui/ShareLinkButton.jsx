import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { createShareableLink } from '../../utils/url-params';

/**
 * Button component that creates and copies a shareable link
 */
const ShareLinkButton = ({ planDetails, isGroup }) => {
  const [buttonText, setButtonText] = useState('Copy shareable link');
  const [shareableLink, setShareableLink] = useState('');

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

  const handleCopyLink = () => {
    try {
      // Copy to clipboard
      navigator.clipboard.writeText(shareableLink)
        .then(() => {
          // Change button text to indicate success
          setButtonText('Link copied!');

          // Data layer tracking for analytics
          if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push({
              'event': 'share_link_copied',
              'formType': 'assignment_planner',
              'assignmentType': planDetails.name
            });
          }

          // Reset button text after delay
          setTimeout(() => {
            setButtonText('Copy Shareable Link');
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
          // If copying fails, offer to open the link
          handleOpenLink();
        });
    } catch (error) {
      console.error('Error creating shareable link:', error);
    }
  };

  // Handle opening the link in a new tab
  const handleOpenLink = () => {
    try {
      window.open(shareableLink, '_blank');
      setButtonText('Link Opened!');
      setTimeout(() => {
        setButtonText('Copy Shareable Link');
      }, 2000);
    } catch (error) {
      console.error('Error opening link:', error);
      setButtonText('Error - Try Again');
      setTimeout(() => {
        setButtonText('Copy Shareable Link');
      }, 2000);
    }
  };

  return (
    <button className="btn btn-default share-link-btn" onClick={handleCopyLink} aria-label="Copy shareable link to clipboard">
      {buttonText}
    </button>
  );
};

export default ShareLinkButton;
