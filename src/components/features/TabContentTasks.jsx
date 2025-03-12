import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { planDetailsStore, isGroupAssignment } from '../../store';
import { marked } from 'marked';
import { useStore } from '@nanostores/preact';
import SwitchToCalendarViewButton from '../ui/SwitchToCalendarViewButton';
import { formatDate } from '../../utils'; // Import the common function


const TabContentTasks = () => {
  const [tasks, setTasks] = useState([]);
  const groupAssignment = useStore(isGroupAssignment);
  const details = useStore(planDetailsStore);

  useEffect(() => {
    console.log('TabContentTasks useEffect called');
    if (details && details.tasks) {
      const updatedTasks = details.tasks.map((task) => {
        const displayTime = task.roundedDays > 1 ? `${task.roundedDays} days` : task.roundedDays === 1 ? '1 day' : 'less than one day';
        return {
          ...task,
          roundedDays: task.roundedDays,
          displayTime: displayTime,
          processedContent: processTaskContent(task.rendered.html, groupAssignment),
        };
      });
      setTasks([...updatedTasks]);
    }
  }, [details, groupAssignment]);

  const processTaskContent = (html, isGroupAssignment) => {
    if (!html) return '';

    // Parse the entire HTML string with marked *first*
    const parsedHtml = marked.parse(html);

    const conditionalContentRegex = /\[\[conditional\]\](.*?)\[\[\/conditional\]\]/gs;
    const parts = parsedHtml.split(conditionalContentRegex);

    let finalContent = '';
    parts.forEach((part, index) => {
      if (index % 2 === 1) {
        // This is the conditional content
        if (isGroupAssignment) {
          finalContent += part.trim();
        }
      } else {
        //remove the conditional tag names if they are there.
        finalContent += part.replace(/\[\[conditional\]\]|\[\[\/conditional\]\]/g, '').trim();
      }
    });
    // Remove empty <p></p> or <div></div> elements
    finalContent = finalContent.replace(/<p>\s*<\/p>/g, '').replace(/<div>\s*<\/div>/g, '');
    return finalContent;
  };




  return (
    <div>
      <div class="hscroll">
        <table className="table-striped" id="table-steps-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Complete by</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={index}>
                <td>
                  <h3>{`${index + 1}. ${task.data.description || 'Untitled Task'}`}</h3>
                  <div dangerouslySetInnerHTML={{ __html: task.processedContent }} />
                </td>
                <td>{formatDate(task.endDate)}</td>
                <td>{task.displayTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default TabContentTasks;
