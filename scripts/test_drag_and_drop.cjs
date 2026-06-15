const fs = require('fs');
const path = require('path');

const resultDir = path.join(__dirname, '..', 'test_results');
if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir, { recursive: true });
}

const reportPath = path.join(resultDir, 'drag_and_drop_result.txt');
let reportContent = "=========================================\n";
reportContent += " OASIS DRAG-AND-DROP AUTOMATED TEST REPORT\n";
reportContent += "=========================================\n";
reportContent += `Time: ${new Date().toLocaleString()}\n\n`;

// The exact logic used in TerminalPanel.tsx
function simulateDrop(paths, currentInput) {
    if (paths && paths.length > 0) {
        const formattedPaths = paths.map(p => p.includes(' ') ? `"${p}"` : p).join(' ');
        return currentInput ? `${currentInput} ${formattedPaths} ` : `${formattedPaths} `;
    }
    return currentInput;
}

const tests = [
    {
        name: "Single File (No Spaces)",
        paths: ["C:\\Users\\jibin\\file.txt"],
        currentInput: "",
        expected: "C:\\Users\\jibin\\file.txt "
    },
    {
        name: "Single File (With Spaces)",
        paths: ["C:\\Users\\jibin\\Desktop\\my new file.jpg"],
        currentInput: "open",
        expected: "open \"C:\\Users\\jibin\\Desktop\\my new file.jpg\" "
    },
    {
        name: "Multiple Files",
        paths: ["C:\\file1.txt", "C:\\folder A\\file2.txt"],
        currentInput: "cp",
        expected: "cp C:\\file1.txt \"C:\\folder A\\file2.txt\" "
    }
];

let allPassed = true;

tests.forEach((t, i) => {
    reportContent += `[TEST ${i+1}] ${t.name}\n`;
    reportContent += `  - Input Payload: ${JSON.stringify(t.paths)}\n`;
    reportContent += `  - Existing Terminal Input: "${t.currentInput}"\n`;
    
    const result = simulateDrop(t.paths, t.currentInput);
    
    if (result === t.expected) {
        reportContent += `  -> SUCCESS: Terminal input correctly updated to: [${result}]\n\n`;
    } else {
        reportContent += `  -> FAILED: Expected [${t.expected}], got [${result}]\n\n`;
        allPassed = false;
    }
});

reportContent += "=========================================\n";
reportContent += allPassed ? " STATUS: ALL TESTS PASSED\n" : " STATUS: SOME TESTS FAILED\n";
reportContent += "=========================================\n";

fs.writeFileSync(reportPath, reportContent);
console.log(`Drag-and-Drop tests complete. Results saved to ${reportPath}`);
