import fs from 'fs';
['events', 'gallery', 'records'].forEach(d => {
  try {
    const content = fs.readFileSync(`api/${d}/[[...slug]].js`, 'utf-8');
    fs.writeFileSync(`api/${d}/index.js`, content);
    fs.unlinkSync(`api/${d}/[[...slug]].js`);
  } catch(e) {
    console.log(e);
  }
});
