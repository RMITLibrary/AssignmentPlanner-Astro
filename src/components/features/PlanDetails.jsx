import { useState, useEffect, useRef } from 'preact/hooks';
import { planDetailsStore, isOpenResults, activeTabStore, isGroupAssignment } from '../../store';
import TabContentTasks from './TabContentTasks';
import TabContentCalendar from './TabContentCalendar';
import clock from '../../assets/clock.svg'; // Import the clock image
import { formatDateShort, calculateDaysBetween, formatDays, fireDataLayerEvent, scrollToView } from '../../utils'; // Import the common functions
import SaveToPdfButton from '../ui/SaveToPdfButton'; // Import the new component
import ExportToCalendarButton from '../ui/ExportToCalendarButton'; // Import the new component
import RefinePlanButton from '../ui/RefinePlanButton'; // Import the new component
import ShareLinkButton from '../ui/ShareLinkButton'; // Import the shareable link button
import SwitchToTaskViewButton from '../ui/SwitchToTaskViewButton';
import SwitchToCalendarViewButton from '../ui/SwitchToCalendarViewButton';
import Clock from '../ui/Clock'
import { useStore } from '@nanostores/preact';


const PlanDetails = () => {
  const groupAssignment = useStore(isGroupAssignment);

  const [details, setDetails] = useState(planDetailsStore.get());
  const [isOpen, setIsOpen] = useState(isOpenResults.get());
  const [activeTab, setActiveTab] = useState(activeTabStore.get());
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedViewType, setSelectedViewType] = useState('Multiday');
  const [showSpecialConsideration, setShowSpecialConsideration] = useState(false);
  const [dialog, setDialog] = useState(null); // New state for the dialog object


  // Refs for focus management
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const firstFocusableElement = useRef(null);

  useEffect(() => {
    const unsubscribeDetails = planDetailsStore.subscribe((newDetails) => {
      setDetails(newDetails);
      if (newDetails.weeksToDisplay) {
        console.log('Weeks to display updated:', newDetails.weeksToDisplay);
      }
      // Check if the start and end date are less than 2 weeks apart
      const startDate = new Date(newDetails.startDate);
      const endDate = new Date(newDetails.endDate);
      const differenceInTime = endDate.getTime() - startDate.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

      // if start and end date less than 1 week
      setShowSpecialConsideration(differenceInDays <= 7);
    });
    const unsubscribeOpen = isOpenResults.subscribe(setIsOpen);
    const unsubscribeActiveTab = activeTabStore.subscribe(setActiveTab);

    console.log('PlanDetails component mounted.');

    return () => {
      unsubscribeDetails();
      unsubscribeOpen();
      unsubscribeActiveTab();
      console.log('PlanDetails component unmounted.');
    };
  }, []);

  const changeTab = (tab) => {
    // Data Layer Push for Tab Clicks
    fireDataLayerEvent({
      event: 'tab_click',
      formType: 'assignment_planner',
      tabName: tab,
    });
    activeTabStore.set(tab);
  };

  const formatTaskBody = (text, isGroupAssignment = false) => {
    // Pre-process to handle conditional content before any other formatting
    let processedText = text;

    // Handle conditional content tags based on whether it's a group assignment
    if (isGroupAssignment) {
      processedText = processedText.replace(/\[\[conditional\]\](.*?)\[\[\/conditional\]\]/gs, '$1');
    } else {
      processedText = processedText.replace(/\[\[conditional\]\](.*?)\[\[\/conditional\]\]/gs, '');
    }

    // Remove any lingering conditional tags
    processedText = processedText.replace(/\[\[\/?conditional\]\]/gs, '');

    // Convert HTML links to Markdown format but keep them inline
    processedText = processedText.replace(/<a href="(.*?)">(.*?)<\/a>/g, (_, link, text) => {
      return `${text} (${link})`;
    });

    // Keep Markdown links as they are (already in the right format)
    // No need to extract them to a separate section

    // Handle both HTML and Markdown bullet points
    processedText = processedText
      // Convert HTML list items to bullet points
      .replace(/<li>(.*?)<\/li>/g, '• $1')
      // Convert Markdown dashes to bullet points
      .replace(/^-\s+(.*?)$/gm, '• $1')
      // Remove other HTML tags
      .replace(/<[^>]+>/g, '')
      // Clean up spaces before bullets
      .replace(/^\s*•/gm, '•');

    // Clean up spacing and format bullet points consistently
    processedText = processedText
      // Normalize bullet point spacing - ensure they start at beginning of line
      .replace(/\n\s+•/g, '\n•')
      // Ensure bullet points are followed by exactly one space
      .replace(/•\s+/g, '• ')
      // Ensure only one newline after each bullet point
      .replace(/^(• .+)(\n+)/gm, '$1\n')
      // Make sure consecutive bullet points have no extra newlines between them
      .replace(/(• .+\n)\n+(• .+)/g, '$1$2');

    // Add a blank line after the last bullet point - identify sections
    processedText = processedText
      // Add an extra blank line after the last bullet point in a series
      .replace(/(^• .+\n)(?!• )/gm, '$1\n');

    // Final cleanup of newlines - ensure at most two consecutive newlines anywhere
    processedText = processedText
      .replace(/\n{3,}/g, '\n\n');

    return processedText.trim();
  };

  const exportToCalendar = (viewType) => {
    // Data Layer Push (BEFORE export to calendar)
    fireDataLayerEvent({
      event: 'calendar_export',
      formType: 'assignment_planner',
      calendarViewType: viewType,
    });

    const tasks = details.tasks;
    console.log('Tasks:', tasks);

    if (!Array.isArray(tasks) || tasks.length === 0) {
      console.warn('No tasks available for export.');
      return;
    }

    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Assignment Planner//RMIT//EN\n';

    // Sort tasks first if they have numerical ordering
    tasks.forEach((task, index) => {
      try {
        if (!task.startDate || !task.endDate) {
          console.warn(`Missing start or end date for task: ${task.data.description}`);
          return;
        }

        console.log(`task: ${task.data.description}`);

        // Convert to full-day event format by using DATE format instead of DATETIME
        // Remove time component for full-day events
        const taskStartDate = task.startDate;
        const taskEndDate = task.endDate;

        // For full-day events, end date needs to be the day after the actual end
        // (per iCalendar spec for all-day events)
        const endDateObj = new Date(taskEndDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        const adjustedEndDate = endDateObj.toISOString().split('T')[0].replace(/-/g, '');

        // Format dates for all-day events (date only, no time)
        const taskStart = taskStartDate.replace(/-/g, '');
        const taskEnd = adjustedEndDate;

        // Format the body content, handling group conditional content directly in the formatter
        let formattedBody = formatTaskBody(task.body, groupAssignment);

        // Get assignment name to use in summary
        const assignmentTitle = details.assignmentName || details.name || 'Assignment';

        // Add task number and assignment name to the summary
        const taskNumber = index + 1;

        // Replace newlines in formatted body with proper ICS line breaks
        // We need to escape each individual newline character for proper ICS format
        let icsFormattedBody = formattedBody.replace(/\n/g, '\\n');

        let icsEvent = `BEGIN:VEVENT\nSUMMARY:[${assignmentTitle}] ${taskNumber}. ${task.data.description}\nDESCRIPTION:${icsFormattedBody}\n`;

        if (viewType === 'Multiday') {
          // For full-day events we use this format
          icsEvent += `DTSTART;VALUE=DATE:${taskStart}\nDTEND;VALUE=DATE:${taskEnd}\n`;
        } else if (viewType === 'Milestone') {
          // For milestone, we make it a single day - need to use the day after as end date
          const nextDay = new Date(taskStartDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayStr = nextDay.toISOString().split('T')[0].replace(/-/g, '');
          icsEvent += `DTSTART;VALUE=DATE:${taskStart}\nDTEND;VALUE=DATE:${nextDayStr}\n`;
        }

        icsEvent += 'END:VEVENT\n';
        icsContent += icsEvent;
      } catch (error) {
        console.error('Error processing task:', task, error);
      }
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Generate the filename based on assignment details
    const assignmentName = details.assignmentName
      ? details.assignmentName
          .replace(/[^a-zA-Z0-9-]/g, '-')
          .replace(/--+/g, '-')
          .trim('-')
      : null;
    const assignmentType = details.name
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .replace(/--+/g, '-')
      .trim('-');
    const nameToUse = assignmentName ? assignmentName : assignmentType;
    const startDate = details.startDate.replace(/-/g, '');
    const endDate = details.endDate.replace(/-/g, '');
    const filename = `${nameToUse}-${startDate}-${endDate}.ics`;

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`Exported to calendar with filename: ${filename}`);
  };

  const handleExportModal = (event) => {
    setShowExportModal(true);
    previousActiveElement.current = document.activeElement; // Store the previously active element

    // Initialize the ARIA dialog when the modal opens
    const newDialog = new aria.Dialog('exportModal', previousActiveElement.current, firstFocusableElement.current);
    setDialog(newDialog); // Store the dialog object in state
    event.preventDefault();
  };

  const closeModal = (event) => {
    setShowExportModal(false);

    //close the ARIA modal too, by calling the close method.
    if (dialog) {
      dialog.close();
      setDialog(null); // remove it from the state.
    }
    previousActiveElement.current = null; // Clear the reference
    event.preventDefault();
  };

  const handleExport = (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    exportToCalendar(selectedViewType);
    //closeModal(event);
  };

  const handleRadioChange = (event) => {
    setSelectedViewType(event.target.value);
  };

  if (!isOpen || !details.projectID) return null;

  return (
    <section id="plan-detail" className="pt-4">
      {/* Modal */}
      <div className={`modal ${showExportModal ? 'show d-block' : 'fade'}`} id="exportModal" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="exportModalLabel">
        <div className="modal-dialog modal-dialog-centered" role="document" ref={modalRef}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title mt-0 mb-0" id="exportModalLabel">
                Export to calendar file (.ics)
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={closeModal}></button>
            </div>
            <div className="modal-body">
              {/* Form Group */}
              <form onSubmit={handleExport}>
                <div className="mb-3">
                  <fieldset className="form-group" role="radiogroup">
                    <legend className="h5 mt-0">Calendar export options:</legend>

                    {/* Radio Group */}
                    <div className="form-check d-flex align-items-top mb-3">
                      <input className="form-check-input" type="radio" name="calendar-setup-options" id="multiday-radio" value="Multiday" checked={selectedViewType === 'Multiday'} onChange={handleRadioChange} ref={firstFocusableElement} />
                      <label className="form-check-label" htmlFor="multiday-radio">
                        <strong>Multiday view</strong>
                        <br />
                        Each assignment step will span across several days in your calendar.
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-top">
                      <input className="form-check-input" type="radio" name="calendar-setup-options" id="milestone-radio" value="Milestone" checked={selectedViewType === 'Milestone'} onChange={handleRadioChange} />
                      <label className="form-check-label" htmlFor="milestone-radio">
                        <strong>Milestone view</strong>
                        <br />
                        Each assignment step will only appear on the day that the task begins in your calendar.
                      </label>
                    </div>
                  </fieldset>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Export
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {showSpecialConsideration && (
        <div className="container pt-0 pb-5 px-0 special-consideration">
          <div className="row">
            <div className="col-md-12">
              <div className="card assignment-card p-3">
                <div className="row">
                  <div className="col-md-2 pb-3 pb-md-0 d-flex align-items-center justify-content-center">
                    <Clock />
                  </div>
                  <div className="col-md-10">
                    <div className="card-body  p-0 ">
                      <p className="card-text">If something unexpected affects your ability to submit an assignment on time, you might qualify for an extension.</p>
                      <p className="card-text">
                        Check out RMIT's <a href="https://www.rmit.edu.au/students/student-essentials/assessment-and-results/special-consideration">Special consideration</a> page to learn more.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <h2>
        Assignment plan: <span>{details.assignmentName || details.name || 'N/A'}</span>
      </h2>
      <div className="plan-dates">
        <p>
          <strong>Start date:</strong> <span>{formatDateShort(details.startDate)}</span>
        </p>
        <p>
          <strong>End date:</strong> <span>{formatDateShort(details.endDate)}</span>
        </p>
      </div>
      <p className="deadline">
        You have{' '}
        <strong>
          <span>{formatDays(calculateDaysBetween(details.startDate, details.endDate) + 1)}</span>
        </strong>{' '}
        to complete your assignment.
      </p>

      <ul className="nav nav-tabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button className={`nav-link ${activeTab === 'task' ? 'active' : ''}`} id="task-tab" role="tab" onClick={() => changeTab('task')} aria-label={`Switch to Task view`}>
            Task <span>&nbsp;view</span>
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`} id="calendar-tab" role="tab" onClick={() => changeTab('calendar')} aria-label={`Switch to Calendar view`}>
            Calendar <span>&nbsp;view</span>
          </button>
        </li>
      </ul>

      <div className="tab-content">
        <div className={`tab-pane fade ${activeTab === 'task' ? 'show active' : ''}`} id="task-tab-pane" role="tabpanel" aria-labelledby="task-tab" tabIndex="0">
          <TabContentTasks />
        </div>
        {activeTab === 'calendar' && (
          <div className={`tab-pane fade show active page-break`} id="calendar-tab-pane" role="tabpanel" aria-labelledby="calendar-tab" tabIndex="0">
            <TabContentCalendar />
          </div>
        )}
      </div>

      <div className="btn-group-tools">
        {activeTab === 'calendar' && <SwitchToTaskViewButton />}
        {activeTab === 'task' && <SwitchToCalendarViewButton />}
        <SaveToPdfButton />
        <ExportToCalendarButton handleExportModal={handleExportModal} />
      </div>

      <div className="btn-group-tools">
        <RefinePlanButton />
        <ShareLinkButton planDetails={details} isGroup={groupAssignment} />
      </div>
    </section>
  );
};

export default PlanDetails;
