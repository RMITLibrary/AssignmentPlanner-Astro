// src/components/ExportToCalendarButton.jsx
import { h } from 'preact';

const ExportToCalendarButton = ({ handleExportModal }) => {
  return (
    <button className="btn btn-cal" data-bs-toggle="modal" data-bs-target="#exportModal" onClick={handleExportModal} type="button">
      Export plan to calendar<span className="visually-hidden"> (opens modal window)</span>
    </button>
  );
};

export default ExportToCalendarButton;
