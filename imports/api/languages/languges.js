import { Mongo } from 'meteor/mongo';

class LanguagesCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    const result = super.insert(ourDoc, callback);
    return result;
  }
  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }
  remove(selector) {
    const result = super.remove(selector);
    return result;
  }
}

export const Languages = new LanguagesCollection('Posts');

Languages.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});


Languages.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

