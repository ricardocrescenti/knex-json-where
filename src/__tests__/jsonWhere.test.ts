import { jsonWhere } from '../index';
import Knex = require('knex');

test('Knex Teste Query', () => {
  const knex = Knex({
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'your_database_user',
      password: 'your_database_password',
      database: 'myapp_test',
    },
  });

  let where: any = {
    id: {
      _eq: 1,
      _neq: 1,
      _gt: 1,
      _gte: 1,
      _lt: 1,
      _lte: 1,
      _in: [1, 2],
      _nin: [1, 2],
    },
    _or: {
      name: {
        _lk: 'ana%',
        _nlk: 'ana%',
      },
    },
  };

  let query: Knex.QueryBuilder = knex('users').where(jsonWhere(where));

  expect(query.toQuery()).toBe(
    'select * from "users" where (("id" = 1 and not "id" = 1 and "id" > 1 and "id" >= 1 and "id" < 1 and "id" <= 1 and "id" in (1, 2) and "id" not in (1, 2)) or (("name" like \'ana%\' and "name" not like \'ana%\')))',
  );
});
