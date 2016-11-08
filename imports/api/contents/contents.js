import { Mongo } from 'meteor/mongo';

class ContentsCollection extends Mongo.Collection {
}

export const Contents = new ContentsCollection('contents');