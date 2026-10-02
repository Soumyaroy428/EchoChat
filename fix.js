const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = [...walk('client/components'), ...walk('client/lib')];
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    const original = content;
    
    // Replace `http://localhost:5000 with `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}
    content = content.split('`http://localhost:5000').join('`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:5000\'}');
    
    // Replace "http://localhost:5000/api/some" with `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/some`
    content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:5000\'}$1`');

    if (original !== content) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Updated', f);
    }
});
