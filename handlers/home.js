const url = require('url');
const fs = require('fs');
const path = require('path');
const cats = require('../data/cats.json');

module.exports = (req, res) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname == '/' && req.method == 'GET') {

        let filePath = path.normalize(
            path.join(__dirname, '../views/home/index.html')
        );

        const index = fs.createReadStream(filePath);

        index.on('data', (data) => {

            let modifiedCats = cats.map((cat) => `<li>
            <img src="${path.join('./content/images/' + cat.image)}" alt="${cat.name}">
            <h3>${cat.name}</h3>
            <p><span>Breed: </span>${cat.breed}</p>
            <p><span>Description: </span>${cat.description}</p>
            <ul class="buttons">
            <li class="btn edit"><a href="/cats-edit/${cat.id}">Change Info</a></li>
            <li class="btn delete"><a href="/cats-find-new-home/${cat.id}">New Home</a></li>
        </ul>
        </li>`);

        let modifieData = data.toString().replace('{{cats}}', modifiedCats);

        res.write(modifieData);
        });

        index.on('end', () => res.end());

        index.on('err', (err) => {
            console.log(err);
        });

    } else {
        return true;
    }
}