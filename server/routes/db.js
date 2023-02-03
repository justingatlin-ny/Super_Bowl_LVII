import '@babel/polyfill';
import mysql from 'mysql2/promise';

export default (socketInstance) => {
    const tablePrefix = process.env.NODE_ENV === 'development' ? 'develop_' : '';
    const tableSuffix = `_${process.env.DB_YEAR}`;

    const db_params = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PW,
        database: process.env.DB,
        port: process.env.DB_PORT,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }

    const getInitials = (fullname = '') => {
        const nameArr = fullname.split(/\s+/, 2);
        return nameArr.map(segment => {
            return segment.slice(0, 1);
        }).join('');
    }

    const getVettedResults = (list) => {
        return list.reduce((acc, square) => {
            acc.push({
                game_id: square.game_id,
                space_id: square.space_id,
                id: square.id,
                fullname: escape(square.fullname),
                initials: getInitials(square.fullname)
            });
            return acc;
        }, []);
    }

    const pool = mysql.createPool(db_params);


    const transactionsTable = `${tablePrefix}transactions${tableSuffix}`;

    const usersTable = `${tablePrefix}users${tableSuffix}`

    const lockQuery = `LOCK TABLES ${transactionsTable} WRITE`;
    const unlockQuery = `UNLOCK TABLES`;

    const getSquaresQuery = `
        SELECT
            ${transactionsTable}.space_id
            , ${transactionsTable}.game_id
            , ${usersTable}.id
            , ${usersTable}.fullname
        FROM ${transactionsTable}
        LEFT JOIN ${usersTable} ON ${transactionsTable}.user_id = ${usersTable}.amazon_id
    `;

    const getOrAddUser = async (req, res, next) => {
        const { user_id } = res.locals;

        if (!user_id) return next();

        const query = `
            INSERT INTO ${usersTable} (amazon_id)
            SELECT * FROM (SELECT '${user_id}') AS tmp
            WHERE NOT EXISTS (
                SELECT amazon_id FROM ${usersTable} WHERE amazon_id = '${user_id}'
            ) LIMIT 1;
        `

        pool.query(query)
            .then(async () => {
                return await pool.query(`SELECT id FROM ${usersTable} WHERE amazon_id = '${user_id}'`);
            })
            .then(([results]) => {
                res.locals.id = results[0].id;
            })
            .catch(err => {
                console.error(err && err.message || err);
            })
            .finally(() => {
                next();
            });
    }

    const insertTransaction = async (req, res, next) => {

        const { coordsList, orderReferenceId } = req.body;

        // const coordsList = ["col-5-row-1", "col-5-row-2", "col-5-row-3"];

        const { uuid } = req.signedCookies;

        const { user_id } = res.locals;

        const game_id = process.env.CURRENT_GAME_ID;
        const transaction_id = orderReferenceId
        const records = coordsList.reduce((acc, coord) => {
            const record = [game_id, coord, uuid, user_id, transaction_id];
            acc.push(record);
            return acc;
        }, []);

        const insertQuery = `
            INSERT IGNORE INTO ${transactionsTable} 
                (game_id, space_id, uuid, user_id, transaction_id)
                VALUES ?
            `;

        const checkTable = `
            SELECT space_id from ${transactionsTable}
            WHERE game_id = ? AND space_id IN (?)
        `;

        pool.getConnection()
            .then(async connection => {
                connection.query('START TRANSACTION');
                res.locals.connection = connection;
            })

            .then(async () => {
                const [isUsed] = await res.locals.connection.query(checkTable, [game_id, coordsList]);

                const duplicates = isUsed.map(space => space.space_id);

                if (isUsed && isUsed.length) throw { status: 409, duplicates };

                const [results] = await res.locals.connection.query(
                    insertQuery,
                    [records]
                );
                return results;
            })
            .then(async () => {
                const [warnings] = await res.locals.connection.query('SHOW WARNINGS');

                const filteredWarnings = warnings.reduce((acc, itm) => {
                    const { Level, Code, Message } = itm;
                    const re = /Duplicate entry '(col-\d+-row-\d+)'/;
                    const coords = re.exec(Message);
                    if (coords && coords[1]) {
                        acc.push(coords[1]);
                    }
                    return acc;
                }, []);

                if (warnings.length) {
                    throw { warnings, duplicates: filteredWarnings };
                }

                next();
            })
            .catch(async err => {
                let status = 400;

                console.error('Database Error Message:', err && err.message || err);
                let message = 'An error occured.  Please try again.';

                if (err.duplicates && err.duplicates.length) {
                    status = 409;
                    message = err.duplicates;
                }
                console.error('rolling back');
                res.locals.connection.query('ROLLBACK');
                res.locals.connection.query(unlockQuery);
                res.status(status).send(JSON.stringify(message));
            });
    }

    const getPurchasedSquares = async (req, res, next) => {

        let connection;
        return pool.getConnection()
            .then(async (conn) => {
                connection = conn;
                return await connection.query(getSquaresQuery);
            })
            .then(result => {

                const [results, fields] = result;
                const squaresList = getVettedResults(results);
                res.locals.initialSquares = JSON.stringify(squaresList);
            }).catch(err => {
                console.error('.catch: getPurchasedSquares: ', err.message);
            })
            .finally(() => {
                connection.release();
                next();
            });
    }

    const commitTransaction = async (req, res, next) => {
        const { connection, userInfo, user_id } = res.locals;

        console.log('Committing', userInfo, user_id);

        await connection.query('COMMIT');
        await connection.query(unlockQuery);

        const updateName = `
            UPDATE ${usersTable}
            SET
                fullname  = IF(fullname IS NULL, ?, fullname)
            WHERE amazon_id = ?
        `;

        await connection.query(updateName, [userInfo.name, user_id])
            .then(response => {
                const [results] = response;
                // console.log('UPDATE', JSON.stringify(results));
                return results;
            })
            .catch(err => {
                console.error('.catch err', err);
            });

        // await connection.query(`SELECT name, amazon_id, id FROM ${usersTable} WHERE amazon_id = ?`, [user_id])
        //     .then(response => {
        //         const [ results ] = response;
        //         console.log('SELECT', JSON.stringify(results));
        //     })
        //     .catch(err => {
        //         console.error('.catch err', err);
        //     });

        const [results] = await connection.query(getSquaresQuery);
        res.locals.vettedResults = getVettedResults(results);
        connection.release();
        // res.sendStatus(200);
        next();
    }

    const emitSquares = (req, res) => {
        try {
            res.locals.route = 'emit';
            socketInstance().emit('squares', JSON.stringify(res.locals.vettedResults));
        } catch (err) {
            console.error(err);
        }
        res.sendStatus(200)
    }

    return { getOrAddUser, insertTransaction, getPurchasedSquares, commitTransaction, emitSquares };
}

/*
CREATE TABLE `SuperBowlDev`.`develop_users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fullname` VARCHAR(45) NOT NULL,
  `amazon_id` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `amazon_id_UNIQUE` (`amazon_id` ASC) VISIBLE);
*/

/*
CREATE TABLE `SuperBowlDev`.`develop_transactions` (
  `space_id` VARCHAR(45) NOT NULL,
  `game_id` VARCHAR(45) NOT NULL,
  `transaction_id` VARCHAR(45) NOT NULL,
  `uuid` VARCHAR(45) NOT NULL,
  `user_id` VARCHAR(45) NOT NULL,
  `timestamp` DATETIME NOT NULL);
  */

/*
ALTER TABLE `SuperBowlDev`.`develop_users` 
ADD COLUMN `timestamp` DATETIME NOT NULL AFTER `amazon_id`;

ALTER TABLE `SuperBowlDev`.`develop_transactions` 
RENAME TO  `SuperBowlDev`.`develop_transactions_2023` ;


*/

