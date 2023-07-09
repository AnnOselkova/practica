const http = require('http');
const fs = require('fs');


class UserServer {
  constructor() {
    this.server = http.createServer(this.handleRequest.bind(this)); //создаем сервер с функцией обратного вызова
    this.users = JSON.parse(fs.readFileSync('users.json', 'utf8')); // передаем данные из файла в users
  }

  handleRequest(req, res) { // обрабатывает запросы
    // Разбираем URL запроса
    const [name, userId] = req.url.split('/').filter(Boolean);

    switch (req.method) {
      case 'GET':
        // Получение информации о пользователе
        if (name === 'users' && userId) {
          const user = this.getId(userId);
          if (user) { // если пользователь найден
            res.writeHead({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user));
          } else { // если пользоватьель не найден
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('User not found');
          }
        } else{
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Invalid endpoint');
        }
        break;
      case 'POST':
        // Создание пользователя
        if (name === 'users') {// создает нового пользователя
          this.parseRequestBody(req, (data) => {
            const newUser = { id: Date.now().toString(), ...data };
            this.createUser(newUser);
            res.writeHead({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser));
          });
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Invalid endpoint');
        }
        break;
      case 'PUT':
        // Изменение данных о пользователе
        if (name === 'users' && userId) {
          this.parseRequestBody(req, (data) => {
            const user = this.getId(userId);
            if (user) {
              const update = { ...user, ...data };
              this.updateUser(update);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(update));
            } else {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('User not found');
            }
          });
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Invalid endpoint');
        }
        break;
      case 'DELETE':
        // Удаление пользователя
        if (name === 'users' && userId) {
          const user = this.getId(userId);
          if (user) {
            this.deleteUser(userId);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('User deleted');
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('User not found');
          }
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Invalid endpoint');
        }
        break;
        default:
          res.writeHead(405, { 'Content-Type': 'text/plain' });
          res.end('Method not allowed');
          break;
      }
  }

  parseBody(req, callback) {
    let body = '';
    req.on('data', (a) => {
      body += a;
    });
    req.on('end', () => {
      callback(JSON.parse(body));
    });
  }

  getId(userId) {
    return this.users.findIndex((user) => user.id === userId);
  }

  createUser(user) {
    this.users.push(user);
    this.saveUsers();
  }

  updateUser(updatedUser) {
    const index = this.users.findIndex((user) => user.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = updatedUser;
      this.saveUsers();
    }
  }

  deleteUser(userId) {
    const index = this.users.findIndex((user) => user.id === userId);
    if (index !== -1) {
      this.users.splice(index, 1);
      this.saveUsers();
    }
  }

  saveUsers() {
    fs.writeFileSync('users.json', JSON.stringify(this.users), 'utf8');
  }

  start(port) {
    this.server.listen(port);
    console.log(`Server listening on port ${port}`);
  }
}
const server = new UserServer();
server.start(8000);


