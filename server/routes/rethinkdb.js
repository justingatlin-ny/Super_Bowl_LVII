import r from 'rethinkdb';

let connection = null;

r.connect({
    host: 'localhost',
    port: 28015,
    db: 'super-bowl-2022',
    table: 'transactions'
}).then(conn => {
    const table = conn.
}).catch(err => {

});