// lib/printUtils.js
export const printDiv = (divId) => {
  const element = document.getElementById(divId);
  if (!element) {
    console.error(`Element with id ${divId} not found`);
    return;
  }

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }

  // Get all styles from the current document
  const getStyles = () => {
    const styleElements = [];
    const styleSheets = document.styleSheets;
    
    for (const sheet of styleSheets) {
      try {
        const rules = sheet.cssRules;
        for (let i = 0; i < rules.length; i++) {
          styleElements.push(rules[i].cssText);
        }
      } catch (e) {
        // Ignore errors from cross-origin stylesheets
      }
    }
    
    return styleElements.join('');
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice</title>
        <style>
          ${getStyles()}
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .invoice-content {
              box-shadow: none !important;
            }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  // Optional: Focus on the print window and trigger print
  printWindow.focus();
  printWindow.print();
  // printWindow.close();
};