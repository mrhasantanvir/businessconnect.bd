const fs = require('fs');
const path = 'e:/all project/businessconnect.bd/src/app/merchant/staff/StaffManagementClient.tsx';
let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

// Remove line 542 (index 541)
if (lines[541].includes(')}')) {
    lines.splice(541, 1);
    console.log('Removed extra bracket at 542');
}

let found = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<p className="text-[10px] text-blue-600 font-medium leading-relaxed">')) {
        let start = i + 1;
        for (let j = start; j < lines.length; j++) {
            if (lines[j].includes(');')) {
                let end = j + 2;
                lines.splice(start, end - start, 
                    '                        Authorizing a device will activate a permanent license. The first device costs <strong>৳300</strong>, and each additional device costs <strong>৳250</strong>. Billing starts immediately upon authorization.',
                    '                    </p>',
                    '                 </div>',
                    '              </div>',
                    '           </div>',
                    '        </div>',
                    '      )}',
                    '    </div>',
                    '  );',
                    '}'
                );
                found = true;
                break;
            }
        }
        if (found) break;
    }
}

if (found) {
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Fixed modal closing');
} else {
    console.log('Could not find stats section');
}
