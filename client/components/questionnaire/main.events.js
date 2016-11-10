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
		$('#categoriesPopup').modal("open");

	},
	'click #disease': function (event) {
		Session.set("disease", event.target.checked);
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
				helper: data.find("#helper").value,
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
					$('#categoriesPopup').modal("open", {
						ready: function () {
							tabbing();
							/*$('textarea#helper').editable({
								key: '1D4B3B3D9A2C4A4G3G3F3J3==',
								inlineMode: false,
								minHeight: 100,
								maxHeight: 100,
								imageUploadURL: '/api/upload'
							})// Catch image removal from the editor.
							.on('editable.afterRemoveImage', function (e, editor, $img) {
								Meteor.call('removeFroalaImage', $img.attr('src'), function (err, res) {
									if (err) console.log('image not removed');
									console.log("image removed!");
								})
							});*/
						}
					});

				}
			});

		}
	},
	'click #questionnaireCatClose': function (event, data) {
		if (Session.get("categoryDetail")) {
			//delete Session.keys.categoryDetail;
			Session.set('categoryDetail', undefined);
		}
		if (Session.get("disease")) {
			//delete Session.keys.disease;
			Session.set('disease', undefined);
		}
		$("ul.resp-tabs-list > li").removeClass("resp-tab-active");
		$('#questionnaireContent').removeClass('resp-tab-content-active');
		$('#questionnaireContent').hide();
		$('#qCategoryTab').addClass('resp-tab-active');
		$('#qCategoryContent').addClass('resp-tab-content-active');
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

		tabbing();
		$('#questionnaireAdd')[0].reset();
		$('.collapsible').collapsible();
		$('#questionnairePopup').modal('open');
	},
	'submit #questionnaireAdd': function (event, data) {
		event.preventDefault();

		let questionnaireData = {
			title: data.find("#title").value,
			keyString: data.find("#keyString").value,
			summary: data.find("#questionnaireSummary").value,
			helper: "",
			createdBy: Meteor.userId()
		};
		if (Session.get('imgArr')) {
			var imgArray = Session.get('imgArr');
			var fileName = 'questionnaireLogo-' + imgArray[0]._id + '-' + imgArray[0].name;
			questionnaireData.image_name = fileName;
		}

		Meteor.call("insertQuestionnaire", questionnaireData, function (error, questionnaireId) {
			if (questionnaireId) {
				//Session.set('questionnaireSuccessMsg', 'Questionnaire added successfully!');
				Session.set("questionnaireListing", undefined);
				Session.set("questionnaireLoaded", false);

				if (Session.get("imgArr")) {
					Session.set('imgArr', undefined);
				}
				$('#questionnairePopup').modal("close");
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
	'click #createQuestion': function () {
		$('#questionAdd').parsley().reset();
		Session.set('questionSession', '');
		Session.set('responseAnswer', '');
		Session.set("questionSets", "");
		Session.set("answerData", "");
		Session.set("questionSet", '');

		/*$('textarea#questionHelper').editable({
			key: '1D4B3B3D9A2C4A4G3G3F3J3==',
			inlineMode: false,
			minHeight: 100,
			maxHeight: 100,
			imageUploadURL: '/api/upload'
		})// Catch image removal from the editor.
		.on('editable.afterRemoveImage', function (e, editor, $img) {
			Meteor.call('removeFroalaImage', $img.attr('src'), function (err, res) {
				if (err) console.log('image not removed');
				console.log("image removed!");
			})
		});*/
		$("#firstQuestionTab").addClass("resp-tab-active");
		$('#firstTabCont').addClass('resp-tab-content-active');
		$('#firstTabCont').show();
		$('#questionPopup').modal("open");
		$('#questionAdd')[0].reset();
		/* $('#secondQuestionTab').hide();
		 $('#secondTabCont').hide();	*/
	},
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
				$("#questionnaireTab").removeClass("resp-tab-active");
				$('#questionnaireContent').removeClass('resp-tab-content-active');
				$('#questionnaireContent').hide();
				$('#qQuestionTab').addClass('resp-tab-active');
				$('#qQuestionContent').addClass('resp-tab-content-active');
				$('#questionPopup').modal("close");
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
						console.log("result::", result)
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
		$("#questionnaireTab").removeClass("resp-tab-active");
		$('#questionnaireContent').removeClass('resp-tab-content-active');
		$('#questionnaireContent').hide();
		$('#qQuestionTab').addClass('resp-tab-active');
		$('#qQuestionContent').addClass('resp-tab-content-active');
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
	'submit #questionUpdate': function (event, data) {

		event.preventDefault();
		var questionSess = Session.get('questionSession');
		t = 0;
		j = 0;
		var rrArray = [];
		if (Session.get('responseRR')) {

			for (var r = 1; r <= Session.get('responseRR').length; r++) {
				var riskRatio = {
					rrGender: data.find('#rrGender_' + r).value,
					rrAge: data.find('#rrAge_' + r).value,
					rrValue: data.find('#rrValue_' + r).value,
					rrProgram: data.find('#rrProgram_' + r).value,
					rrRAG: data.find('#rrRAG_' + r).value,
					index: r
				};

				var dataElem = DataElements.findOne({ _id: questionSess.question_type });
				if (dataElem) {
					switch (dataElem.type) {
						case 'cholesterol':
							var rrResponse = {
								total: data.find('#rrResponse_total_' + r).value,
								HDL: data.find('#rrResponse_HDL_' + r).value,
								LDL: data.find('#rrResponse_LDL_' + r).value,
								triglycerides: data.find('#rrResponse_triglycerides_' + r).value
							};
							riskRatio['rrResponseArr'] = rrResponse;
							break;
						case 'alcohol':
							var rrResponse = {
								unit: data.find('#rrResponse_unit_' + r).value,
								value: data.find('#rrResponse_value_' + r).value
							};
							riskRatio['rrResponseArr'] = rrResponse;
							break;
						case 'blood_pressure':
							var rrResponse = {
								systolic: data.find('#rrResponse_systolic_' + r).value,
								disatolic: data.find('#rrResponse_disatolic_' + r).value
							};
							riskRatio['rrResponseArr'] = rrResponse;
							break;
						default:
							var rrResponse = data.find('#rrResponse_' + r).value;
							riskRatio['rrResponse'] = rrResponse;
							break;
					}

				} else {
					var rrResponse = data.find('#rrResponse_' + r).value;
					riskRatio['rrResponse'] = rrResponse;
				}
				rrArray.push(riskRatio);
				console.log('rrArray:', rrArray);

			}
		}

		formData = {};
		formData = {

			_id: questionSess.question,
			en: data.find("#questionDef").value,
			element: 'questionn',
			type: 'question_title',
			translation: [],
			direct_access: ''
		};
		Meteor.call("insertContents", formData, questionSess.question, function (error, questionDef_id) {
			if (questionDef_id) {
				formDataNext = {};
				formDataNext = {
					_id: questionSess.helper,
					en: data.find("#questionHelper").value,
					element: 'question',
					type: 'question_helper',
					translation: [],
					direct_access: ''
				};

				Meteor.call("insertContents", formDataNext, questionSess.helper, function (error, questionHelper_id) {
					if (questionHelper_id) {

						if (questionSess.question_type == 4 || questionSess.question_type == 5 || questionSess.question_type == 8) {
							var ansArr = [];
							for (var m = 1; m <= Session.get('responseAnswer').length; m++) {
								var ansLbl = data.find("#answerText_" + m).value;

								var ansSession = Session.get('responseAnswer');

								var formDataAns = {};
								var LblID = '';
								if (ansSession[m - 1].ansLblID) {
									//alert(t);
									LblID = ansSession[m - 1].ansLblID;
								}
								formDataAns = {
									_id: LblID,
									en: ansLbl,
									element: 'answer',
									type: 'answer_label',
									translation: [],
									direct_access: ''
								}; var k = 0;
								Meteor.call("insertContents", formDataAns, LblID, function (error, answerText_id) {
									k = k + 1;
									if (answerText_id) {
										var ValID = '';
										if (ansSession[k - 1].ansValID) {

											ValID = ansSession[k - 1].ansValID;
										}
										var formAnsVal = {};
										formAnsVal = {
											_id: ValID,
											en: data.find("#answerValue_" + k).value,
											element: 'answer',
											type: 'answer_value',
											translation: [],
											direct_access: ''
										};

										Meteor.call("insertContents", formAnsVal, ValID, function (error, answerValue_id) {

											if (answerValue_id) {
												var AnsID = '';
												if (ansSession[t].ansId) {

													AnsID = ansSession[t].ansId;
													answerText_id = ansSession[t].ansLblID;
													answerValue_id = ansSession[t].ansValID;
												}

												//console.log("answerText_id:",answerText_id,"answerValue_id",answerValue_id)
												var answerData = {};
												answerData = {
													_id: AnsID,
													answer_text: answerText_id,
													answer_value: answerValue_id,
													question: questionSess._id
												};
												t++;
												Meteor.call("insertAnswer", answerData, AnsID, function (error, ansId) {

													if (ansId) {
														if (ansSession[j].ansId) {
															ansArr.push({ _id: ansSession[j].ansId });
														}
														else {
															ansArr.push({ _id: ansId });
														}
														j++;

														var formHelperVal = {};
														formHelperVal = {
															_id: questionSess.helper,
															en: data.find("#questionHelper").value,
															element: 'question',
															type: 'question_helper',
															translation: [],
															direct_access: ''
														};

														Meteor.call("insertContents", formHelperVal, questionSess.helper, function (error, helperId) {
															if (helperId) {
																var questionData = {};
																var dependencyQuestion = [];

																var dependentQuestion = $('#dependency').val();
																questionSess.dependency = [];
																if (dependentQuestion.length && dependentQuestion !== "null") {
																	questionSess.dependency.push({ dependencyQuestion: dependentQuestion });
																}
																if (questionSess.dependency.length > 0) {
																	var haArr = [];
																	$('#dependencyAns :selected').each(function (i, selected) {
																		haArr.push({ answers: $(selected).val() });
																	});
																	dependencyQuestion.push({ dependencyQuestion: questionSess.dependency[0].dependencyQuestion, dependencyAnswer: haArr });
																}

																questionData = {
																	_id: questionSess._id,
																	question: questionSess.question,
																	key_string: questionSess.key_string,
																	//category : $("input:radio[name=questionCategory]:checked").val(),
																	category: data.find("#questionCategory").value,
																	dependency: dependencyQuestion,
																	question_type: data.find("#element_type").value,
																	gender: data.find("#gender").value,
																	answers: ansArr,
																	riskRatio: rrArray,
																	createdBy: Meteor.userId()
																};

																if (questionData["question_type"] == 4 || questionData["question_type"] == 8) {
																	var resetOptionsIndex = $('input[type="radio"][name="answerResetOthers"]:checked').val();
																	if (resetOptionsIndex) {
																		questionData["resetOptionsIndex"] = resetOptionsIndex;
																	}
																}
																Meteor.call("insertQuestion", questionData, questionSess._id, function (error, questionId) {
																	if (questionId) {

																		//Session.set('questionSession','');
																		Session.set('responseAnswer', '');
																		Session.set("questionSets", "");
																		Session.set("answerData", "");
																		Session.set("questionSet", "");
																		$("#questionnaireTab").removeClass("resp-tab-active");
																		$('#questionnaireContent').removeClass('resp-tab-content-active');
																		$('#questionnaireContent').hide();
																		$('#qQuestionTab').addClass('resp-tab-active');
																		$('#qQuestionContent').addClass('resp-tab-content-active');
																		$('#questionPopup').closeModal();
																		Router.go('/questionnaire');

																	}
																});
															}
														});


													}
												});

											}

										});
									}

								});
							}
						}
						else {
							var formHelperVal = {};
							formHelperVal = {
								_id: questionSess.helper,
								en: data.find("#questionHelper").value,
								element: 'question',
								type: 'question_helper',
								translation: [],
								direct_access: ''
							};

							Meteor.call("insertContents", formHelperVal, questionSess.helper, function (error, helperId) {
								if (helperId) {
									var questionData = {};
									var dependencyQuestion = [];

									var dependentQuestion = $('#dependency').val();
									questionSess.dependency = [];
									if (dependentQuestion.length && dependentQuestion !== "null") {
										questionSess.dependency.push({ dependencyQuestion: dependentQuestion });
									}

									if (questionSess.dependency.length > 0) {
										var haArr = [];
										$('#dependencyAns :selected').each(function (i, selected) {
											haArr.push({ answers: $(selected).val() });
										});
										dependencyQuestion.push({ dependencyQuestion: questionSess.dependency[0].dependencyQuestion, dependencyAnswer: haArr });
									}

									questionData = {
										_id: questionSess._id,
										question: questionSess.question,
										key_string: questionSess.key_string,
										category: data.find("#questionCategory").value,
										dependency: dependencyQuestion,
										question_type: data.find("#element_type").value,
										gender: data.find("#gender").value,
										riskRatio: rrArray,
										createdBy: Meteor.userId()
									};
									//console.log("Question Data:",questionData)
									Meteor.call("insertQuestion", questionData, questionSess._id, function (error, questionId) {
										if (questionId) {
											Session.set('questionSession', '');
											Session.set("questionSets", "");
											Session.set("questionSet", "");
											$("#questionnaireTab").removeClass("resp-tab-active");
											$('#questionnaireContent').removeClass('resp-tab-content-active');
											$('#questionnaireContent').hide();
											$('#qQuestionTab').addClass('resp-tab-active');
											$('#qQuestionContent').addClass('resp-tab-content-active');
											$('#questionPopup').closeModal();
											Router.go('/questionnaire');

										}
									});
								}
							});
						}
					}

					Meteor.call('questionUpdate', questionSess.category, data.find("#questionCategory").value, questionSess._id, function (error, result) {
					});
				});
			}
		});

	},
	'change #questionCategory': function (event, data) {
		event.preventDefault();
		var id = data.find("#questionCategory").value;

		Meteor.call("fetchQuestions", id, function (error, questionData) {
			if (questionData) {
				Session.set("questionSets", questionData);
				console.log("questionData", questionData)
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
			if (questionnaireData[0].image_name) {
				var imgArray = questionnaireData[0].image_name.split('-');
				var img_length = imgArray.length - 1;
				var imgName = imgArray[img_length];
				completeArr[0].questionnaire.image_name = imgName;
			}
		}
		$('#questionnairePopup').modal("open", {
			ready: function () {
				/*$('#questionnaireUpdate').parsley().reset();
				tabbing();
				$('textarea#questionnairehelper').editable({
					key: '1D4B3B3D9A2C4A4G3G3F3J3==',
					inlineMode: false,
					minHeight: 100,
					maxHeight: 100,
					imageUploadURL: '/api/upload'
				})// Catch image removal from the editor.
				.on('editable.afterRemoveImage', function (e, editor, $img) {
					Meteor.call('removeFroalaImage', $img.attr('src'), function (err, res) {
						if (err) console.log('image not removed');
						console.log("image removed!");
					})
				});

				$('textarea#questionnaireSummary').editable({
					key: '1D4B3B3D9A2C4A4G3G3F3J3==',
					inlineMode: false,
					minHeight: 150,
					maxHeight: 300,
					imageUploadURL: '/api/upload'
				})// Catch image removal from the editor.
				.on('editable.afterRemoveImage', function (e, editor, $img) {
					Meteor.call('removeFroalaImage', $img.attr('src'), function (err, res) {
						if (err) console.log('image not removed');
						console.log("image removed!");
					})
				});*/

				$('.loader-bg').hide();
				//Meteor.setTimeout(function() {alert($('#questionnairehelper').length)
				if (typeof helper[0].en !== "undefined" && helper[0].en.length > 0) {
					$('#questionnairehelper').editable("setHTML", helper[0].en);
				}
				if (typeof summary[0].en !== "undefined" && summary[0].en.length > 0) {
					$('#questionnaireSummary').editable("setHTML", summary[0].en);
				}
				//}, 2000);

				$('ul.tabs').tabs();
			}
		});


		Session.set("questionnaireItem", completeArr);
	},
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
				helper: data.find("#questionnairehelper").value,
				questions: allQuestionArray,
				createdBy: Meteor.userId()
			};
			Meteor.call("insertQuestionnaire", questionnaireData, questionnaireSession[0].questionnaire._id, function (error, questionnaireId) {
				if (questionnaireId) {
					//Session.set('questionnaireSuccessMsg', 'Questionnaire added successfully!');

					Session.set("imgArr", "");
					Session.set("questionnaireItem", "");
					Session.set('allQuestion', '');
					$('#questionnairePopup').modal("close");
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
						console.log("filterQs::", filterQs);
						console.log("filterIndex::", filterIndex);
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
												console.log("fullArr::", fullArr)
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
	'click .deleteQuestionnaire': function (event, data) {
		if (confirm("Are you sure you want to delete?")) {
			var id = $(event.currentTarget).attr("id");
			catId = id.split('_');
			catData = { deleted: '1' };

			Meteor.call("insertQuestionnaire", catData, catId[1], function (error, catId) {
				if (catId) {
					Session.set("questionnaireListing", undefined);
					Session.set("questionnaireLoaded", false);
					//Router.go('/questionnaire');
				}
			});
		}

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

function tabbing() {
	$('ul.tabs').tabs();
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
