import { FlowRouter } from 'meteor/kadira:flow-router';
import { Questionnaires } from '/imports/api/questionnaires/questionnaires';
import { Categories } from '/imports/api/questionnaires/categories';
import { Questions } from '/imports/api/questionnaires/questions';

Template.questionForm.onCreated(function () {
    Meteor.subscribe('questionCategory');
    Meteor.subscribe('allCategory');

    var qId = FlowRouter.getParam("id");
    //console.log("qId:", qId);
    Session.set('questionIsLoaded', undefined);
    Session.set('formSubmitted', undefined);

    Meteor.call("questionData", qId, function (error, questionData) {
        //console.log("questionData:", questionData);
        if (questionData.questionSession != undefined) {
            Session.set("questionSession", questionData.questionSession);
            Session.set("responseRR", questionData.questionSession.riskRatio);
            var catName = questionData.catName;
            var questionSet = questionData.questionSet;
            if (questionSet != undefined) {
                Session.set("questionSets", questionSet);
                var questionDef = questionData.questionDef;
                var ansValue = questionData.responseAnswer;
                var questionSet = {
                    questionId: qId,
                    categoryName: catName,
                    category: questionData.questionSession.category,
                    key_string: questionData.questionSession.key_string,
                    questionType: questionData.questionSession.question_type,
                    gender: questionData.questionSession.gender,
                    questionDef: questionDef,
                    resetOptionsIndex: questionData.questionSession.resetOptionsIndex
                };

                if (ansValue != undefined) {
                    Session.set("responseAnswer", ansValue);
                    if (questionData.questionSession.dependency.length > 0) {
                        var qDependency = questionData.questionSession.dependency[0].dependencyQuestion;
                        var answerSet = questionData.answerSet;
                        if (answerSet.length > 0) {
                            Session.set("answerData", answerSet);
                            questionSet['depQuestion'] = qDependency;
                            questionSet['depAnswer'] = questionData.questionSession.dependency[0].dependencyAnswer;
                        }
                    }
                }
                else {
                    Session.set("responseAnswer", '');
                    Session.set("answerData", '');
                }
                Session.set('questionSet', questionSet);
                Session.set('questionIsLoaded', true);
            }
        }
    });
});

