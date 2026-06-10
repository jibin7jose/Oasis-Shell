const fs = require('fs');
let f = fs.readFileSync('src/components/panels/SystemPanel.tsx', 'utf8');
f = f.replace(/<option className=" bg-slate-900\\/g, '<option className="bg-slate-900" ');
fs.writeFileSync('src/components/panels/SystemPanel.tsx', f);
