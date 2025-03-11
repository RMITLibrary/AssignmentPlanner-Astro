// src/components/SaveToPdfButton.jsx
import { h } from 'preact';
import { fireDataLayerEvent } from '../utils'; // Import the common function

const SaveToPdfButton = () => {
  const handlePrintPDF = () => {
    fireDataLayerEvent({
      event: 'pdf_print',
      formType: 'assignment_planner',
    });
    window.print(); // Trigger the print dialog
  };

  return (
    <button className="btn btn-pdf" onClick={handlePrintPDF} type="button">
      Save to PDF
    </button>
  );
};

export default SaveToPdfButton;
