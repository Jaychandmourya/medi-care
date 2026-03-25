// CSV Export Utility using Blob API
export const exportToCSV = (data: Record<string, unknown>[], filename: string, headers?: string[]) => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  let csvContent = ''

  // Add headers if provided
  if (headers) {
    csvContent += headers.join(',') + '\n'
  } else {
    // Use keys from first object as headers
    const keys = Object.keys(data[0])
    csvContent += keys.join(',') + '\n'
  }

  // Add data rows
  data.forEach(item => {
    const values = Object.values(item).map(value => {
      // Handle values that might contain commas or quotes
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
    csvContent += values.join(',') + '\n'
  })

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  URL.revokeObjectURL(url)
}

// Print utility for reports
export const printReport = () => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank')

  if (!printWindow) {
    alert('Please allow popups to print the report')
    return
  }

  // Get the report content
  const reportContent = document.getElementById('admin-reports-container')

  if (!reportContent) {
    alert('Report content not found')
    return
  }

  // Clone the content to avoid modifying the original
  const clonedContent = reportContent.cloneNode(true) as HTMLElement

  // Remove buttons and interactive elements from the cloned content
  const buttonsToRemove = clonedContent.querySelectorAll('button')
  buttonsToRemove.forEach(button => button.remove())

  // Remove hover states and transitions for print
  const allElements = clonedContent.querySelectorAll('*')
  allElements.forEach(element => {
    const htmlElement = element as HTMLElement
    htmlElement.style.transition = 'none'
    htmlElement.style.animation = 'none'
  })

  // Create the print document with comprehensive print styles
  const printDocument = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Admin Reports - MediCare HMS</title>
        <style>
          @page {
            margin: 0.5in;
            size: A4;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            line-height: 1.2;
            color: #333;
            margin: 0;
            padding: 10px;
            background: white !important;
          }

          /* Hide everything except our content */
          body > *:not(.print-content) {
            display: none !important;
          }

          .print-content {
            display: block !important;
          }

          .print-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }

          .print-header h1 {
            margin: 0;
            font-size: 20px;
            color: #1f2937;
            font-weight: bold;
          }

          .print-header .date {
            margin-top: 5px;
            font-size: 12px;
            color: #666;
          }

          .print-summary {
            margin-bottom: 20px;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }

          .summary-card {
            border: 1px solid #ccc;
            padding: 8px;
            border-radius: 4px;
            background: #f9f9f9;
            page-break-inside: avoid;
          }

          .summary-label {
            font-size: 9px;
            color: #666;
            margin-bottom: 3px;
            font-weight: 500;
          }

          .summary-value {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
          }

          .chart-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .chart-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #1f2937;
            border-bottom: 1px solid #ddd;
            padding-bottom: 3px;
          }

          .chart-description {
            font-size: 9px;
            color: #666;
            margin-bottom: 10px;
          }

          .chart-container {
            margin-bottom: 15px;
            min-height: 200px;
            page-break-inside: avoid;
          }

          /* Recharts specific print styles */
          .recharts-wrapper {
            page-break-inside: avoid;
          }

          .recharts-surface {
            page-break-inside: avoid;
          }

          svg {
            page-break-inside: avoid;
            max-width: 100% !important;
            height: auto !important;
          }

          .drug-recall-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 20px;
          }

          .recall-card {
            border: 1px solid #fca5a5;
            padding: 6px;
            border-radius: 4px;
            background: #fef2f2;
            page-break-inside: avoid;
          }

          .recall-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3px;
          }

          .recall-count {
            font-size: 12px;
            font-weight: bold;
            color: #dc2626;
          }

          .recall-class {
            font-size: 9px;
            font-weight: 500;
            color: #333;
          }

          .recall-date {
            font-size: 7px;
            color: #666;
          }

          .error-section {
            display: none !important;
          }

          /* Ensure proper page breaks */
          .chart-section:nth-child(even) {
            page-break-before: auto;
          }

          .chart-section:nth-child(odd) {
            page-break-before: auto;
          }

          /* Responsive adjustments for print */
          @media print {
            body {
              margin: 0;
              padding: 5px;
              font-size: 9px;
            }

            .print-header h1 {
              font-size: 18px;
            }

            .summary-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }

            .drug-recall-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .chart-section {
              margin-bottom: 20px;
              page-break-inside: avoid;
            }

            /* Force background colors */
            .summary-card,
            .recall-card {
              background: #f9f9f9 !important;
              border: 1px solid #ccc !important;
            }

            .recall-card {
              background: #fef2f2 !important;
              border: 1px solid #fca5a5 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-content">
          <div class="print-header">
            <h1>Admin Reports - MediCare HMS</h1>
            <div class="date">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
          </div>

          ${clonedContent.innerHTML}
        </div>
      </body>
    </html>
  `

  printWindow.document.write(printDocument)
  printWindow.document.close()

  // Wait for the content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }
}

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date for display
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format percentage for display
export const formatPercentage = (value: number): string => {
  return `${value}%`
}
