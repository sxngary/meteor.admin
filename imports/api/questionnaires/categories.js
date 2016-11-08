import { Mongo } from 'meteor/mongo';

class CategoriesCollection extends Mongo.Collection {
}

export const Categories = new CategoriesCollection('categories');