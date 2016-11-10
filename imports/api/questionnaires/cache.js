import { Mongo } from 'meteor/mongo';

class CacheCollection extends Mongo.Collection {
}

export const Cache = new CacheCollection('cache');