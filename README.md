# knex-json-where

Add filters on query Knex through a JSON object.

Great for use with REST or GraphQL APIs that need filtering on requests

### Install

```
npm i knex-json-where@latest --save
```

### Import

```
import { jsonWhere } from 'knex-json-where';
```

## Example

### JSON filters

```typescript
const json = {
   id: {
      _eq: 1 // id equal 1
   }
   _or: {
      name: {
         _lk: "ana%" // or name like ana
      },
      created_at: {
         _gte: "2019-01-01 00:00:00" // and created_at is greater or equal to 2019-01-01 00:00:00
      },
      _or: {
         name: {
            _lk: "luis%" // or name like luis
         },
         created_at: {
            _gte: "2019-02-01 00:00:00" // and created_at is greater or equal to 2019-02-01 00:00:00
         }
      }
   }
}
```

### Knex query (Exemple 1)

```typescript
const query = knex('users')
   .select('id', 'name')
   .where(jsonWhere(json));
```

### Result
```sql
select id, name 
from users 
where (id = 1 or (name like 'ana%' and created_at >= '2019-01-01 00:00:00' or (name like 'luis%' and created_at >= '2019-02-01 00:00:00')))
```

## Operators

|Operator|Description|
|--- |--- |
|_eq|equals|
|_neq|not equals|
|_gt|greater than|
|_gte|greater than or equal to|
|_lt|less than|
|_lte|less than or equal to|
|_in|in|
|_nin|not in|
|_lk|like|
|_nlk|not like|
|_or|or|

## Additional Information

- The operator `_or` does not be used with others operators, only be used in fields level.

- If you are using PostgreSQL, consider using `citext` instead of `text`, because `citext` is not case sensitive when using the `_lk` or `_nlk` operator
