import { Questionnaires } from '/imports/api/questionnaires/questionnaires';
import { Categories } from '/imports/api/questionnaires/categories';
import { Questions } from '/imports/api/questionnaires/questions';

import './main.html';


Template.questionnaire.onCreated(function () {
    Session.set('categoryData', undefined);
    Session.set('quesTabs', { 'questionnaires': true });

    Meteor.subscribe('getContents');
    Meteor.subscribe('getAllQuestionnaire');
    Meteor.subscribe('questionCategory');
    Meteor.subscribe('allCategory');
});

/*
 *Template Rendering for the Questionnaire sections
 */
Template.questionnaire.onRendered(function () {
    //handleResize();
    //$('INPUT.minicolors').minicolors();
    tabbing();

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
            var questions = Questions.find({ key_string: value, deleted: '0' }).fetch();
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

    $('#questionnaireCatAdd').parsley({
        trigger: 'keyup'
    });
    $('#questionnaireAdd').parsley({
        trigger: 'keyup'
    });
    $('#questionAdd').parsley({
        trigger: 'keyup'
    });
    $('#questionUpdate').parsley({
        trigger: 'keyup'
    });
    // $('textarea#helper').editable({
    //     key: '1D4B3B3D9A2C4A4G3G3F3J3==',
    //     inlineMode: false,
    //     minHeight: 150,
    //     maxHeight: 300,
    //    imageUploadURL: '/api/upload'
    //})// Catch image removal from the editor.
    //.on('editable.afterRemoveImage', function (e, editor, $img) {
    //    Meteor.call('removeFroalaImage', $img.attr('src'), function(err, res) {
    //        if(err) console.log('image not removed');
    //        console.log("image removed!");
    //    })
    //});
    //$('textarea#questionHelper').editable({
    //     key: '1D4B3B3D9A2C4A4G3G3F3J3==',
    //     inlineMode: false,
    //     minHeight: 150,
    //     maxHeight: 300,
    //    imageUploadURL: '/api/upload'
    //})// Catch image removal from the editor.
    //.on('editable.afterRemoveImage', function (e, editor, $img) {
    //    Meteor.call('removeFroalaImage', $img.attr('src'), function(err, res) {
    //        if(err) console.log('image not removed');
    //        console.log("image removed!");
    //    })
    //});

    Session.set("questionnaireLoaded", false);

    if (Session.get('viaQuesForm')) {
        Meteor.setTimeout(function () {
            Session.set('viaQuesForm', undefined);
            $("#qQuestionTab").trigger("click");
        }, 500);
    }
});

Template.questionnaire.onDestroyed(function () {
    Session.set('questionnaireId', undefined);
})


