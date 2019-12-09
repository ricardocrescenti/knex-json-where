import Knex = require('knex');

export type QueryBuilderCallback = (query: Knex.QueryBuilder) => Knex.QueryBuilder;
type OperatorCallback = (query: Knex.QueryBuilder, columnName: string, value: any) => Knex.QueryBuilder;

export function jsonWhere(where: any): QueryBuilderCallback {
  return (query: Knex.QueryBuilder): Knex.QueryBuilder => {
    if (!query || !where) {
      return query;
    }
    return applyJsonWhere(query, where);
  };
}

/**
 * Apply conditions on query
 * @param query Knex query reference that will be applied conditions
 * @param where Json object with conditions
 */
function applyJsonWhere(query: Knex.QueryBuilder, where: any): Knex.QueryBuilder {
  if (!query || !where) {
    return query;
  }

  /// Get the fields that will apply the conditions, at this level, only fields or the
  /// `_or` operator is allowed
  Object.keys(where).forEach((key: string) => {
    const operator = whereOperators.get(key);
    if (operator) {
      if (key !== '_or') {
        throw new Error(`Operator '${key}' is invalid at the current json level, only the '_or' operator is allowed.`);
      }

      /// called `_or` operator
      operator(query, '', where[key]);
    } else {
      /// check if an invalid operator has been entered
      if (key.startsWith('_')) {
        throw new Error(`Operator '${key}' is invalid.`);
      }

      /// add `and` on `where`
      query = query.andWhere((query: Knex.QueryBuilder) => {
        /// maps field operators that will be added to the query
        const columnName = key;
        Object.keys(where[columnName]).forEach((key: string) => {
          /// get operator of condition
          const operator = whereOperators.get(key);
          if (!operator) {
            throw new Error('At this level of json, only operators are allowed.');
          }

          /// called the operator function
          query = operator(query, columnName, where[columnName][key]);
        });
        return query;
      });
    }
  });
  return query;
}

/** Operators used to add conditions to the query */
const whereOperators: Map<string, OperatorCallback> = new Map()
  .set('_eq', (query: Knex.QueryBuilder, columnName: string, value: any) => query.where(columnName, value)) /// equal
  .set('_neq', (query: Knex.QueryBuilder, columnName: string, value: any) => query.whereNot(columnName, value)) /// not equal
  .set('_gt', (query: Knex.QueryBuilder, columnName: string, value: any) => query.where(columnName, '>', value)) /// greater
  .set('_gte', (query: Knex.QueryBuilder, columnName: string, value: any) => query.where(columnName, '>=', value)) /// greater or equal
  .set('_lt', (query: Knex.QueryBuilder, columnName: string, value: any) => query.where(columnName, '<', value)) /// less than
  .set('_lte', (query: Knex.QueryBuilder, columnName: string, value: any) => query.where(columnName, '<=', value)) /// less than or equal
  .set('_in', (query: Knex.QueryBuilder, columnName: string, value: any) => query.whereIn(columnName, value)) /// in
  .set('_nin', (query: Knex.QueryBuilder, columnName: string, value: any) => query.whereNotIn(columnName, value)) /// not in
  .set('_lk', (query: Knex.QueryBuilder, columnName: string, value: any) => query.where(columnName, 'like', `${value}`)) /// like
  .set('_nlk', (query: Knex.QueryBuilder, columnName: string, value: any) => query.where(columnName, 'not like', `${value}`)) /// not like
  .set('_or', (query: Knex.QueryBuilder, columnName: string, value: any) => query.orWhere((query: Knex.QueryBuilder) => (query = applyJsonWhere(query, value)))); /// or
