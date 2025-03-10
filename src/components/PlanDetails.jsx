import { useState, useEffect, useRef } from 'preact/hooks';
import { planDetailsStore, isOpenResults, activeTabStore } from '../store';
import TabContentTasks from './TabContentTasks';
import TabContentCalendar from './TabContentCalendar';
import clock from '../assets/clock.svg'; // Import the clock image

const PlanDetails = () => {
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
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'tab_click',
        formType: 'assignment_planner',
        tabName: tab,
      });
      console.log('tab_click dataLayer pushed');
    }
    activeTabStore.set(tab);
  };

  const formatTaskBody = (html) => {
    // Replace <a> elements with their text content and capture URLs for resources
    const resourceLinks = [];
    const withLinks = html.replace(/<a href="(.*?)">(.*?)<\/a>/g, (_, link, text) => {
      resourceLinks.push(`[${text}](${link})`);
      return text;
    });

    // Remove all remaining HTML tags and insert newlines
    const plainText = withLinks.replace(/<[^>]+>/g, '').replace(/<\/li>/g, '\n');

    // Add resource links at the end
    if (resourceLinks.length > 0) {
      return `${plainText.trim()}\n\nResources:\n${resourceLinks.join('\n')}`;
    }

    return plainText.trim();
  };

  const exportToCalendar = (viewType) => {
    // Data Layer Push (BEFORE export to calendar)
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'calendar_export',
        formType: 'assignment_planner',
        calendarViewType: viewType,
      });
      console.log('calendar_export dataLayer pushed');
    }

    const tasks = details.tasks;
    console.log('Tasks:', tasks);

    if (!Array.isArray(tasks) || tasks.length === 0) {
      console.warn('No tasks available for export.');
      return;
    }

    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\n';

    tasks.forEach((task) => {
      try {
        if (!task.startDate || !task.endDate) {
          console.warn(`Missing start or end date for task: ${task.data.description}`);
          return;
        }

        const taskStartDate = new Date(`${task.startDate}T09:00:00`);
        const taskEndDate = new Date(`${task.endDate}T21:00:00`);

        if (isNaN(taskStartDate.getTime()) || isNaN(taskEndDate.getTime())) {
          console.warn(`Invalid dates for task: ${task.data.description}`);
          return;
        }

        const taskStart = taskStartDate.toISOString().replace(/-/g, '').replace(/:/g, '').split('.')[0] + 'Z';
        const taskEnd = taskEndDate.toISOString().replace(/-/g, '').replace(/:/g, '').split('.')[0] + 'Z';
        const formattedBody = formatTaskBody(task.body);

        let icsEvent = `BEGIN:VEVENT\nSUMMARY:[Assignment Planner] ${task.data.description}\nDESCRIPTION:${formattedBody.replace(/\n/g, '\\n')}\n`;

        if (viewType === 'Multiday') {
          icsEvent += `DTSTART:${taskStart}\nDTEND:${taskEnd}\n`;
        } else if (viewType === 'Milestone') {
          icsEvent += `DTSTART:${taskStart}\nDTEND:${taskStart}\n`;
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
    const nameToUse = assignmentName ? assignmentName : assignmentType; // if assignmetnName, use it, otherwise assignment type.
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
    exportToCalendar(selectedViewType);
    closeModal(event);
  };

  const handleRadioChange = (event) => {
    setSelectedViewType(event.target.value);
  };

   const scrollToRefinePlan = () => {
     // Data Layer Push for Switch to Refine plan
     if (typeof window !== 'undefined' && window.dataLayer) {
       window.dataLayer.push({
         event: 'refine_click',
         formType: 'assignment_planner',
         viewSwitchName: 'refine-plan',
       });
       console.log('refine_click - refine-plan dataLayer pushed');
     }
   };

  const handlePrintPDF = () => {
    // Data Layer Push for PDF Print
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'pdf_print',
        formType: 'assignment_planner',
      });
      console.log('pdf_print dataLayer pushed');
    }

    window.print(); // Trigger the print dialog
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
              <div className="mb-3">
                <fieldset className="form-group">
                  <legend className="visually-hidden">Calendar export options:</legend>
                  <label htmlFor="calendar-setup-options" className="form-label">
                    Calendar export options:
                  </label>
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
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={closeModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleExport}>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
      {showSpecialConsideration && (
        <div className="container pt-0 pb-5 px-0">
          <div className="row">
            <div className="col-md-12">
              <div className="card assignment-card p-3">
                <div className="row">
                  <div className="col-md-2 pb-3 pb-md-0 d-flex align-items-center justify-content-center">
                    <img src={clock.src} alt="Clock Icon" className="img-fluid" />
                  </div>
                  <div className="col-md-10">
                    <div className="card-body  p-0 ">
                      <p className="card-text">If something unexpected affects your ability to submit an assignment on time, you might qualify for an extension.</p>
                      <p className="card-text">
                        Check out RMIT's{' '}
                        <a href="https://www.rmit.edu.au/students/student-essentials/assessment-and-results/special-consideration" className="text-primary">
                          Special consideration
                        </a>{' '}
                        page to learn more.
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
          <strong>Start date:</strong> <span>{formatDate(details.startDate)}</span>
        </p>
        <p>
          <strong>End date:</strong> <span>{formatDate(details.endDate)}</span>
        </p>
      </div>
      <p className="deadline">
        You have{' '}
        <strong>
          <span>{formatDays(calculateDaysBetween(details.startDate, details.endDate))}</span>
        </strong>{' '}
        to complete your assignment.
      </p>

      <ul className="nav nav-tabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button className={`nav-link ${activeTab === 'task' ? 'active' : ''}`} id="task-tab" role="tab" onClick={() => changeTab('task')}>
            Task view
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`} id="calendar-tab" role="tab" onClick={() => changeTab('calendar')}>
            Calendar view
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
        <button className="btn btn-pdf" onClick={handlePrintPDF} type="button">
          Save to PDF
        </button>
        <button className="btn btn-cal" data-bs-toggle="modal" data-bs-target="#exportModal" onClick={handleExportModal} type="button">
          Export plan to calendar
        </button>
      </div>
      <div className="btn-group-reset">
        <a href="#planner-details" className="btn btn-default" role="button" tabIndex="0" onClick={scrollToRefinePlan}>
          Refine plan
        </a>
      </div>
    </section>
  );

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function calculateDaysBetween(start, end) {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const differenceInTime = endDate - startDate;
    return Math.ceil(differenceInTime / (1000 * 3600 * 24)) + 1;
  }

  function formatDays(days) {
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }
};

export default PlanDetails;