Template.questionForm.onRendered(function () {
    //handleResize();
    //$('INPUT.minicolors').minicolors();
    $('ul.tabs').tabs();

    // add custom validators
    window.ParsleyValidator.addValidator('keystring',
        function (value, requirement) {
            var pattern = /^[a-zA-Z0-9\_]+$/;
            if (!pattern.test(value)) {
                return false;
            } else {
                return true;
            }
        }, 2
    )
    .addMessage('en', 'keystring', 'Please type alphabets, numbers and underscore only.');

    window.ParsleyValidator.addValidator('keystring_uniq',
        function (value, requirement) {
            if (Session.get('questionSet')) {
                var questionSet = Session.get('questionSession');
                var questionId = questionSet._id;
            } else {
                var questionId = null;
            }
            //console.log('questionid:', questionId);
            var questions = Questions.find({ 
                key_string: value,
                $or: [{deleted: '0'}, {deleted: {$exists: false} }]
            }).fetch();
            //console.log('questions:', questions);

            if (questions.length) {
                if (questions[0]._id === questionId) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        }, 1
    )
    .addMessage('en', 'keystring_uniq', 'Already in use. Please enter unique variable name only.');

    Tracker.autorun(function () {
        var questionIsLoaded = Session.get('questionIsLoaded');
        //console.log(questionIsLoaded,'questionIsLoaded');
        if (questionIsLoaded) {
            //-------initialize modal---------//
            $("#questionPopup").modal({
                ready: function() {
                    //$('textarea#questionHelper').froalaEditor();
                }
            });
            $('#questionPopup').modal("open", { dismissible: false });
            if (Session.get("viaNewQues")) {
                Meteor.setTimeout(function() {
                    $('ul.tabs').tabs({select_tab: "secondQuestionTab"});
                    Session.set("viaNewQues", undefined);
                }, 400);
            }

            $('#questionAdd').parsley({
                trigger: 'keyup'
            });
            $('#questionUpdate').parsley({
                trigger: 'keyup'
            });

        }
    });
});

Template.questionForm.onDestroyed(function () {
    Session.set('questionIsLoaded', undefined);
    Session.set('formSubmitted', undefined);
    Session.set('deleteAnswer', undefined);
    Session.set('viaQuesForm', true);

    Session.set('questionValue', '');
    Session.set('questionSession', '');
    Session.set('responseAnswer', '');
    Session.set("questionSets", "");
    Session.set("answerData", "");
    Session.set("questionSet", "");
});

quesformTitleDeps = new Tracker.Dependency();
var questionFormHelpers = {
    dataLoaded: function () {
        return Session.get('questionIsLoaded');
    },
    formSubmitted: function () {
        return Session.get('formSubmitted');
    },
    intializeselect: function (elem) {
        //initializeSelectBox();
        /*console.log('materialize select');
        console.log('element:', elem);*/
        if (!elem) { return; }
        // materialize select
        Meteor.setTimeout(function () {
            $(elem).material_select();
        }, 500);
    },
    quesHaveOpts: function (quesType) {
        //console.log('quesType:', quesType);
        if (quesType == 4 || quesType == 5 || quesType == 8) {
            return true;
        } else {
            return false;
        }
    },
    dataElementType: function () {
        var questionSess = Session.get("questionSession");
        var dataElem = DataElements.findOne({ _id: questionSess.question_type, type: { $in: ['cholesterol', 'alcohol', 'blood_pressure', 'blood_glucose'] } });
        if (dataElem) {
            return dataElem.type;
        }
    },
    equalOrVal: function (val, arg1, arg2) {
        if (val === arg1 || val === arg2) {
            return true;
        } else {
            return false;
        }
    },
    displayCategory: function () {
        var category = Categories.find({
            $and: [
                { $or: [{ parent: '0' }, { parent: { $exists: false } }] },
                { $or: [{ deleted: '0' }, { deleted: { $exists: false } }] },
            ]
        }).fetch();
        if (category.length > 0) {
            var categoryData = [];
            for (var i = 0; i < category.length; i++) {
                var subcategoryData = [];
                var subCategory = Categories.find({
                    parent: category[i]._id,
                    $or: [{ deleted: '0' }, { deleted: { $exists: false } }]
                }).fetch();
                if (subCategory.length > 0) {
                    for (var k = 0; k < subCategory.length; k++) {
                        subcategoryData.push({
                            subCatId: subCategory[k]._id,
                            subcolor: subCategory[k].cat_color,
                            subtitle: subCategory[k].cat_name
                        });
                    }
                }
                categoryData.push({
                    catId: category[i]._id,
                    color: category[i].cat_color,
                    title: category[i].cat_name,
                    subcat: subcategoryData
                });
            }

            // materialize select
            /*Meteor.setTimeout(function(){
               $("#questionCategory").material_select();
            }, 500);*/
            return categoryData;
        }
    },
    isSelect: function (val1, val2) {
        if (val1 == val2) {
            //initializeSelectBox();
            return 'selected';
        }
    },
    questionSession: function () {
        if (Session.get("questionSession")) {
            return true;
        }
    },
    responseAnswer: function () {
        if (Session.get('responseAnswer')) {
            //initializeSelectBox();
            return Session.get('responseAnswer');
        }
    },
    questionVal: function () {
        if (Session.get('questionValue')) {
            return Session.get('questionValue');
        }
        if (Session.get("questionSession")) {
            var questionSess = Session.get("questionSession");
            Meteor.subscribe('categoryData', questionSess.category);
            var categoryContId = Categories.find({
                _id: questionSess.category
            }).fetch();
            let catName = null;
            if (categoryContId.length) {
                catName = categoryContId[0].cat_name
            } 
            questionVal = {
                questionDef: questionSess.question,
                questionCat: catName,
                type: questionSess.question_type,
                helper: questionSess.helper
            };
            Session.set("questionValue", questionVal);
            /*console.log('set questionValue');
            console.log('questionVal:', questionVal);*/
            return Session.get("questionValue");
        }
    },
    questionType: function () {
        return [
            { "value": 5, "title": "Radio" },
            { "value": 8, "title": "Multiple Select" },
        ];
    },
    equalVal: function (v1, v2) {
        return v1 == v2;
    },
    questionSet: function () {
        return Session.get("questionSets");
    },
    answerSet: function () {
        if (Session.get("answerData")) {
            return Session.get("answerData");
        }
    },
    checkGender: function (v1) {
        if (v1 == 1) {
            var sex = 'male';
        } else if (v1 == 2) {
            var sex = 'female';
        }
        return sex;
    },
    dotted: function (v1) {
        var dot = '';
        for (var i = 0; i < v1; i++) {
            dot = dot + '-- ';
        }
        return dot;
    },
    questionUpdation: function () {
        if (Session.get("questionSet")) {
            return Session.get("questionSet");
        }
    },
    checkedDependentAnswer: function (val) {
        var sessArr = Session.get('questionSet');
        if (sessArr) {
            var tmpArr = sessArr.depAnswer;
            for (var i = 0; i < tmpArr.length; i++) {
                if (tmpArr[i].answers == val) {
                    return 'selected';
                }
            }
        }
    },
    editQuesType: function () {
        return [
            { "value": 5, "title": "Radio" },
            { "value": 8, "title": "Multiple Select" },
        ];
    },
    canEditQuesType: function () {
        if (Session.get("questionSet")) {
            var questionSet = Session.get("questionSet");
            if (questionSet.questionType === "4" || questionSet.questionType === "5") {
                return true;
            }
        } else {
            return true;
        }
    },
    getText: function (text, elem, rrIndex) {
        if (!text) {
            return;
        }

        let ret = "";
        if (typeof text === "string") {
            ret = text;
        } else {

            var lang = "en";
            //console.log('getText.lang:', lang);

            if (lang === "en") {
                ret = text["en"];
            } else {
                var checkLang = _.where(text["translation"], { lang: lang });
                if (checkLang.length) {
                    var index = _.indexOf(_.pluck(text["translation"], "lang"), lang);
                    ret = text["translation"][index]["text"];
                }
            }

            if (typeof ret === "undefined") {
                ret = "";
            }

        }
        switch (elem) {
            //case "quesHelper":
            //    $('#questionHelper').froalaEditor('html.set', ret);
            //    break;
            case "rrResponse":
                Meteor.setTimeout(function () {
                    $('#rrResponse_' + rrIndex).material_select();
                }, 500);
                break;
        }

        quesformTitleDeps.depend();
        return ret;
    },
    selLang: function () {
        var lang = "en";
        return lang;
    }
};

Template.questionForm.helpers(questionFormHelpers);

//resize the screen
function handleResize() {
    var headerHeight = $('.navbar-fixed').outerHeight();
    var footerHeight = $('.page-footer').outerHeight();
    var difference = headerHeight + footerHeight;
    var h = $(window).height() - headerHeight;
    var ch = $(window).height() - difference;
    $('.sidebar').css({
        'height': h + 'px'
    });
    $('.content-right').css({
        'min-height': ch + 'px'
    });
    $('.active-section').css({
        'min-height': ch + 'px'
    });
    $('.content-right.fixed-sidebarbody').css({
        'height': ch + 'px',
        'min-height': 'inherit'
    });
}
