const fs = require('fs');
const path = require('path');

function dataUSers(){

  return new Promise((resolve, reject) => {
    const filePath = path.resolve(__dirname, 'user.txt');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Erro ao ler o arquivo:', err);
        reject(err);
        return;
      }

      const lines = data.split('\n');
      const usersArray = lines.map((line, index) => {
        const parts = line.split(','); // Divide a linha em partes usando a vírgula como separador
        const name = parts[0] ? parts[0].trim() : ''; // Obtém o nome (trim só se existir)
        const id = parts[1] ? parts[1].trim() : index + 1; // Obtém o id (trim só se existir)

        return { name: name, id: id };
      });

      resolve(usersArray);
    });
  });

}
module.exports = dataUSers;