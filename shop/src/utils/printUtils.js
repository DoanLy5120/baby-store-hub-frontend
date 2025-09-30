// src/utils/printUtils.js

import React from 'react';
import ReactDOMServer from 'react-dom/server';

export const printComponentInNewWindow = (Component) => {
    const componentHtml = ReactDOMServer.renderToString(Component);
    const printWindow = window.open('', '_blank', 'height=800,width=800');
    if (printWindow) {
        printWindow.document.write('<html><head><title>In Phiếu Giao Hàng</title>');
        printWindow.document.write('<style>body { margin: 0; padding: 0; } </style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(componentHtml);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus(); 
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    } else {
        alert('Vui lòng cho phép mở pop-up để in hóa đơn!');
    }
};