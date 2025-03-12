import { h } from 'preact';
import { useStore } from '@nanostores/preact';
import { isGroupAssignment } from '../../store'; // Import isGroupAssignment directly

const ConditionalContent = ({ children }) => {
  const groupAssignment = useStore(isGroupAssignment);
  console.log('ConditionalContent rendering, isGroupAssignment:', groupAssignment);
  if (groupAssignment) {
    return <>{children}</>;
  }
  return null;
};

export default ConditionalContent;
