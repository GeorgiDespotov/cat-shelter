const url = require('url');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const breeds = require('../data/breeds.json');
const cats = require('../data/cats.json');
const formidable = require('formidable');
const mv = require('mv');

module.exports = (req, res) => {

    const pathname = url.parse(req.url).pathname;
    let filePath;

    if (pathname == '/cats/add-cat' && req.method == 'GET') {

        filePath = path.normalize(
            path.join(__dirname, '../views/addCat.html')
        );

        const index = fs.createReadStream(filePath);

        index.on('data', (data) => {
            const catBreedPlaceholder = breeds.map(breed => `<option value="${breed}" id="breed">${breed}</option>`);
            const modifyData = data.toString().replace('{{catBreeds}}', catBreedPlaceholder);
            res.write(modifyData);
        });

        index.on('end', () => { res.end() });

        index.on('error', (err) => {
            console.log(err);
        });
       
    } else if (pathname == '/cats/add-cat' && req.method == 'POST') {

        const form = new formidable.IncomingForm(options);

        form.parse(req, (err, fields, files) => {
            if (err) {
                throw err;
            }
            const oldPath = files.upload.path;
            const newPath = path.normalize(path.join('./content/images', files.upload.name));

            mv(oldPath, newPath, err => {
                if (err) {
                    throw err;
                }
                console.log('Files was uploaded successfully');
                console.log(fields);
            });

            fs.readFile('./data/cats.json', 'utf-8', (err, data) => {
                if (err) {
                    throw err;
                }

                const allCats = JSON.parse(data);
                allCats.push({ id: cats.length + 1, ...fields, image: files.upload.name });
                const json = JSON.stringify(allCats);
                fs.writeFile('./data/cats.json', json, () => {
                });
                    res.writeHead(301, { location: '/' });
                    res.end();
            });
        });
    } else if (pathname == '/cats/add-breed' && req.method == 'GET') {

        filePath = path.normalize(
            path.join(__dirname, '../views/addBreed.html')
        );
     

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(err);

                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                res.write('Error not Found');
                res.end();
                return;
            }
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write(data);
            res.end();
        });

    } else if (pathname == '/cats/add-breed' && req.method == 'POST') {

        let formData = '';
        req.on('data', data => {
            formData += data;
        });

        console.log(formData);

        req.on('end', () => {
            const body = qs.parse(formData);

            fs.readFile('./data/breeds.json', (err, data) => {
                if (err) {
                    throw err;
                }
                let breeds = JSON.parse(data);
                breeds.push(body.breed);
                const json = JSON.stringify(breeds);


                fs.writeFile('./data/breeds.json', json, (err) => {
                    if (err) {
                        throw err;
                    }

                    console.log(`${body.breed} was successfully added to the breeds`);
                })
            })
        });
        res.writeHead(301, { 'location': '/' });
        res.end();

    } else if (pathname.includes('/cats-find-new-home') && req.method == 'GET') {

        filePath = path.normalize(
            path.join(__dirname, '../views/catShelter.html')
        );

        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.log(err);
            }
            let currentCats = JSON.parse(data);
            let catId = req.url.split('/')[2];

            currentCats = currentCats.filter((cat) => cat.id !== catId);
            let json = JSON.stringify(currentCats);

            fs.writeFile('./data/cats.json', json, 'utf-8', () => {
                res.writeHead(301, '/');
                res.end();
            });
        });

    } else {
        return true;
    }
}