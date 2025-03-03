import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { planDetailsStore, isGroupAssignment } from '../store'; // Import isGroupAssignment
import ConditionalContent from './ConditionalContent';
import { marked } from 'marked'; // Import marked
import { useStore } from '@nanostores/preact'; // Import useStore

const TabContentTasks = () => {
  const [tasks, setTasks] = useState([]);
  const groupAssignment = useStore(isGroupAssignment); //add this line to get the updated store
  const details = useStore(planDetailsStore);

  useEffect(() => {
    console.log('TabContentTasks useEffect called');
    if (details && details.tasks) {
      const updatedTasks = details.tasks.map((task) => {
        const displayTime = task.roundedDays > 1 ? `${task.roundedDays} days` : task.roundedDays === 1 ? '1 day' : 'less than one day';
        // Create a new object to ensure React detects the change
        return {
          ...task,
          roundedDays: task.roundedDays, //add this line
          displayTime: displayTime, //update this value
          processedContent: processTaskContent(task.rendered.html),
        };
      });
      // Create a new array to ensure React detects the change
      setTasks([...updatedTasks]);
    }
  }, [details]);

  // Process the task content, replacing the <ConditionalContent> with rendered content
  const processTaskContent = (html) => {
    if (!html) return [];

    const conditionalContentRegex = /\[\[conditional\]\](.*?)\[\[\/conditional\]\]/gs;
    const parts = html.split(conditionalContentRegex);
    return parts
      .map((part, index) => {
        if (index % 2 !== 0) {
          return {
            type: 'conditional',
            content: part.trim(),
          };
        } else if (part.trim() !== '') {
          return {
            type: 'regular',
            content: part.replace(/\[\[conditional\]\]|\[\[\/conditional\]\]/g, '').trim(),
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const renderContentParts = (parts) => {
    return parts.map((part, index) => {
      if (part.type === 'conditional') {
        return (
          <ConditionalContent key={`conditional-${index}`}>
            {marked
              .parse(part.content)
              .split('\n')
              .map((item, index) => {
                if (item.trim() === '') return null;
                return <p key={index} dangerouslySetInnerHTML={{ __html: item }} />;
              })}
          </ConditionalContent>
        );
      } else {
        return <div key={`regular-${index}`} dangerouslySetInnerHTML={{ __html: marked.parse(part.content) }} />;
      }
    });
  };

  const switchToCalendarView = () => {
    const calendarTab = document.querySelector('#calendar-tab');
    const navTabs = document.querySelector('.nav-tabs');
    if (calendarTab) {
      calendarTab.click();
      if (navTabs) {
        navTabs.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
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
                  {renderContentParts(task.processedContent)}
                </td>
                <td>{formatDate(task.endDate)}</td>
                <td>{task.displayTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="btn-group-nav">
        <a href="#planner-details" className="btn btn-default" role="button">
          Refine plan
        </a>
        <button className="btn btn-default" type="button" onClick={switchToCalendarView}>
          Calendar view
        </button>
      </div>
    </div>
  );
};

export default TabContentTasks;
