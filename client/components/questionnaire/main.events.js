import { Questionnaires } from '/imports/api/questionnaires/questionnaires';
import { Categories } from '/imports/api/questionnaires/categories';
import { Questions } from '/imports/api/questionnaires/questions';
import { FlowRouter } from 'meteor/kadira:flow-router';

questionsDeps = new Deps.Dependency;
Template.questionnaire.events({
	'click li.category': function (event) {
		event.preventDefault();

		var elem = event.currentTarget,
			catId = $(elem).data('cat-id'),
			catIndex = $(elem).data('cat-index');

		var categoryData = Session.get('categoryData');
		var questions = Questions.find({
			category: catId,
			dependency: [],
			$or: [{ 'deleted': '0' }, { 'deleted': { $exists: false } }]
		}).fetch();

		questionData = [];
		if (questions.length > 0) {
			for (var j = 0; j < questions.length; j++) {
				var hier = 0;
				questionData.push({
					questionId: questions[j]._id,
					Qtitle: questions[j].question,
					keyString: questions[j].key_string,
					gender: questions[j].gender,
					qType: questions[j].question_type,
					level: hier++
				});
				recursive(questions[j]._id, hier);
			}
		}

		var subcategoryData = [];
		var subCategory = Categories.find({
			parent: catId,
			$or: [{ 'deleted': '0' }, { 'deleted': { $exists: false } }]
		}).fetch();
		if (subCategory.length > 0) {
			for (var k = 0; k < subCategory.length; k++) {
				var subCatQuestion = Questions.find({
					category: subCategory[k]._id,
					dependency: [],
					$or: [{ 'deleted': '0' }, { 'deleted': { $exists: false } }]
				}).fetch();

				if (subCatQuestion.length > 0) {
					subCatquestionData = [];
					for (var n = 0; n < subCatQuestion.length; n++) {
						var subhier = 0;
						subCatquestionData.push({
							questionId: subCatQuestion[n]._id,
							Qtitle: subCatQuestion[n].question,
							keyString: subCatQuestion[n].key_string,
							gender: subCatQuestion[n].gender,
							qType: subCatQuestion[n].question_type,
							level: subhier++
						});
						recursiveSubCategory(subCatQuestion[n]._id, subhier);
					}
					subcategoryData.push({
						subCatId: subCategory[k]._id,
						subcolor: subCategory[k].cat_color,
						subtitle: subCategory[k].cat_name,
						subCatquestionData: subCatquestionData
					});
				}
			}
		}

		categoryData[catIndex]['mainCatQuestion'] = questionData;
		categoryData[catIndex]['subCategory'] = subcategoryData;

		Session.set('categoryData', categoryData);
		questionsDeps.changed();
		Meteor.setTimeout(function () {
			$('.collapsible').collapsible();
		}, 500);
	},
	'click li.tab a[href]': function (event) {
		var tabs = Session.get('quesTabs');
		if (!tabs) {
			tabs = {};
		}
		var elem = event.currentTarget,
			tabName = $(elem).attr("href");

		switch (tabName) {
			case '#questionnaireTab':
				tabs.questionnaires = true;
				break;
			case '#qCategoryTab':
				tabs.categories = true;
				break;
			case '#qQuestionTab':
				tabs.questions = true;
				break;
		}

		Session.set('quesTabs', tabs);
	},
	'click #createQuestionnaireCat': function () {
		$('#questionnaireCatAdd').parsley().reset();
		Session.set("categoryDetail", undefined);
		Session.set("disease", undefined);
		$('#questionnaireCatAdd')[0].reset();
		$('#categoriesPopup').modal({
			ready: function() {
				$('textarea#summary').froalaEditor({
					height: 300
				});
				$('ul.tabs').tabs();
			}
		});
		$('#categoriesPopup').modal("open");
	},
	'submit #questionnaireCatAdd': function (event, data) {
		event.preventDefault();

		var cat_nameId = '';
		var summaryId = '';
		var categoryId = '';
		var helperId = '';
		var SessionCheck = Session.get('categoryDetail');
		var lang = 'en';
		if (SessionCheck) {

			let catData = {
				cat_name: data.find("#cat_name").value,
				summary: data.find("#summary").value,
				helper: '',//data.find("#helper").value,
				cat_color: data.find("#cat_color").value,
				question_color: data.find("#question_color").value,
				parent: data.find('#parent').value,
			};
			let categoryId = SessionCheck.detail._id;
			Meteor.call("insertQuestionnaireCategory", catData, categoryId, function (error, catId) {
				if (catId) {
					//Session.set('categorySuccessMsg', 'Category added successfully!');
					if (Session.get("categoryDetail")) {
						//delete Session.keys.categoryDetail;
						Session.set('categoryDetail', undefined);
					}
					if (Session.get("disease")) {
						//delete Session.keys.disease;
						Session.set('disease', undefined);
					}
					$('#categoriesPopup').modal("close");
				}
			});
		}
		else {
			let catData = {
				cat_name: data.find("#cat_name").value,
				summary: data.find("#summary").value,
				parent: data.find('#parent').value,
				cat_color: data.find("#cat_color").value,
				question_color: data.find("#question_color").value,
				createdBy: Meteor.userId()
			};

			Meteor.call("insertQuestionnaireCategory", catData, function (error, catId) {
				if (catId) {
					//Session.set('categorySuccessMsg', 'Category added successfully!');
					if (Session.get("categoryDetail")) {
						Session.set('categoryDetail', undefined);
					}

					$('#categoriesPopup').modal("close");
				}
			});
		}
	},
	'click .editCategory': function (event, data) {
		$('#questionnaireCatAdd').parsley().reset();
		event.preventDefault();
		var id = $(event.currentTarget).attr("id");
		if (id) {

			Meteor.call('fetchCategoryData', id, function (error, data) {

				if (data) {
					if (data.disease != false) {
						Session.set('disease', true);
					}
					if (data.parent !== '0') {
						Session.set('selectedVal', true);
					}

					Session.set('categoryDetail', {
						detail: data,
						catName: data.cat_name,
						parent: data.parent,
						catSummary: data.summary,
						catHelper: data.helper
					});

					//$('#cat_color.minicolors').minicolors('value', data.cat_color);
					//$('#question_color.minicolors').minicolors('value', data.question_color);
					$('#categoriesPopup').modal({
						ready: function() {
							//$('textarea#helper').froalaEditor();
							$('textarea#summary').froalaEditor({
								height: 300
							});
							
							//if (typeof data.helper !== "undefined" && data.helper.length > 0) {
							//	$('textarea#helper').froalaEditor('html.set', data.helper);
							//}
							if (typeof data.summary !== "undefined" && data.summary.length > 0) {
								$('textarea#summary').froalaEditor('html.set', data.summary);
							}
							$('ul.tabs').tabs();
						}
					});
					$('#categoriesPopup').modal("open");

				}
			});

		}
	},
	'click #questionnaireCatClose': function (event, data) {
		if (Session.get("categoryDetail")) {
			//delete Session.keys.categoryDetail;
			Session.set('categoryDetail', undefined);
		}
	},

	'click .deleteQcategory': function (event, data) {
		if (confirm("Are you sure you want to delete?")) {
			var id = $(event.currentTarget).attr("id");
			catId = id.split('_');
			catData = { deleted: '1' };

			var questions = Questions.find({
				category: catId[1],
				$or: [{ deleted: '0' }, { deleted: { $exists: false } }],

			}).fetch();
			if (questions && questions.length) {
				alert('This category contains questions data. Not allowed to remove.');
				return;
			}

			var subCategories = Categories.find({
				parent: catId[1],
				$or: [{ deleted: '0' }, { deleted: { $exists: false } }],
			}).fetch();
			if (subCategories && subCategories.length) {
				for (var i = 0; i < subCategories.length; i++) {
					var questions = Questions.find({
						category: subCategories[i]['_id'],
						$or: [{ deleted: '0' }, { deleted: { $exists: false } }],
					}).fetch();
					if (questions && questions.length) {
						alert('This category contains questions data. Not allowed to remove.');
						return;
					}
				}
			}

			Meteor.call("insertQuestionnaireCategory", catData, catId[1], function (error, catId) {
				if (catId) {

					if (Session.get("categoryDetail")) {
						//delete Session.keys.categoryDetail;
						Session.set('categoryDetail', undefined);
					}
					if (Session.get("disease")) {
						//delete Session.keys.disease;
						Session.set('disease', undefined);
					}

					//$('#categoriesPopup').closeModal();
				}
			});
		}

	},
	/*Start question section for questionnaire*/
	'click #createQuestionnaire': function () {
		$('#questionnaireAdd').parsley().reset();
		Session.set("questionnaireItem", '');
		if (Session.get("allQuestion")) {
			Session.set("allQuestion", "");
		}

		$('#questionnaireAdd')[0].reset();
		$('.collapsible').collapsible();
		$('#questionnairePopup').modal({
			ready: function() {
    			//$('textarea#questionnairehelper').froalaEditor();
				$('ul.tabs').tabs();
			}
		});
		$('#questionnairePopup').modal('open');
	},
	
	//---------Create questionnaire-----rpm-------//
	'submit #questionnaireAdd': function (event, data) {
		event.preventDefault();
		var questionnaireTitle = $('#title').val();
        var questionnaireKey = questionnaireTitle.toLowerCase().split(" ").join("_");
		let questionnaireData = {
			title: data.find("#title").value,
			strap: data.find("#strap").value,
			questionnaireKey:questionnaireKey,
			summary: data.find("#questionnaireSummary").value,
			status: true,
			createdBy: Meteor.userId()
		};
		Meteor.call("insertQuestionnaire", questionnaireData, function (error, res) {
			if (error) {
				sAlert.error(error.reason, {effect: 'bouncyflip', position: 'top-right', timeout: 5000, onRouteClose: true, stack: false, offset: '80px'});
			}else{
				if (res.status) {
					Session.set("questionnaireListing", undefined);
					Session.set("questionnaireLoaded", false);

					sAlert.success(res.msg, {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
					//$('#questionnairePopup').modal("close");
					if (Session.get('allQuestion')) {
						Session.set('allQuestion', '');
					}
					var qId = res.id;
					Session.set('questionnaireId', qId);
					Meteor.call("questionnaireQuestionArray", qId, function (error, data) {
						//console.log("questionnaireQuestionArray Dinesh",qId)
						Session.set('allQuestion', data);
						Meteor.setTimeout(function () {
							$('.collapsible').collapsible();
						}, 1000);
					});
					Meteor.subscribe("questionnaireItem", qId);
					var questionnaireData = Questionnaires.find({ _id: qId }).fetch();
					var completeArr = [];
					if (questionnaireData.length > 0) {
						completeArr.push({
							questionnaire: questionnaireData[0],
							questionnaireTitle: questionnaireData[0].title,
							strap: questionnaireData[0].strap,
							summary: questionnaireData[0].summary,
							helper: questionnaireData[0].helper
						});
					}
					Session.set("questionnaireItem", completeArr);
					
					$('textarea#questionnaireSummary').froalaEditor({
						height: 300
					});
					$('ul.tabs').tabs();
					$('ul.tabs').tabs('select_tab', "questions");
				}else{
					sAlert.error(res.msg, {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
				}
			}
		});
	},
	
	'change #image_name': function (event, template) {

		FS.Utility.eachFile(event, function (file) {
			changeFileName = file.name.replace(/\s/g, '');
			var newLogoFile = new FS.File(file);
			newLogoFile.name(changeFileName);
			newLogoFile.userId = Meteor.userId();
			QuestionnaireLogo.insert(newLogoFile, function (err, fileObj) {
				if (fileObj) {
					var imgArr = [];
					imgArr.push({ _id: fileObj._id, name: fileObj.original.name });
					Session.set("imgArr", imgArr);
					$('#img_name').val(fileObj.original.name);
				}
			});
		});

	},
	
	//-------open question popup---------rpm----//
	'click #createQuestion': function () {
		$('#questionAdd').parsley().reset();
		Session.set('questionSession', '');
		Session.set('responseAnswer', '');
		Session.set("questionSets", "");
		Session.set("answerData", "");
		Session.set("questionSet", '');

		//$('textarea#questionHelper').froalaEditor();
		$('#questionAdd')[0].reset();
		$('#questionPopup').modal("open");
		/* $('#secondQuestionTab').hide();
		 $('#secondTabCont').hide();	*/
	},
	
	//--------Add questions-----rpm-------//
	'submit #questionAdd': function (event, data) {
		event.preventDefault();

		var dependencyQuestion = [];
		if (data.find("#dependency").value != 'null') {
			var haArr = [];
			$('#dependencyAns :selected').each(function (i, selected) {
				haArr.push({ answers: $(selected).val() });
			});
			dependencyQuestion.push({ dependencyQuestion: data.find("#dependency").value, dependencyAnswer: haArr });
		}
		var questionData = {
			question: data.find("#questionDef").value,
			helper: "",
			key_string: data.find("#key_string").value,
			category: data.find("#questionCategory").value,
			dependency: dependencyQuestion,
			question_type: data.find("#element_type").value,
			gender: data.find("#gender").value,
			createdBy: Meteor.userId()
		};

		Meteor.call("insertQuestion", questionData, function (error, questionId) {
			if (questionId) {
				Session.set('questionSession', '');
				Session.set('responseAnswer', '');
				Session.set("questionSets", "");
				Session.set("answerData", "");
				$('#questionPopup').modal("close");
				Session.set("viaNewQues", true);
				FlowRouter.go('/question/' + questionId);
			}
		});

	},
	'click .deleteQuestion': function (event, data) {
		if (confirm("Are you sure you want to delete?")) {
			var id = $(event.currentTarget).attr("id");
			queId = id.split('_');
			queData = { deleted: '1' };
			Meteor.call("insertQuestion", queData, queId[1], function (error, res) {
				if (res) {
					Meteor.call("removeFromQuestionnaire", queId[1], function (error, result) {
						//console.log("result::", result)
					});
					Router.go('/questionnaire');
				}
			});
		}

	},
	'click #questionClose': function (event, data) {
		Session.set('questionSession', '');
		Session.set('responseAnswer', '');
		Session.set("questionSets", "");
		Session.set("answerData", "");
		Session.set("questionSet", "");
	},
	'click #addAnswer': function () {
		var responseAnswer;
		if (Session.get('responseAnswer')) {
			responseAnswer = Session.get('responseAnswer');

		} else {
			responseAnswer = [];
		};

		var elementCount = responseAnswer.length;
		responseAnswer.push({
			answerText: '',
			answerLabel: '',
			index: elementCount + 1,
		});
		Session.set('responseAnswer', responseAnswer);
	},
	'click .deleteAnswer': function (event) {
		if (confirm("Are you sure you want to delete?")) {

			var option = $(event.currentTarget).attr("id");
			var totaloption = Session.get('responseAnswer')
			var deloption = option.replace("delAns_", '');

			for (var i = 0; i < totaloption.length; i++) {
				if (totaloption[i].index == deloption) {
					var result = totaloption.splice([i], 1);
				}
			}

			if (Session.get("responseAnswer")) {
				//delete Session.keys.responseAnswer;
				Session.set('responseAnswer', undefined);
			}
			Session.set('responseAnswer', totaloption);

			if (Session.get('responseAnswer')) {
				Session.set('deleteSuccessMsg', 'Option Field deleted successfully!');
			}

		}
	},
	'change #questionCategory': function (event, data) {
		event.preventDefault();
		var id = data.find("#questionCategory").value;

		Meteor.call("fetchQuestions", id, function (error, questionData) {
			if (questionData) {
				Session.set("questionSets", questionData);
				//console.log("questionData", questionData)
			} else {
				Session.set("questionSets", undefined);
			}

		});
	},
	'change #dependency': function (event, data) {
		event.preventDefault();
		var id = data.find("#dependency").value;
		Meteor.call("fetchAnswers", id, function (error, answerData) {
			if (answerData) {
				Session.set("answerData", answerData);
				//console.log("answerData",answerData)
			}

		});
	},
	'click .hierarchy': function (event, data) {
		event.preventDefault();
		var qId = $(event.currentTarget).attr("id");
		FlowRouter.go('/question/' + qId);
	},
	'click .questionnaire': function (event, data) {
		event.preventDefault();
		$('.loader-bg').show();
		if (Session.get('allQuestion')) {
			Session.set('allQuestion', '');
		}
		var qId = $(event.currentTarget).attr("id");
		Session.set('questionnaireId', qId);
		Meteor.call("questionnaireQuestionArray", qId, function (error, data) {
			//console.log("questionnaireQuestionArray Dinesh",qId)
			Session.set('allQuestion', data);
			Meteor.setTimeout(function () {
				$('.collapsible').collapsible();
			}, 1000);
		});
		Meteor.subscribe("questionnaireItem", qId);
		var questionnaireData = Questionnaires.find({ _id: qId }).fetch();
		var completeArr = [];
		if (questionnaireData.length > 0) {
			completeArr.push({
				questionnaire: questionnaireData[0],
				questionnaireTitle: questionnaireData[0].title,
				strap: questionnaireData[0].strap,
				summary: questionnaireData[0].summary,
				helper: questionnaireData[0].helper
			});
		}
		$('#questionnairePopup').modal({
			ready: function () {
				$('#questionnaireUpdate').parsley().reset();
				//$('textarea#questionnairehelper').froalaEditor();
				$('textarea#questionnaireSummary').froalaEditor({
					height: 300
				});
				
				$('.loader-bg').hide();
				//if (typeof questionnaireData[0].helper !== "undefined" && questionnaireData[0].helper.length > 0) {
				//	$('#questionnairehelper').froalaEditor('html.set', questionnaireData[0].helper);
				//}
				if (typeof questionnaireData[0].summary !== "undefined" && questionnaireData[0].summary.length > 0) {
					$('#questionnaireSummary').froalaEditor('html.set', questionnaireData[0].summary);
				}

				$('ul.tabs').tabs();
			}
		});
		$('#questionnairePopup').modal("open");

		Session.set("questionnaireItem", completeArr);
	},
	
	//------update questionnaire---------rpm---//
	'submit #questionnaireUpdate': function (event, data) {
		event.preventDefault();
		var questionnaireSession = Session.get("questionnaireItem");
		var lang = 'en';

		if (questionnaireSession) {

			var allQuestionArray = [];
			/*Questionnaire Question add: Start*/
			if (Session.get("allQuestion")) {
				var allQuestion = Session.get("allQuestion");

				for (var q = 0; q < allQuestion.length; q++) {
					var questionArray = [];

					if (allQuestion[q].mainCatQuestion) {
						for (var s = 0; s < allQuestion[q].mainCatQuestion.length; s++) {
							questionArray.push({ _id: allQuestion[q].mainCatQuestion[s].questionId, level: allQuestion[q].mainCatQuestion[s].level, parentQsId: allQuestion[q].mainCatQuestion[s].parentQsId });
						}
					}

					var categoryQuestionArray = [];
					if (allQuestion[q].subCategory) {
						for (var c = 0; c < allQuestion[q].subCategory.length; c++) {

							var subQuestionArray = [];
							for (var d = 0; d < allQuestion[q].subCategory[c].SubcatQuestions.length; d++) {
								subQuestionArray.push({ _id: allQuestion[q].subCategory[c].SubcatQuestions[d].questionId, level: allQuestion[q].subCategory[c].SubcatQuestions[d].level, parentQsId: allQuestion[q].subCategory[c].SubcatQuestions[d].parentQsId });
							}
							categoryQuestionArray.push({ subCategory_id: allQuestion[q].subCategory[c].subCatId, questions: subQuestionArray });

						}
						allQuestionArray.push({ main_index: allQuestion[q].index, category_id: allQuestion[q].mainCatId, question: questionArray, subCategories: categoryQuestionArray });
					} else {
						allQuestionArray.push({ main_index: allQuestion[q].index, category_id: allQuestion[q].mainCatId, question: questionArray });
					}
					//console.log("allQuestionArray11111111",allQuestionArray);
				}

			}
			questionnaireData = {};
			questionnaireData = {
				_id: questionnaireSession[0].questionnaire._id,
				title: data.find("#title").value,
				strap: data.find("#strap").value,
				summary: data.find("#questionnaireSummary").value,
				helper: '',//data.find("#questionnairehelper").value,
				questions: allQuestionArray,
				createdBy: Meteor.userId()
			};
			Meteor.call("insertQuestionnaire", questionnaireData, questionnaireSession[0].questionnaire._id, function (error, res) {
				if (res) {
					//Session.set('questionnaireSuccessMsg', 'Questionnaire added successfully!');
					if (res.status) {
						Session.set("imgArr", "");
						Session.set("questionnaireItem", "");
						Session.set('allQuestion', '');
						sAlert.success(res.msg, {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
						$('#questionnairePopup').modal("close");
						Session.set("questionnaireListing", undefined);
						Session.set("questionnaireLoaded", false);
					}else{
						sAlert.error(res.msg, {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
					}
				}
			});
		}

	},
	
	'click #questionnaireClose': function () {
		Session.set("questionnaireItem", "");
		Session.set("allQuestion", "");

		$('#questionnairePopup').modal("close");
	},
	'click .arrowadd': function (event, data) {
		event.preventDefault();
		Meteor.setTimeout(function () {
			$('.collapsible').collapsible();
		}, 200);
		allQuestion = [];
		if (Session.get('allQuestion')) {
			allQuestion = Session.get('allQuestion');
		}
		var Id = $(event.currentTarget).attr("id");

		var clickQuestion = Questions.find({ _id: Id }).fetch();

		if (clickQuestion.length > 0) {
			var categoryQuestion = Categories.find({ _id: clickQuestion[0].category }).fetch();
			if (categoryQuestion) {
				if (categoryQuestion[0].parent == 0) {
					var index = "0";
					var catName = '';
					var parentCatColor = categoryQuestion[0].cat_color;

					questionData = [];
					var hier = 0;
					questionData.push({ questionId: Id, Qtitle: clickQuestion[0].question, level: hier++ });
					recursive(Id, hier);

					if (allQuestion.length > 0) {
						var filterQs = _.findWhere(allQuestion, { mainCatId: clickQuestion[0].category });
						var filterIndex = _.findWhere(allQuestion, { index: index });
						//console.log("filterQs::", filterQs);
						//console.log("filterIndex::", filterIndex);
						var selectedindex = -1;
						_.each(allQuestion, function (data, idx) {
							if (data.mainCatId == clickQuestion[0].category) {
								selectedindex = idx;
							}
						});
						if (filterQs) {
							if (allQuestion[selectedindex]['mainCatQuestion']) {
								var alreadySelectedQs = allQuestion[selectedindex]['mainCatQuestion'];
								var filterQuestion = _.findWhere(alreadySelectedQs, { questionId: questionData[0].questionId });
								if (!filterQuestion) {
									var fullArr = alreadySelectedQs.concat(questionData);
									allQuestion[selectedindex]['mainCatQuestion'] = fullArr;
								} else {
									//allQuestion[selectedindex]['mainCatQuestion'] = questionData;
								}
							} else {
								allQuestion[selectedindex]['mainCatQuestion'] = questionData;
							}
						} else {
							var index = "0";
							allQuestion.push({ index: index, mainCatId: clickQuestion[0].category, parentCatId: clickQuestion[0].category, parentCat: categoryQuestion[0].cat_name, parentCatColor: parentCatColor, mainCatQuestion: questionData });
						}
					} else {
						allQuestion.push({ index: index, mainCatId: clickQuestion[0].category, parentCatId: clickQuestion[0].category, parentCat: categoryQuestion[0].cat_name, parentCatColor: parentCatColor, mainCatQuestion: questionData });
					}
				} else {
					var index = "0";
					var parentCatVal = Categories.find({ _id: categoryQuestion[0].parent }).fetch();
					if (parentCatVal) {
						var catName = categoryQuestion[0].cat_name;
						var parentCatColor = parentCatVal[0].cat_color;
						questionData = [];
						var hier = 0;

						questionData.push({ questionId: Id, Qtitle: clickQuestion[0].question, level: hier++ });
						recursive(Id, hier);
						if (allQuestion.length > 0) {
							var filterQs = _.findWhere(allQuestion, { mainCatId: parentCatVal[0]._id });
							var filterIndex = _.findWhere(allQuestion, { index: index });
							var selectedindex = -1;
							_.each(allQuestion, function (data, idx) {
								if (data.mainCatId == parentCatVal[0]._id) {
									selectedindex = idx;
								}
							});

							if (filterQs) {
								if (allQuestion[selectedindex]['subCategory']) {
									var alreadySelectedCat = allQuestion[selectedindex]['subCategory'];
									var filterQuestion = _.findWhere(alreadySelectedCat, { subCatId: categoryQuestion[0]._id });


									var newIndex = -1;
									_.each(alreadySelectedCat, function (dataQ, idx) {
										if (dataQ.subCatId == categoryQuestion[0]._id) {
											newIndex = idx;
										}
									});

									if (filterQuestion && newIndex >= 0) {
										var subCatArr = [];
										if (allQuestion[selectedindex]['subCategory'][newIndex]['SubcatQuestions']) {
											var alreadySelectedQs = allQuestion[selectedindex]['subCategory'][newIndex]['SubcatQuestions'];
											var filterQuestionData = _.findWhere(alreadySelectedQs, { questionId: questionData[0].questionId });
											if (!filterQuestionData) {
												subCatArr.push({ subCatId: categoryQuestion[0]._id, subCatColor: categoryQuestion[0].cat_color, subCatTitle: catName, SubcatQuestions: questionData });
												var fullArr = alreadySelectedQs.concat(questionData);
												//console.log("fullArr::", fullArr)
												allQuestion[selectedindex]['subCategory'][newIndex]['SubcatQuestions'] = fullArr;
											} else {
												//allQuestion[selectedindex]['subCategory'][newIndex]['SubcatQuestions'] = questionData;

											}
										} else {
											subCatArr.push({ subCatId: categoryQuestion[0]._id, subCatColor: categoryQuestion[0].cat_color, subCatTitle: catName, SubcatQuestions: questionData });
											var fullArr = alreadySelectedCat.concat(subCatArr);
											allQuestion[selectedindex]['subCategory'] = fullArr;
										}

									} else if (newIndex < 0) {
										var subCatArr = [];
										subCatArr.push({ subCatId: categoryQuestion[0]._id, subCatColor: categoryQuestion[0].cat_color, subCatTitle: catName, SubcatQuestions: questionData });
										var fullArr = alreadySelectedCat.concat(subCatArr);
										allQuestion[selectedindex]['subCategory'] = fullArr;
									}
								} else {
									var subCatArr = [];
									subCatArr.push({ subCatId: categoryQuestion[0]._id, subCatColor: categoryQuestion[0].cat_color, subCatTitle: catName, SubcatQuestions: questionData });
									allQuestion[selectedindex]['subCategory'] = subCatArr;
								}
							} else {
								var index = "0";
								var subCatArr = [];
								subCatArr.push({ subCatId: categoryQuestion[0]._id, subCatColor: categoryQuestion[0].cat_color, subCatTitle: catName, SubcatQuestions: questionData });
								allQuestion.push({ index: index, mainCatId: parentCatVal[0]._id, parentCatId: clickQuestion[0].category, parentCat: parentCatVal[0].cat_name, parentCatColor: parentCatColor, childCatName: catName, childCatColor: categoryQuestion[0].cat_color, subCategory: subCatArr });
							}
						} else {
							var subCatArr = [];
							subCatArr.push({ subCatId: categoryQuestion[0]._id, subCatColor: categoryQuestion[0].cat_color, subCatTitle: catName, SubcatQuestions: questionData });
							allQuestion.push({ index: index, mainCatId: parentCatVal[0]._id, parentCatId: clickQuestion[0].category, parentCat: parentCatVal[0].cat_name, parentCatColor: parentCatColor, childCatName: catName, childCatColor: categoryQuestion[0].cat_color, subCategory: subCatArr });
							//allQuestion.push({index: index, mainCatId: parentCatVal[0]._id, parentCatId: clickQuestion[0].category, parentCat: parentCat[0].en, parentCatColor: parentCatColor,childCatName: catName,childCatColor: categoryQuestion[0].cat_color,SubcatQuestions: questionData});
						}
					}
				}
				Session.set('allQuestion', allQuestion);
			}
		}
	},
	
	//----------delete questionnaire--rpm---------//
	'click .deleteQuestionnaire': function (event, data) {
		if (confirm("Are you sure you want to delete?")) {
			var id = $(event.currentTarget).attr("id");
			catId = id.split('_');
			catData = { deleted: '1' };
			Meteor.call("insertQuestionnaire", catData, catId[1], function (error, res) {
				if (res) {
					if (res.status) {
						Session.set("questionnaireListing", undefined);
						Session.set("questionnaireLoaded", false);
						sAlert.success('Questionnaire deleted successfully!', {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
					}else{
						sAlert.error('Questionnaire not deleted successfully!', {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
					}
				}
			});
		}
	},
	
	//----------change status questionnaire--rpm---------//
	'click .statusQuestionnaire': function (event, data) {
		var id = $(event.currentTarget).attr("id");
		var status = $(event.currentTarget).attr("data-status");
		catId = id.split('_');
		if (status) {
			catData = { status: false };
		}else{
			catData = { status: true };
		}
		
		//console.log(catData, catId[1],'catData, catId[1]');
		Meteor.call("insertQuestionnaire", catData, catId[1], function (error, res) {
			if (res) {
				if (res.status) {
					Session.set("questionnaireListing", undefined);
					Session.set("questionnaireLoaded", false);
					sAlert.success('Questionnaire status change successfully!', {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
				}else{
					sAlert.error('Questionnaire not deleted successfully!', {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
				}
			}
		});
		
	},
	
	
	'click .printQuestionnaire': function (event, data) {
		event.preventDefault();

		var id = $(event.currentTarget).attr("id");
		var questionnaireId = id.split('_');

		Router.go('/questionnaire-print?id=' + questionnaireId[1]);
	},

	'click .arrowremove': function (e, t) {
		var _selectedQns = Session.get('allQuestion'), questionId = $(e.currentTarget).attr("qs-id");
		//console.log("_selectedQns:: ", _selectedQns)
		var questionData = Questions.find({ _id: questionId }).fetch();
		if (questionData.length) {
			var categoryData = Categories.find({ _id: questionData[0].category }).fetch();
			if (categoryData[0].parent == 0) {
				var mainIndex = returnIndex(_selectedQns, categoryData[0]._id)
					, mainDepsQuestion = findDepQuestion(_selectedQns, mainIndex, questionId);
				//console.log("Hello 1: ",mainIndex);
				//console.log("Hello 2: ",mainDepsQuestion);
				if (mainDepsQuestion.length > 0) {
					var findMainQsData = findMainQs(_selectedQns, mainIndex, questionId);
					if (findMainQsData.length > 0) {
						mainDepsQuestion.push({ questionId: questionId });
						_.each(mainDepsQuestion, function (deps, index) {
							_.each(_selectedQns[mainIndex]['mainCatQuestion'], function (data, idx) {
								if (deps.questionId == data.questionId) {
									_selectedQns[mainIndex]['mainCatQuestion'].splice(idx, 1); // need to use splice
								}
							});
						});
						Session.set('allQuestion', _selectedQns);
					} else if (findMainQsData.length == 0 && _selectedQns[mainIndex]['subCategory']) {
						delete _selectedQns[mainIndex]['mainCatQuestion'];
						Session.set('allQuestion', _selectedQns);
					} else if (findMainQsData.length == 0 && !_selectedQns[mainIndex]['subCategory']) {
						_selectedQns.splice(mainIndex, 1);
						Session.set('allQuestion', _selectedQns);
					}
				} else {
					if (_selectedQns[mainIndex]['mainCatQuestion'].length > 1) {
						_.each(_selectedQns[mainIndex]['mainCatQuestion'], function (data, idx) {
							if (data.questionId == questionId) {
								_selectedQns[mainIndex]['mainCatQuestion'].splice(idx, 1); // need to use splice
							}
						});
						Session.set('allQuestion', _selectedQns);
					} else if (_selectedQns[mainIndex]['mainCatQuestion'].length == 1 && _selectedQns[mainIndex]['subCategory']) {
						delete _selectedQns[mainIndex]['mainCatQuestion'];
						Session.set('allQuestion', _selectedQns);
					} else if (_selectedQns[mainIndex]['mainCatQuestion'].length == 1 && !_selectedQns[mainIndex]['subCategory']) {
						_selectedQns.splice(mainIndex, 1);
					}
				}
			} else {
				var mainIndex = returnIndex(_selectedQns, categoryData[0].parent);
				if (!_selectedQns[mainIndex]['mainCatQuestion'] && _selectedQns[mainIndex]['subCategory'].length == 1) {
					if (_selectedQns[mainIndex]['subCategory'][0]['SubcatQuestions'].length == 1) {
						_selectedQns.splice(mainIndex, 1);
						Session.set('allQuestion', '');
					} else if (_selectedQns[mainIndex]['subCategory'][0]['SubcatQuestions'].length > 1) {
						var subindex = 0, subDepsQuestion = findSubDepQuestion(_selectedQns, mainIndex, questionId, subindex);
						if (subDepsQuestion.length > 0) {
							var findSubQsData = findSubQs(_selectedQns, mainIndex, questionId, subindex);
							if (findSubQsData.length > 0) {
								subDepsQuestion.push({ questionId: questionId });
								_selectedQns = removeDependencyQs(subDepsQuestion, _selectedQns, mainIndex, 0);
							} else {
								_selectedQns.splice(mainIndex, 1);
							}
							Session.set('allQuestion', _selectedQns);
						} else {
							_selectedQns = removeSingleQs(_selectedQns, mainIndex, 0, questionId);
							Session.set('allQuestion', _selectedQns);
						}
					}
				} else if (_selectedQns[mainIndex]['mainCatQuestion'] && _selectedQns[mainIndex]['subCategory'].length == 1) {
					var subCatIndex = returnSubCatIndex(_selectedQns, mainIndex, questionData[0].category)
						, subDepsQuestion = findSubDepQuestion(_selectedQns, mainIndex, questionId, subCatIndex)
						, findSubQsData = findSubQs(_selectedQns, mainIndex, questionId, subCatIndex);
					if (subDepsQuestion.length > 0) {
						if (findSubQsData.length > 0) {
							subDepsQuestion.push({ questionId: questionId });
							_selectedQns = removeDependencyQs(subDepsQuestion, _selectedQns, mainIndex, subCatIndex);
						} else {
							delete _selectedQns[mainIndex]['subCategory'];
							if (_selectedQns[mainIndex]['mainCatQuestion'].length == 0 && !_selectedQns[mainIndex]['subCategory']) {
								_selectedQns.splice(mainIndex, 1);
							}
						}
					} else {
						if (subDepsQuestion.length == 0 && findSubQsData.length == 0) {
							delete _selectedQns[mainIndex]['subCategory'];
							if (_selectedQns[mainIndex]['mainCatQuestion'].length == 0 && !_selectedQns[mainIndex]['subCategory']) {
								_selectedQns.splice(mainIndex, 1);
							}
						} else if (subDepsQuestion.length == 0 && findSubQsData.length >= 1) {
							_selectedQns = removeSingleQs(_selectedQns, mainIndex, subCatIndex, questionId);
						}
					}
					Session.set('allQuestion', _selectedQns);
				} else if (!_selectedQns[mainIndex]['mainCatQuestion'] && _selectedQns[mainIndex]['subCategory'].length > 1) {
					var subCatIndex = returnSubCatIndex(_selectedQns, mainIndex, questionData[0].category);
					if (_selectedQns[mainIndex]['subCategory'][subCatIndex]['SubcatQuestions'].length == 1) {
						_selectedQns[mainIndex]['subCategory'].splice(subCatIndex, 1);
						Session.set('allQuestion', _selectedQns);
					} else if (_selectedQns[mainIndex]['subCategory'][subCatIndex]['SubcatQuestions'].length > 1) {
						var subDepsQuestion = findSubDepQuestion(_selectedQns, mainIndex, questionId, subCatIndex);
						if (subDepsQuestion.length > 0) {
							var findSubQsData = findSubQs(_selectedQns, mainIndex, questionId, subCatIndex);
							subDepsQuestion.push({ questionId: questionId });
							if (findSubQsData.length > 0) {
								_selectedQns = removeDependencyQs(subDepsQuestion, _selectedQns, mainIndex, subCatIndex);
							} else {
								_selectedQns[mainIndex]['subCategory'].splice(subCatIndex, 1);
							}
						} else {
							_selectedQns = removeSingleQs(_selectedQns, mainIndex, subCatIndex, questionId);
						}
						Session.set('allQuestion', _selectedQns);
					}
				} else if (_selectedQns[mainIndex]['mainCatQuestion'] && _selectedQns[mainIndex]['subCategory'].length > 1) {
					var subCatIndex = returnSubCatIndex(_selectedQns, mainIndex, questionData[0].category);
					if (_selectedQns[mainIndex]['subCategory'][subCatIndex]['SubcatQuestions'].length == 1) {
						_selectedQns[mainIndex]['subCategory'].splice(subCatIndex, 1);
						Session.set('allQuestion', _selectedQns);
					} else if (_selectedQns[mainIndex]['subCategory'][subCatIndex]['SubcatQuestions'].length > 1) {
						var subDepsQuestion = findSubDepQuestion(_selectedQns, mainIndex, questionId, subCatIndex);
						if (subDepsQuestion.length > 0) {
							var findSubQsData = findSubQs(_selectedQns, mainIndex, questionId, subCatIndex);
							if (findSubQsData.length > 0) {
								subDepsQuestion.push({ questionId: questionId });
								_selectedQns = removeDependencyQs(subDepsQuestion, _selectedQns, mainIndex, subCatIndex);
							} else {
								_selectedQns[mainIndex]['subCategory'].splice(subCatIndex, 1);
							}
						} else {
							_selectedQns = removeSingleQs(_selectedQns, mainIndex, subCatIndex, questionId);
						}
						Session.set('allQuestion', _selectedQns);
					}
				}
			}
			Session.set('allQuestion', _selectedQns);
		}
	},
	'click #addRiskRatio': function () {
		var responseRR;
		if (Session.get('responseRR')) {
			responseRR = Session.get('responseRR');

		} else {
			responseRR = [];
		};

		var elementCount = responseRR.length;
		responseRR.push({
			index: elementCount + 1,
			rrGender: '',
			rrAge: '',
			rrResponse: '',
			rrValue: ''
		});
		Session.set('responseRR', responseRR);
	},
	'click .deleteRR': function (event) {
		if (confirm("Are you sure you want to delete?")) {

			var option = $(event.currentTarget).attr("id");
			var totaloption = Session.get('responseRR')
			var deloption = option.replace("delRR_", '');

			for (var i = 0; i < totaloption.length; i++) {
				if (totaloption[i].index == deloption) {
					var result = totaloption.splice([i], 1);
				}
			}

			if (Session.get("responseRR")) {
				//delete Session.keys.responseRR;
				Session.set('responseRR', undefined);
			}
			Session.set('responseRR', totaloption);

			if (Session.get('responseRR')) {
				Session.set('deleteSuccessMsg', 'Option Field deleted successfully!');
			}

		}
	}

});

function recursive(id, lvl) {
	lvl + 1;
	Meteor.subscribe("dependencyQue", id);
	var question = Questions.find({ "dependency.dependencyQuestion": id, deleted: '0' }).fetch();
	//var questionData = [];
	if (question.length > 0) {

		for (var k = 0; k < question.length; k++) {
			questionData.push({ questionId: question[k]._id, parentQsId: id, Qtitle: question[k].question, keyString: question[k].key_string, gender: question[k].gender, qType: question[k].question_type, level: lvl });
			recursive(question[k]._id, lvl + 1);

		}
	}
}

function recursiveSubCategory(id, level) {
	level + 1;
	Meteor.subscribe("dependencyQue", id);
	var question = Questions.find({ "dependency.dependencyQuestion": id, deleted: '0' }).fetch();
	var quesLength = question.length;
	if (quesLength > 0) {
		for (var k = 0; k < quesLength; k++) {
			subCatquestionData.push({ questionId: question[k]._id, Qtitle: question[k].question, keyString: question[k].key_string, gender: question[k].gender, qType: question[k].question_type, level: level });

			recursiveSubCategory(question[k]._id, level + 1);
		}
	}
}

//Return  index of main selected array.
function returnIndex(_selectedQns, id) {
	var mainIndex = -1;
	_.each(_selectedQns, function (mainQ, idx) {
		if (mainQ.mainCatId == id) {
			mainIndex = idx;
		}
	});
	//alert(mainIndex)
	return mainIndex;
}

//Return dependency question of main selected question from array.
function findDepQuestion(_selectedQns, mainIndex, questionId) {
	var dependencyQs = [];
	_.each(_selectedQns[mainIndex]['mainCatQuestion'], function (mainQ, idx) {
		if (mainQ.parentQsId) {
			if (mainQ.parentQsId == questionId) {
				dependencyQs.push(mainQ);
			}
		}
	});
	return dependencyQs;
}

//Return main Question only(no dependency question).
function findMainQs(_selectedQns, mainIndex, questionId) {
	var mainQs = [];
	_.each(_selectedQns[mainIndex]['mainCatQuestion'], function (mainQ, idx) {
		if (mainQ.level == 0 && mainQ.questionId != questionId) {
			mainQs.push(mainQ);
		}
	});
	return mainQs;
}

//Find sub category dependency question from array.
function findSubDepQuestion(_selectedQns, mainIndex, questionId, subindex) {
	var dependencyQs = [];
	_.each(_selectedQns[mainIndex]['subCategory'][subindex]['SubcatQuestions'], function (mainQ, idx) {
		if (mainQ.parentQsId) {
			if (mainQ.parentQsId == questionId) {
				dependencyQs.push(mainQ);
			}
		}
	});
	return dependencyQs;
}

//Find sub main questions from array.
function findSubQs(_selectedQns, mainIndex, questionId, subindex) {
	var mainQs = [];
	_.each(_selectedQns[mainIndex]['subCategory'][subindex]['SubcatQuestions'], function (mainQ, idx) {
		if (mainQ.level == 0 && mainQ.questionId != questionId) {
			mainQs.push(mainQ);
		}
	});
	return mainQs;
}

//Return sub category array index.
function returnSubCatIndex(_selectedQns, mainIndex, subCatID) {
	var subIndex = -1;
	_.each(_selectedQns[mainIndex]['subCategory'], function (subQ, idx) {
		if (subQ.subCatId == subCatID) {
			subIndex = idx;
		}
	});
	return subIndex;
}

//Remove multiple dependency question of a question from array
function removeDependencyQs(subDepsQuestion, _selectedQns, mainIndex, subCatIndex) {
	_.each(subDepsQuestion, function (deps, index) {
		_.each(_selectedQns[mainIndex]['subCategory'][subCatIndex]['SubcatQuestions'], function (data, idx) {
			if (deps.questionId == data.questionId) {
				_selectedQns[mainIndex]['subCategory'][subCatIndex]['SubcatQuestions'].splice(idx, 1);
			}
		});
	});
	return _selectedQns;
}

//Remove single selected question from array that doesn't have depency questions.
function removeSingleQs(_selectedQns, mainIndex, subCatIndex, questionId) {
	_.each(_selectedQns[mainIndex]['subCategory'][subCatIndex]['SubcatQuestions'], function (data, idx) {
		if (data.questionId == questionId) {
			_selectedQns[mainIndex]['subCategory'][subCatIndex]['SubcatQuestions'].splice(idx, 1);
		}
	});
	return _selectedQns;
}
