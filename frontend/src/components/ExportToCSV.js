import React from 'react';
import { FaDownload } from 'react-icons/fa'; 


const ExportToCSV = ({ data, filename = 'export.csv' }) => {
  const handleExport = () => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data) => {
    if (!data?.length) return '';

    const headers = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(row => 
      Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    return headers + rows;
  };

  return (
    <button className="export-csv-button" onClick={handleExport}>
      <FaDownload size={24} />
    </button>
  );
};

export default ExportToCSV;