Template.questionnaire.helpers({
    getText: function (text, elem) {
        if (!text) {
            return;
        }

        if (typeof text === "string") {
            return text;
        }

        var lang = Router.current().params['hash'];
        if (!lang) {
            lang = 'en';
        }
        //console.log('getText.lang:', lang);

        var ret = "";
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
        //switch (elem) {
        //    case "summary":
        //        $('#questionnaireSummary').editable("setHTML", ret);
        //        break;
        //    case "helper":
        //        $('#questionnairehelper').editable("setHTML", ret);
        //        break;
        //    case "catHelper":
        //        //console.log("ret:", ret)
        //        $('textarea#helper').editable("setHTML", ret);
        //        break;
        //}

        quesformTitleDeps.depend();
        return ret;
    },
    selLang: function () {
        var lang = Router.current().params['hash'];
        if (!lang) {
            lang = 'en';
        }
        return lang;
    },
    /**
     * check if a question is dropdown, checkbox or radio
     */
    intializeselect: function () {
        initializeSelectBox();
    },
    quesHaveOpts: function (quesType) {
        if (quesType == 4 || quesType == 5 || quesType == 8) {
            return true;
        } else {
            return false;
        }
    },
    equalOrVal: function (val, arg1, arg2) {
        if (val === arg1 || val === arg2) {
            return true;
        } else {
            return false;
        }
    },
    programList: function () {
        var programList = Programs.find({ 'deleted': '0' }).fetch();
        return programList;
    },

    contentText: function (id) {
        var content = Contents.find({ _id: id }).fetch();
        if (content && content.length) {
            return content[0].en;
        }
    },
    /*
     * Success Message on Category creation
     */
    categoryList: function () {
        var category = Categories.find({
            $and: [
                { $or: [{ parent: '0' }, { parent: { $exists: false } }] },
                { $or: [{ deleted: '0' }, { deleted: { $exists: false } }] },
            ]
        }).fetch();
        if (category.length > 0) {
            var categoryData = [];
            for (var i = 0; i < category.length; i++) {
                categoryData.push({
                    _id: category[i]._id,
                    cat_name: category[i].cat_name
                });
            }
            return categoryData;
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
                var subCategories = Categories.find({
                    parent: category[i]._id,
                    $or: [{ deleted: '0' }, { deleted: { $exists: false } }]
                }).fetch();
                if (subCategories.length > 0) {
                    for (var k = 0; k < subCategories.length; k++) {
                        subcategoryData.push({
                            subCatId: subCategories[k]._id,
                            subcolor: subCategories[k].cat_color,
                            subtitle: subCategories[k].cat_name
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
            console.log("categoryData:", categoryData);
            return categoryData;
        }
    },
    questionnaireCatValue: function () {
        var categoryDetail = Session.get('categoryDetail');
        return categoryDetail;
    },
    sessionCheck: function () {
        var categoryDetail = Session.get('categoryDetail');
        if (categoryDetail) {
            return true;
        } else {
            return false;
        }
    },
    isSelect: function (val1, val2) {
        if (val1 == val2) {
            initializeSelectBox();
            return 'selected';
        }
    },
    questionnaireListing: function () {
        if (Session.get("questionnaireListing")) {
            return Session.get("questionnaireListing");
        }
        
        Meteor.call('questionnaireListing', function (error, response) {
            if (error) {
                console.log("Error calling questionnaireListing()");
            }
            Session.set("questionnaireListing", response);
            Session.set("questionnaireLoaded", true);
        });
        return Session.get("questionnaireListing");
    },
    questionSession: function () {
        if (Session.get("questionSession")) {
            return true;
        }
    },
    responseAnswer: function () {
        if (Session.get('responseAnswer')) {
            initializeSelectBox();
            return Session.get('responseAnswer');
        }
    },
    questionVal: function () {
        if (Session.get("questionSession")) {
            var questionSess = Session.get("questionSession");
            var questionDef = Contents.find({
                _id: questionSess.question
            }).fetch();
            var questionHelper = Contents.find({
                _id: questionSess.helper
            }).fetch();
            Meteor.subscribe('categoryData', questionSess.category);
            var categoryContId = Categories.find({
                _id: questionSess.category,
                deleted: '0'
            }).fetch();
            if (categoryContId.length > 0) {
                var questionCat = Contents.find({
                    _id: categoryContId[0].cat_name
                }).fetch();
            }
            if (questionDef && questionDef.length > 0 && questionCat && questionCat.length > 0) {
                console.log('set questionValue');
                Session.set("questionValue", {
                    questionDef: questionDef[0].en,
                    questionCat: questionCat[0].en,
                    type: questionSess.question_type,
                    helper: questionHelper[0].en
                });
            }
            return Session.get("questionValue");
        }
    },
    questionType: function () {
        return [
            { "value": 5, "title": "Radio" },
            { "value": 8, "title": "Checkbox" },
        ];
    },
    equalVal: function (v1, v2) {
        return v1 == v2;
    },
    allCategory: function () {
        questionsDeps.depend();
        if (Session.get('categoryData')) {
            return Session.get('categoryData');
        }
        Meteor.setTimeout(function () {
            $('.collapsible').collapsible();
        }, 500);
        var category = Categories.find({
            $and: [
                { $or: [{ parent: '0' }, { parent: { $exists: false } }] },
                { $or: [{ deleted: '0' }, { deleted: { $exists: false } }] },
            ]
        }).fetch();
        if (!category.length) {
            return [];
        }

        var categoryData = [];
        for (var i = 0; i < category.length; i++) {
            questionData = [];

            var subcategoryData = [];
            categoryData.push({
                index: i,
                catId: category[i]._id,
                color: category[i].cat_color,
                title: category[i].cat_name,
                mainCatQuestion: questionData,
                subCategory: subcategoryData
            });
        }

        Session.set('categoryData', categoryData);
        return Session.get('categoryData');
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
    questionBreakdown: function () {
        var allVariable = [];
        if (Session.get('questionSet')) {
            var questionArr = Session.get('questionSet');
            var ansSet = Questions.find({
                _id: questionArr.questionId
            }).fetch();
            var mainAns = [];

            //console.log("ansSet:", ansSet);
            if (ansSet.length > 0) {
                if (ansSet[0].answers) {
                    for (var k = 0; k < ansSet[0].answers.length; k++) {
                        Meteor.subscribe("getAnswer", ansSet[0].answers[k]._id);
                        var ans = Answers.find({
                            _id: ansSet[0].answers[k]._id
                        }).fetch();
                        if (ans.length > 0) {
                            var mainAnswer = Contents.find({
                                _id: ans[0].answer_text
                            }).fetch();
                            mainAns.push({
                                mainAns: mainAnswer[0].en
                            });
                        }
                    }
                }

            }
            if (questionArr.depQuestion != '') {
                var questionId = Questions.find({
                    _id: questionArr.depQuestion
                }).fetch();
                if (questionId.length > 0) {
                    var dependencyQuestion = Contents.find({
                        _id: questionId[0].question
                    }).fetch();
                    var depQuestion = dependencyQuestion[0].en;
                    var ansArr = [];
                    for (var i = 0; i < questionArr.depAnswer.length; i++) {
                        Meteor.subscribe("getAnswer", questionArr.depAnswer[i].answers);
                        var ans = Answers.find({
                            _id: questionArr.depAnswer[i].answers
                        }).fetch();
                        if (ans.length > 0) {
                            var depAns = Contents.find({
                                _id: ans[0].answer_text
                            }).fetch();
                            ansArr.push({
                                depAns: depAns[0].en
                            });
                        }
                    }
                    allVariable.push({
                        questionArr: questionArr,
                        ansArr: mainAns,
                        depQuestion: depQuestion,
                        dependencyAnswer: ansArr
                    });
                }
            } else {
                allVariable.push({
                    questionArr: questionArr,
                    ansArr: mainAns
                });
            }
            return allVariable[0];
        }
    },
    questionnaireData: function () {
        if (Session.get("questionnaireItem")) {
            $('.collapsible').collapsible();
            var questionnaireItem = Session.get("questionnaireItem");
            return questionnaireItem[0];
        }

    },
    questionDrop: function () {
        if (Session.get('allQuestion')) {
            var allQuestion = Session.get('allQuestion');

            if (allQuestion.length > 0) {

                for (var i = 0; i < allQuestion.length; i++) {
                    var tmpArrQuestion = [];
                    if (allQuestion[i].mainCatQuestion) {
                        if (allQuestion[i].mainCatQuestion.length > 0) {

                            for (var k = 0; k < allQuestion[i].mainCatQuestion.length; k++) {

                                var questionCheck = Questions.find({ _id: allQuestion[i].mainCatQuestion[k].questionId }).fetch();

                                if (questionCheck.length > 0) {
                                    if (questionCheck[0] != undefined) {
                                        allQuestion[i].mainCatQuestion[k]['i1'] = i;
                                        allQuestion[i].mainCatQuestion[k]['i2'] = k;
                                        tmpArrQuestion.push(allQuestion[i].mainCatQuestion[k]);
                                    }
                                }

                            }
                            allQuestion[i].mainCatQuestion = tmpArrQuestion;
                        }
                    }
                }
            }
            Session.set('allQuestion', allQuestion);

            return allQuestion;
        }
    },
    editQuesType: function () {
        return [];
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
    activeTab: function (tabName) {
        var tabs = Session.get('quesTabs');
        if (!tabs) {
            return false;
        }
        if (typeof tabs[tabName] === 'undefined') {
            return false;
        }
        return tabs[tabName];
    },
    questionnaireLoaded: function () {
        return Session.get("questionnaireLoaded");
    }
});

function initializeSelectBox() {
    Meteor.setTimeout(function () {
        $('select').material_select();
    }, 1);
}

function tabbing() {
    $('ul.tabs').tabs();
    $('.modal').modal();
}