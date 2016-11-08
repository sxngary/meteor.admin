import {Contents} from "../contents.js";

Meteor.methods({
    insertContents: function (form, contentId) {
        if (contentId) {
            if (form["translation"] && form["translation"].length < 2) {
                var item = Contents.findOne({ _id: contentId });
                if (form["translation"].length && item && item.translation && item.translation.length) {
                    var newTranslation = true;
                    for (var i = 0; i < item.translation.length; i++) {
                        if (item.translation[i].lang === form["translation"][0]["lang"]) {
                            item.translation[i].text = form["translation"][0]["text"];
                            newTranslation = false;
                            break;
                        }
                    }
                    if (newTranslation === true) {
                        item.translation.push(form["translation"][0]);
                    }
                    form["translation"] = item.translation;
                } else if (item && item.translation && item.translation.length) {
                    form["translation"] = item.translation;
                }
            }
            return Contents.update({ _id: contentId }, { $set: form });
        } else {
            return Contents.insert(form);
        }

    },
})