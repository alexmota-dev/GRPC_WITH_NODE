const fs = require('fs');
const path = require('path');

function dataUSers(){

  const filePath = path.resolve(__dirname, 'user.txt'); // Caminho absoluto para o arquivo user.txt

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }

    const itemsArray = data.split('\n').map(item => item.trim());
    return itemsArray;
  });

}

module.exports = dataUSers