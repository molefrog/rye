$(document).ready(function () {	

var fieldOrderFirstRenderLimit 	= 12;
var fieldOrderRenderLimit 		= 32; 	
var fieldOrderLimit 			= 64;
var polynomsLimit				= 64;
	
// -------------------------------------------------------------------
// FieldModel class
//--------------------------------------------------------------------
FieldModel = Backbone.Model.extend({
	// Constructor
	initialize : function() {
		if(this.get('field').order < fieldOrderFirstRenderLimit) {
			this.set('renderMode', 'normal');
		} else {
			this.set('renderMode', 'indexes');
		}
		
		var ring = new PolynomRing(this.get('field'));
		this.polynoms = new PolynomsModel({ 'ring' : ring });
	},	

	// Validate function, will be called before each set
	validate : function(attrs) {
		if(attrs.field.order > fieldOrderRenderLimit 
		&& attrs.renderMode !== 'color'
		&& attrs.renderMode !== 'indexes') {
			return 'Sorry, field is too big!';
		}
	}
	
});  

// -------------------------------------------------------------------
// FieldStack collection
//--------------------------------------------------------------------
FieldStack = Backbone.Collection.extend({
	initialize : function() {
		this.bind('remove', this.removeEvent, this);
		this.bind('add', this.addEvent, this);
	},
	
	addEvent : function(model, collection, options) {
		model.set('index', options.index)
	},
	
	removeEvent : function(model, collection, options) {
		var nextModel = this.at(options.index);
		if(nextModel) {
			this.remove(nextModel);
			nextModel.destroy();
		}
		model.destroy();
	},
	
	model : FieldModel,
	
});

var Fields = new FieldStack;
    
// -------------------------------------------------------------------
// FieldView class
//--------------------------------------------------------------------				
FieldView = Backbone.View.extend({
	// Element tag name
	tagName : 'div',
	
	// Template that is used for rendering
	template : _.template($('#field_template').html()),

	// View constructor
    initialize : function() {
		this.model.bind('destroy', this.remove, this);
		this.model.bind('change:renderMode', this.render, this);
		this.model.polynoms.bind('change:currentPolynom', this.setCurrentPolynom, this);
		
		this.render();
    },
	
	setCurrentPolynom : function(model, poly) {
		Fields.remove(Fields.at(this.model.get('index')+1));
		Fields.add(new FieldModel({
			'field' : new FactorRing(poly.ring, poly)
		}));
	},
    
    events : {
		'click .button.mode_indexes' 	: function() {
			this.model.set('renderMode', 'indexes');
		},
		'click .button.mode_normal'		: function() {
			this.model.set('renderMode', 'normal');
		},
		'click .button.mode_nightmare' 	: function() {
			this.model.set('renderMode', 'nightmare');
		},
		'click .button.mode_color' 		: function() {
			this.model.set('renderMode', 'color');
		}, 
		'click .button.close' 			: function() {
			this.model.destroy();
		}
    },
	
    // This function renders view to the element
    render : function() {
		var field = this.model.get('field');
		var renderMode = this.model.get('renderMode');
		
		var fieldName = '';

		if(field.ring.field !== undefined) {
				var baseOrder = field.ring.field.order;
				var extOrder  = field.generator.degree();
				fieldName = '$ \\mathbb{F}_{' + baseOrder + '^' + extOrder + '}'
				+'= \\mathbb{F}_{' + baseOrder +'}[x]/(' + field.ring.toLatex(field.generator, {level:0}) +') $';
		} else {
			fieldName = '$ \\mathbb{F}_{' + field.order + '} = \\mathbb{Z}/' + field.order + '\\mathbb{Z} $';
		}		
		
		var latexOptions = {
			'normal'	: { },
			'nightmare' : { level : 2, modulo : true }
		};
		
		var elementRenderFunc;
		var indexRenderFunc;
		
		if(renderMode in latexOptions) {
			elementRenderFunc = function(i) {
				var textItem = $('<div>')
					.addClass('text_element')
					.text(latexify(field.toLatex(i, latexOptions[renderMode]))); 
				
				return $('<div>').append(textItem).remove().html();
			}
			
			indexRenderFunc = function(i) {
				var textItem = $('<div>')
					.addClass('text_element')
					.text(latexify(i)); 
				
				return $('<div>').append(textItem).remove().html();
			};
			
		} else if(renderMode === 'color') {
			elementRenderFunc = function(i) {
				var colorCode = (255 - Math.round(255.0 * i / field.order));
				var color = 'rgb(' + 0 + ',' + colorCode + ',' + colorCode + ')';
				
				var colorItem = $('<div>')
					.addClass('colored_element')
					.css('background-color', color); 
				
				return $('<div>').append(colorItem).remove().html();
			};
			
			indexRenderFunc = function(i) {
				return i;
			}
		} else if(renderMode === 'indexes') {
			elementRenderFunc = indexRenderFunc =  function(i) {
				var txt = isNaN(i) ? '-' : i;
				var textItem = $('<div>')
					.addClass('text_element')
					.text(txt); 
				
				return $('<div>').append(textItem).remove().html();
			}
		}
	
       this.$el.html(this.template({ 
			'field' 			: field,
			'fieldName'			: fieldName,
			'indexRender'		: indexRenderFunc,
			'elementRender'		: elementRenderFunc
       }));
	   
	   this.$('.mode_'+renderMode).addClass('selected');
	   
	   	var polynomsView = new PolynomsView({
			'el' 	: this.$('.polynoms_view_box'),
			'model' : this.model.polynoms
		});
        
        MathJax.Hub.Queue(['Typeset', MathJax.Hub]); 
    }
});

// -------------------------------------------------------------------
// PolynomsModel class
//--------------------------------------------------------------------
PolynomsModel = Backbone.Model.extend({
	defaults : {
		currentOrder : 0
	},
	
	initialize : function() {
		var ring = this.get('ring');
	
		var maxOrder = 1;
		while(Math.pow(ring.field.order, maxOrder) < fieldOrderLimit) {
			++maxOrder;
		}
		
		this.set('maxOrder', maxOrder);
	},
	
	validate : function(attrs) {
		if(attrs.currentOrder > this.get('maxOrder')) {
			return 'Order reached maximum value!';
		}
	}
});

// -------------------------------------------------------------------
// PolynomsView class
//--------------------------------------------------------------------
PolynomsView = Backbone.View.extend({
	// Element tag name
	tagName : 'div',
	
	// Template that is used for rendering
	template : _.template($('#polynoms_template').html()),
	
	// Events
	events : {
		'change .order_select' :function(e) {
			var newValue = parseInt(this.$(".order_select :selected").val());
			this.model.set('currentOrder', newValue);
		},

		'click .polynom_container' : function(e) {
			var field = this.model.get('ring').field;
			var index = $(e.currentTarget).index();
			index = Math.pow(field.order, this.model.get('currentOrder')) + index;
			
			var coef = baseExpand(index, field.order);
			var polynom = this.model.get('ring').polynom(coef);
			this.model.set('currentPolynom', polynom);
		}
	},
	
	
	initialize : function() {
		this.model.bind('change:currentOrder', this.render, this);
		
		this.render();
	},
	
	render : function() {
		var currentOrder = this.model.get('currentOrder');
		var ring = this.model.get('ring');
		
		this.$el.html(this.template());
		 
		 var that = this;
		_(_.range(1, this.model.get('maxOrder')+1)).each(function(i) {
			
			var listItem = $('<option>').attr('value', i).text(i);
				
			that.$('.order_select').append(listItem);
		});
		  
		this.$(".order_select [value='"+ currentOrder + "']")
			.attr("selected", "selected");
			
		if(currentOrder > 0) {
			var container = $('<div>');
			var startIndex = Math.pow(ring.field.order, currentOrder);
			var endIndex = Math.pow(ring.field.order, currentOrder+1);
		
			var i = 0;
			for(i = startIndex; i < endIndex; ++i) {
				var coefs = baseExpand(i, ring.field.order);
				var polynom = ring.polynom(coefs);
				
				var polyDiv = $('<div>')
					.addClass('polynom_container')
					.text(latexify(ring.toLatex(polynom, {level : 0})));
					
				if(isIrreducible(ring, polynom)) {
					polyDiv.addClass('irreducible_polynom');
				}
				
				container.append(polyDiv);
				
				if(i-startIndex >= polynomsLimit-1) {
					container.append($('<span>').text('...'));
					break;
				}
			}
			
			
			container.appendTo(this.$('.polynoms_list'));
		}	
			
		
		
		MathJax.Hub.Queue(['Typeset', MathJax.Hub]); 
		return this;
	}
});


// -------------------------------------------------------------------
// Application view
//--------------------------------------------------------------------	
AppView = Backbone.View.extend({
	el : $('#application_view'),
	
	events : {
		'change .prime_order_select' : function(e) {
			var newValue = parseInt(this.$(".prime_order_select :selected").val());
			
			Fields.each(function(field) {
				field.destroy();
				Fields.remove(field);
			});
			
			
			if(newValue > 1) {
				var newField = new PrimeField(newValue);
				var newFieldModel = new FieldModel({ field : newField });
				Fields.add(newFieldModel);
			}
			
		}
	},
	
	initialize: function() {	
		Fields.bind('add', this.addField, this);
		var that = this;
		_([2,3,5,7,11]).each(function(i) {
			var listItem = $('<option>').attr('value', i).text(i);
				
			that.$('.prime_order_select').append(listItem);
		});
    },
	
	addField : function(field) {
		var d = $('<div>');
		this.$('#fields_list').append(d);
		
		var view = new FieldView({
			el 		: d,
			model	: field
		});
		
		}	
	});

	var App = new AppView;
});

// -------------------------------------------------------------------
// Utility functions
//--------------------------------------------------------------------	
function latexify(str) {
	return '$' + str + '$';
}

function isIrreducible(ring, poly) {
	var hasRoots =  _(_.range(0, ring.field.order)).any(function(a) {
		return poly.app(a) === ring.field.nullElement();
	});
	
	if(hasRoots) {
		return false;
	}
	
	var i = 0;
	var start_value = Math.pow(ring.field.order, 1);
	var end_value = Math.pow(ring.field.order, poly.degree());
	
	for(i = start_value; i < end_value; ++i) {
		var divPoly = ring.polynom(baseExpand(i, ring.field.order));
		
		if(ring.norm(ring.mod(poly, divPoly)) === -Infinity) {
			return false;
		}
	}
	return true;
}
